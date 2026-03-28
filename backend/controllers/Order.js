const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Address = require("../models/Address");
const couponController = require("./Coupon");
const LoyaltyPoint = require("../models/LoyaltyPoint");
const { _awardLoyaltyForOrderPaid, _recordProductPurchaseEvents } = require("./Payments");
const notificationController = require("./Notification");
const InventoryHistory = require("../models/InventoryHistory");
const inventoryHelper = require("../utils/inventoryHelper");
const { recordAuditLog } = require("../utils/auditHelper");

const getLoyaltyBalance = async (userId) => {
    const r = await LoyaltyPoint.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: "$delta" } } },
    ]).exec();
    return r[0]?.total ?? 0;
};

const POINTS_PER_DOLLAR = 100;

exports.create = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const userId = req.user?._id;

        const paymentMode = req.body?.paymentMode;
        if (!["COD", "UPI", "CARD", "STRIPE", "PAYPAL", "MOBILE_MONEY", "ORANGE_MONEY"].includes(paymentMode)) {
            return res.status(400).json({ message: "Invalid payment mode" });
        }

        // Resolve address (must belong to the logged-in user)
        const addressId = req.body?.address?._id || req.body?.address;
        let addressDoc = null;
        if (addressId) {
            addressDoc = await Address.findOne({ _id: addressId, user: userId }).lean();
        }
        if (!addressDoc) {
            return res.status(400).json({ message: "Valid shipping address is required" });
        }

        // Always build the order from the server-side cart to prevent tampering.
        const cartItems = await Cart.find({ user: userId })
            .populate({ path: "product", populate: { path: "brand" } })
            .lean()
            .exec();

        if (!cartItems.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const shippingFee = Number(process.env.SHIPPING_FEE ?? 0);
        const taxesFee = Number(process.env.TAXES_FEE ?? 0);

        const orderItems = cartItems.map((ci) => ({
            product: ci.product._id,
            quantity: ci.quantity,
            unitPrice: ci.product?.price || 0
        }));

        const itemsTotal = cartItems.reduce((sum, ci) => {
            const price = Number(ci.product?.price ?? 0);
            const qty = Number(ci.quantity ?? 0);
            return sum + (price * qty);
        }, 0);

        let discount = 0;
        let couponCodeStored = null;
        const couponCode = req.body?.couponCode ? String(req.body.couponCode).toUpperCase().trim() : null;
        if (couponCode) {
            const Coupon = require("../models/Coupon");
            const coupon = await Coupon.findOne({ code: couponCode }).lean().exec();
            if (coupon && couponController._isCouponActive && couponController._computeDiscountForOrder) {
                if (couponController._isCouponActive(coupon)) {
                    discount = couponController._computeDiscountForOrder(coupon, itemsTotal);
                    couponCodeStored = couponCode;
                }
            }
        }
        let loyaltyDiscount = 0;
        let loyaltyPointsRedeemed = 0;
        const pointsToRedeem = Math.floor(Number(req.body?.loyaltyPointsToRedeem) || 0);
        if (pointsToRedeem > 0) {
            const balance = await getLoyaltyBalance(userId);
            const toUse = Math.min(pointsToRedeem, Math.max(0, balance));
            if (toUse > 0) {
                loyaltyPointsRedeemed = toUse;
                loyaltyDiscount = toUse / POINTS_PER_DOLLAR;
            }
        }
        const total = Math.max(0, itemsTotal - discount - loyaltyDiscount + shippingFee + taxesFee);

        const paymentStatus = paymentMode === "COD" ? "UNPAID" : "PENDING"
        const paymentProvider =
            paymentMode === "COD" ? "COD"
                : paymentMode === "STRIPE" ? "STRIPE"
                    : paymentMode === "PAYPAL" ? "PAYPAL"
                        : paymentMode === "ORANGE_MONEY" ? "ORANGE_MONEY"
                            : paymentMode === "MOBILE_MONEY" ? "MOBILE_MONEY"
                                : "COD"

        const created = new Order({
            user: userId,
            item: orderItems,
            address: [addressDoc],
            paymentMode,
            paymentStatus,
            paymentProvider,
            total,
            couponCode: couponCodeStored,
            discount,
            loyaltyPointsRedeemed,
        });

        await session.withTransaction(async () => {
            // Use the helper to decrement stock AND log history for each item
            for (const ci of cartItems) {
                const productId = ci.product?._id;
                const qty = Number(ci.quantity ?? 0);
                await inventoryHelper.decrementStockAndLog(productId, qty, created, session);
            }

            await created.save({ session });

            await Cart.deleteMany({ user: userId }).session(session).exec();

            if (loyaltyPointsRedeemed > 0) {
                await LoyaltyPoint.create({
                    user: userId,
                    delta: -loyaltyPointsRedeemed,
                    points: 0,
                    reason: "redeem",
                    orderRef: created._id,
                }).session(session).exec();
            }
        });

        res.status(201).json(created);

            // Send Notifications (non-blocking)
            (async () => {
                try {
                    // 1. Notify Buyer
                    await notificationController.createNotification({
                        title: "Order Placed Successfully",
                        body: `Your order #${created._id.toString().slice(-6).toUpperCase()} has been placed.`,
                        recipient: userId,
                        type: "order",
                        urgancy: "medium",
                        link: "/orders",
                        createdBy: userId
                    });

                    // 2. Notify Sellers
                    const sellerIds = new Set(cartItems.map(ci => ci.product?.seller?.toString()).filter(id => id));
                    for (const sellerId of sellerIds) {
                        await notificationController.createNotification({
                            title: "New Order Received",
                            body: "You have a new order to fulfill.",
                            recipient: sellerId,
                            type: "order",
                            urgancy: "high",
                            link: "/seller/orders",
                            createdBy: userId
                        });
                    }
                } catch (notiErr) {
                    console.log("Order creation notification error:", notiErr);
                }
            })();
    } catch (error) {
        console.log(error);
        const msg = typeof error?.message === "string" ? error.message : null;
        if (msg && (msg.includes("Insufficient stock") || msg.includes("Invalid cart item"))) {
            return res.status(400).json({ message: msg });
        }
        return res.status(500).json({ message: 'Error creating an order, please trying again later' })
    } finally {
        session.endSession();
    }
}

exports.createGuest = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const guestEmail = req.body?.guestEmail
        const address = req.body?.address
        const items = req.body?.items
        const paymentMode = req.body?.paymentMode || "COD"

        if (!guestEmail) {
            return res.status(400).json({ message: "guestEmail is required" })
        }
        if (!address || typeof address !== "object") {
            return res.status(400).json({ message: "address is required" })
        }
        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ message: "items are required" })
        }
        if (paymentMode !== "COD") {
            return res.status(400).json({ message: "Guest orders only support COD here. Use /payments/*/guest for online payments." })
        }

        const shippingFee = Number(process.env.SHIPPING_FEE ?? 0);
        const taxesFee = Number(process.env.TAXES_FEE ?? 0);

        const normalized = items.map((it) => ({
            productId: it.productId || it.product || it._id,
            quantity: Number(it.quantity || 1)
        }))

        const productIds = normalized.map((n) => n.productId)
        const products = await Product.find({ _id: { $in: productIds }, isDeleted: false }).populate("brand").populate("category").lean().exec()
        const byId = new Map(products.map((p) => [String(p._id), p]))
        const orderItems = normalized.map((it) => {
            const p = byId.get(String(it.productId))
            if (!p) throw new Error("Invalid product in cart")
            return { 
                product: p._id, 
                quantity: it.quantity,
                unitPrice: p.price || 0 
            }
        })
        const itemsTotal = orderItems.reduce((sum, it) => sum + Number(it.product?.price || 0) * Number(it.quantity || 0), 0)
        const total = itemsTotal + shippingFee + taxesFee

        const createdOrder = new Order({
            guestEmail,
            item: orderItems,
            address: [address],
            paymentMode: "COD",
            paymentStatus: "UNPAID",
            paymentProvider: "COD",
            currency: (process.env.CURRENCY || "USD").toUpperCase(),
            total
        })

        await session.withTransaction(async () => {
            for (const it of normalized) {
                // Use the helper to decrement stock AND log history
                await inventoryHelper.decrementStockAndLog(it.productId, it.quantity, createdOrder, session);
            }
            await createdOrder.save({ session })
        })

        return res.status(201).json(createdOrder)
    } catch (error) {
        console.log(error)
        const msg = String(error?.message || "")
        if (msg.includes("Invalid") || msg.includes("Insufficient")) {
            return res.status(400).json({ message: msg })
        }
        return res.status(500).json({ message: "Error creating guest order" })
    } finally {
        session.endSession()
    }
}

exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" })
        }
        const orders = await Order.find({ user: id }).sort({ createdAt: -1 }).lean().exec()
        const productIds = new Set()

        orders.forEach(order => {
            order.item?.forEach(it => {
                const itProd = it.product
                const pId = itProd?._id || (typeof itProd === 'string' ? itProd : null)
                if (pId && mongoose.Types.ObjectId.isValid(pId)) {
                    productIds.add(String(pId))
                }
            })
        })

        if (productIds.size > 0) {
            const products = await Product.find({ _id: { $in: Array.from(productIds) } }).populate("brand").lean().exec()
            const prodMap = new Map(products.map(p => [String(p._id), p]))

            orders.forEach(order => {
                order.item?.forEach(it => {
                    const pId = String(it.product?._id || it.product || '')
                    const liveProd = prodMap.get(pId)
                    if (liveProd) {
                        // If it's just a string, Replace it with the live object
                        if (typeof it.product === 'string' || !it.product?.title) {
                            it.product = liveProd
                        } else {
                            // Supplement snapshot with live data if fields are missing
                            it.product.images = it.product.images?.length ? it.product.images : liveProd.images
                            it.product.thumbnail = it.product.thumbnail || liveProd.thumbnail
                            it.product.title = it.product.title || liveProd.title
                            it.product.brand = it.product.brand || liveProd.brand
                        }
                    }
                })
            })
        }

        res.status(200).json(orders)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error fetching orders, please trying again later' })
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).exec()
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }
        // owner/admin check
        if (!req.user?.isAdmin && String(order.user) !== String(req.user?._id)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        return res.status(200).json(order)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching order" })
    }
}

exports.getAll = async (req, res) => {
    try {
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page
            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const totalDocs = await Order.find({}).countDocuments().exec()
        const results = await Order.find({}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count", totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching orders, please try again later' })
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id).exec()
        if (!order) {
            return res.status(404).json({ message: "Order not found" })
        }

        // Permission Check: Admin can do anything.
        // Buyer can update (e.g., cancel before confirmation).
        // Seller can update if they own a product in this order.
        let canUpdate = req.user?.isAdmin || String(order.user) === String(req.user?._id);

        if (!canUpdate && req.user?.role === 'seller') {
            const sellerIdStr = String(req.user?._id)
            const hasSellerProduct = order.item.some(it => {
                const prodSellerId = it.product?.seller?._id || it.product?.seller || it.product?.sellerId
                return String(prodSellerId) === sellerIdStr
            });
            if (hasSellerProduct) canUpdate = true;
        }

        if (!canUpdate) {
            return res.status(403).json({ message: "Forbidden: You do not have permission to update this order." });
        }

        const prevStatus = order.status
        if (typeof req.body?.status === "string") {
            order.status = req.body.status
        }
        if (typeof req.body?.trackingNumber === "string") {
            order.trackingNumber = req.body.trackingNumber
        }
        if (typeof req.body?.carrierName === "string") {
            order.carrierName = req.body.carrierName
        }

        const updated = await order.save()

        // Record Audit Log
        recordAuditLog({
            user: req.user._id,
            action: "UPDATE_ORDER",
            targetType: "Order",
            targetId: order._id,
            description: `Order ${order._id} status updated from ${prevStatus} to ${order.status}`,
            details: { prevStatus, nextStatus: order.status, trackingNumber: order.trackingNumber, carrierName: order.carrierName }
        }, req);

        // Notify Buyer on status change
        if (req.body?.status && req.body.status !== prevStatus) {
            try {
                const statusMessages = {
                    "Pending": "Your order is currently pending.",
                    "Confirmed": "Your order has been confirmed by the seller.",
                    "Shipped": "Your order has been shipped and is on its way.",
                    "Out for Delivery": "Your order is out for delivery!",
                    "Delivered": "Your order has been delivered successfully.",
                    "Cancelled": "Your order has been cancelled.",
                    "Returned": "Your order return has been processed."
                };

                let body = statusMessages[req.body.status] || `Your order #${order._id.toString().slice(-6).toUpperCase()} status is now: ${order.status}`;
                if (req.body.status === "Shipped" && order.trackingNumber) {
                    body += ` Tracking: ${order.trackingNumber} (${order.carrierName || 'Carrier unknown'})`;
                }

                await notificationController.createNotification({
                    title: `Order ${req.body.status}`,
                    body,
                    recipient: order.user,
                    type: "order",
                    urgancy: "medium",
                    link: "/orders",
                    createdBy: req.user?._id
                });
            } catch (notiErr) {
                console.log("Order status update notification error:", notiErr);
            }
        }

        // When COD orders are marked Delivered for the first time,
        // award loyalty points in the same way as for online payments.
        if (
            prevStatus !== "Delivered" &&
            updated.status === "Delivered" &&
            updated.paymentMode === "COD" &&
            updated.user
        ) {
            try {
                const existing = await LoyaltyPoint.findOne({
                    user: updated.user,
                    reason: "order",
                    orderRef: updated._id,
                }).lean().exec()

                if (!existing && typeof _awardLoyaltyForOrderPaid === "function") {
                    await _awardLoyaltyForOrderPaid(updated)
                }
                if (typeof _recordProductPurchaseEvents === "function") {
                    await _recordProductPurchaseEvents(updated)
                }
            } catch (e) {
                // do not fail the request if loyalty awarding fails
                console.log("Error awarding COD loyalty", e)
            }
        }

        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating order, please try again later' })
    }
}

exports.getStaleOrders = async (req, res) => {
    try {
        const threeDaysAgo = new Date()
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

        const staleOrders = await Order.find({
            status: { $in: ["Pending", "Confirmed"] },
            createdAt: { $lt: threeDaysAgo }
        })
        .populate("user", "name email")
        .sort({ createdAt: 1 }) // Oldest first

        res.status(200).json(staleOrders)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching stale orders" })
    }
}

exports.getTrackingInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id).exec();
        if (!order || !order.trackingNumber) {
            return res.status(404).json({ message: "No tracking info available" });
        }

        // Hit the mock logistics API
        const axios = require("axios");
        const port = process.env.PORT || 8000;
        const resp = await axios.get(`http://localhost:${port}/logistics/track/${order.trackingNumber}`);
        
        res.status(200).json(resp.data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching tracking details" });
    }
};
