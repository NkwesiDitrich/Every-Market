const Stripe = require("stripe");
const axios = require("axios");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const LoyalPoint = require("../models/LoyaltyPoint");
const SellerProfile = require("../models/SellerProfile");
const notificationController = require("./Notification");
const inventoryHelper = require("../utils/inventoryHelper");

/** Points earned per 1 dollar spent */
const POINTS_EARNED_PER_DOLLAR = 10;
/** Points required per 1 dollar discount when redeeming */
const POINTS_PER_DOLLAR_REDEEM = 100;

const awardLoyaltyForOrderPaid = async (order) => {
  if (!order?.user) return;
  const points = Math.floor(Number(order.total || 0) * POINTS_EARNED_PER_DOLLAR);
  if (points <= 0) return;
  await LoyaltyPoint.create({
    user: order.user,
    delta: points,
    points: 0,
    reason: "order",
    orderRef: order._id,
  }).catch(() => { });
};
// internal export so other controllers (e.g. Order update for COD)
// can award loyalty using the same rules
exports._awardLoyaltyForOrderPaid = awardLoyaltyForOrderPaid;

const ProductEvent = require("../models/ProductEvent");
const recordProductPurchaseEvents = async (order) => {
  if (!order?.item?.length) return;
  for (const line of order.item) {
    const productId = line?.product?._id || line?.product;
    if (!productId) continue;
    await ProductEvent.create({
      product: productId,
      eventType: "purchase",
      user: order.user || null,
    }).catch(() => { });
  }
};
exports._recordProductPurchaseEvents = recordProductPurchaseEvents;

const getCurrency = () => (process.env.CURRENCY || "usd").toLowerCase();

const moneyToStripeAmount = (n) => {
  const v = Number(n || 0);
  return Math.max(0, Math.round(v * 100));
};

const couponController = require("./Coupon");

const getLoyaltyBalance = async (userId) => {
  const r = await LoyaltyPoint.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: "$delta" } } },
  ]).exec();
  return r[0]?.total ?? 0;
};

const buildOrderFromCart = async ({ userId, addressId, paymentMode, couponCode, loyaltyPointsToRedeem, session }) => {
  const addressDoc = await Address.findOne({ _id: addressId, user: userId }).lean();
  if (!addressDoc) {
    const err = new Error("Valid shipping address is required");
    err.statusCode = 400;
    throw err;
  }

  const cartItems = await Cart.find({ user: userId })
    .populate({ path: "product", populate: { path: "brand" } })
    .populate({ path: "product", populate: { path: "seller" } })
    .exec();

  if (!cartItems.length) {
    const err = new Error("Cart is empty");
    err.statusCode = 400;
    throw err;
  }

  const shippingFee = Number(process.env.SHIPPING_FEE ?? 0);
  const taxesFee = Number(process.env.TAXES_FEE ?? 0);

  // Pre-fetch all seller profiles for these items to get commission rates
  const uniqueSellerIds = [...new Set(cartItems.map(ci => ci.product?.seller?._id || ci.product?.seller).filter(id => id))];
  const sellerProfiles = await SellerProfile.find({ user: { $in: uniqueSellerIds } }).lean();
  const commissionMap = {};
  sellerProfiles.forEach(p => { commissionMap[String(p.user)] = p.commissionRate || 10; });

  let commissionTotal = 0;

  const orderItems = cartItems.map((ci) => {
    const price = Number(ci.product?.price ?? 0);
    const qty = Number(ci.quantity ?? 0);
    const sellerId = String(ci.product?.seller?._id || ci.product?.seller);
    const rate = commissionMap[sellerId] || 10;
    const commissionAmount = (price * qty * rate) / 100;
    const payout = (price * qty) - commissionAmount;

    commissionTotal += commissionAmount;

    return {
      product: ci.product,
      quantity: ci.quantity,
      unitPrice: price,
      commissionRate: rate,
      commissionAmount,
      sellerPayout: payout
    };
  });

  let itemsTotal = cartItems.reduce((sum, ci) => {
    const price = Number(ci.product?.price ?? 0);
    const qty = Number(ci.quantity ?? 0);
    return sum + price * qty;
  }, 0);

  let discount = 0;
  let couponCodeStored = null;
  const code = couponCode ? String(couponCode).toUpperCase().trim() : null;
  if (code) {
    const Coupon = require("../models/Coupon");
    const coupon = await Coupon.findOne({ code }).lean().exec();
    if (coupon && couponController._isCouponActive && couponController._computeDiscountForOrder) {
      if (couponController._isCouponActive(coupon)) {
        let subtotalForDiscount = itemsTotal;
        if (coupon.seller) {
          const sellerItems = cartItems.filter((ci) => String(ci.product?.seller) === String(coupon.seller));
          if (sellerItems.length > 0) {
            subtotalForDiscount = sellerItems.reduce((sum, ci) => {
              const price = Number(ci.product?.price ?? 0);
              const qty = Number(ci.quantity ?? 0);
              return sum + price * qty;
            }, 0);
          }
        }
        discount = couponController._computeDiscountForOrder(coupon, subtotalForDiscount);
        couponCodeStored = code;
      }
    }
  }
  let loyaltyDiscount = 0;
  let loyaltyPointsRedeemed = 0;
  const pointsToRedeem = Math.floor(Number(loyaltyPointsToRedeem) || 0);
  if (pointsToRedeem > 0) {
    const balance = await getLoyaltyBalance(userId);
    const toUse = Math.min(pointsToRedeem, Math.max(0, balance));
    if (toUse > 0) {
      loyaltyPointsRedeemed = toUse;
      loyaltyDiscount = toUse / POINTS_PER_DOLLAR_REDEEM;
    }
  }
  const total = Math.max(0, itemsTotal - discount - loyaltyDiscount + shippingFee + taxesFee);

  const paymentProvider =
    paymentMode === "STRIPE"
      ? "STRIPE"
      : paymentMode === "PAYPAL"
        ? "PAYPAL"
        : paymentMode === "ORANGE_MONEY"
          ? "ORANGE_MONEY"
          : paymentMode === "MOBILE_MONEY"
            ? "MOBILE_MONEY"
            : "COD";

  const order = new Order({
    user: userId,
    item: orderItems,
    address: [addressDoc],
    paymentMode,
    paymentStatus: paymentMode === "COD" ? "UNPAID" : "PENDING",
    paymentProvider,
    currency: getCurrency().toUpperCase(),
    total,
    commissionTotal,
    netProfit: commissionTotal, // Net profit is the commission we take
    couponCode: couponCodeStored,
    discount,
    loyaltyPointsRedeemed,
  });

  // Reserve stock by decrementing immediately (simple approach).
  // If you later add "auto-cancel unpaid orders", you'll also add restocking.
  for (const ci of cartItems) {
    const productId = ci.product?._id;
    const qty = Number(ci.quantity ?? 0);
    if (!productId || qty <= 0) {
      const err = new Error("Invalid cart item");
      err.statusCode = 400;
      throw err;
    }
    
    // Use the core inventory helper
    await inventoryHelper.decrementStockAndLog(productId, qty, order, session);
  }

  await order.save({ session });
  await Cart.deleteMany({ user: userId }).session(session).exec();

  if (loyaltyPointsRedeemed > 0) {
    await LoyaltyPoint.create({
      user: userId,
      delta: -loyaltyPointsRedeemed,
      points: 0,
      reason: "redeem",
      orderRef: order._id,
    }).session(session).exec();
  }

  // Send Notifications (non-blocking)
  (async () => {
    try {
      // 1. Notify Buyer
      await notificationController.createNotification({
        title: "Order Placed Successfully",
        body: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed and is awaiting payment.`,
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
          body: "You have a new order awaiting payment confirmation.",
          recipient: sellerId,
          type: "order",
          urgancy: "high",
          link: "/seller/orders",
          createdBy: userId
        });
      }
    } catch (notiErr) {
      console.log("Order placement notification error:", notiErr);
    }
  })();

  return { order, cartItems, shippingFee, taxesFee, itemsTotal };
};

const buildOrderFromGuest = async ({ guestEmail, address, items, paymentMode, session }) => {
  if (!guestEmail) {
    const err = new Error("guestEmail is required");
    err.statusCode = 400;
    throw err;
  }
  if (!address || typeof address !== "object") {
    const err = new Error("address is required");
    err.statusCode = 400;
    throw err;
  }
  if (!Array.isArray(items) || !items.length) {
    const err = new Error("items are required");
    err.statusCode = 400;
    throw err;
  }

  const shippingFee = Number(process.env.SHIPPING_FEE ?? 0);
  const taxesFee = Number(process.env.TAXES_FEE ?? 0);

  // Fetch products and build snapshots
  const normalized = items.map((it) => ({
    productId: it.productId || it.product || it._id,
    quantity: Number(it.quantity || 1),
  }));

  const productIds = normalized.map((n) => n.productId);
  const products = await Product.find({ _id: { $in: productIds }, isDeleted: false })
    .populate("brand")
    .populate("category")
    .exec();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  // Pre-fetch all seller profiles for these products
  const uniqueSellerIds = [...new Set(products.map(p => p.seller?._id || p.seller).filter(id => id))];
  const sellerProfiles = await SellerProfile.find({ user: { $in: uniqueSellerIds } }).lean();
  const commissionMap = {};
  sellerProfiles.forEach(p => { commissionMap[String(p.user)] = p.commissionRate || 10; });

  let commissionTotal = 0;

  const orderItems = [];
  for (const it of normalized) {
    const p = byId.get(String(it.productId));
    if (!p) {
      const err = new Error("Invalid product in cart");
      err.statusCode = 400;
      throw err;
    }
    if (it.quantity <= 0) {
      const err = new Error("Invalid quantity");
      err.statusCode = 400;
      throw err;
    }

    const price = Number(p.price || 0);
    const qty = Number(it.quantity || 0);
    const sellerId = String(p.seller?._id || p.seller);
    const rate = commissionMap[sellerId] || 10;
    const commissionAmount = (price * qty * rate) / 100;
    const payout = (price * qty) - commissionAmount;

    commissionTotal += commissionAmount;

    orderItems.push({
      product: p,
      quantity: it.quantity,
      unitPrice: price,
      commissionRate: rate,
      commissionAmount,
      sellerPayout: payout
    });
  }

  const itemsTotal = orderItems.reduce((sum, it) => sum + Number(it.product?.price || 0) * Number(it.quantity || 0), 0);
  const total = itemsTotal + shippingFee + taxesFee;

  const paymentProvider =
    paymentMode === "STRIPE"
      ? "STRIPE"
      : paymentMode === "PAYPAL"
        ? "PAYPAL"
        : paymentMode === "ORANGE_MONEY"
          ? "ORANGE_MONEY"
          : paymentMode === "MOBILE_MONEY"
            ? "MOBILE_MONEY"
            : "COD";

  const order = new Order({
    guestEmail,
    item: orderItems,
    address: [address],
    paymentMode,
    paymentStatus: paymentMode === "COD" ? "UNPAID" : "PENDING",
    paymentProvider,
    currency: getCurrency().toUpperCase(),
    total,
    commissionTotal,
    netProfit: commissionTotal
  });

  for (const it of normalized) {
    const p = byId.get(String(it.productId));
    if (!p) {
      const err = new Error("Invalid product in cart");
      err.statusCode = 400;
      throw err;
    }
    if (it.quantity <= 0) {
      const err = new Error("Invalid quantity");
      err.statusCode = 400;
      throw err;
    }
    
    // Use the core inventory helper
    await inventoryHelper.decrementStockAndLog(p._id, it.quantity, order, session);
  }

  await order.save({ session });
  return { order, orderItems, shippingFee, taxesFee, itemsTotal };
};

exports.createStripeCheckoutSession = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user?._id;
    const addressId = req.body?.addressId;
    if (!addressId) return res.status(400).json({ message: "addressId is required" });

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return res.status(500).json({ message: "Stripe is not configured" });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromCart({
        userId,
        addressId,
        paymentMode: "STRIPE",
        couponCode: req.body?.couponCode,
        loyaltyPointsToRedeem: req.body?.loyaltyPointsToRedeem,
        session,
      });
    });

    const { order, cartItems, shippingFee, taxesFee } = created;
    const currency = getCurrency();

    const line_items = cartItems.map((ci) => ({
      quantity: Number(ci.quantity || 1),
      price_data: {
        currency,
        product_data: {
          name: ci.product?.title || "Product",
        },
        unit_amount: moneyToStripeAmount(ci.product?.price || 0),
      },
    }));

    if (shippingFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency,
          product_data: { name: "Shipping" },
          unit_amount: moneyToStripeAmount(shippingFee),
        },
      });
    }
    if (taxesFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency,
          product_data: { name: "Taxes" },
          unit_amount: moneyToStripeAmount(taxesFee),
        },
      });
    }
    if (order.discount > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency,
          product_data: { name: `Discount (${order.couponCode || "Coupon"})` },
          unit_amount: -moneyToStripeAmount(order.discount),
        },
      });
    }

    const successUrl = `${process.env.ORIGIN}/payment/success?provider=stripe&orderId=${order._id}`;
    const cancelUrl = `${process.env.ORIGIN}/payment/cancel?provider=stripe&orderId=${order._id}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orderId: String(order._id) },
    });

    await Order.findByIdAndUpdate(order._id, { paymentReference: checkout.id }).exec();
    return res.status(200).json({ url: checkout.url });
  } catch (error) {
    console.log(error);
    const code = error?.statusCode || 500;
    return res.status(code).json({ message: error?.message || "Error creating Stripe session" });
  } finally {
    session.endSession();
  }
};

exports.createStripeCheckoutSessionGuest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return res.status(500).json({ message: "Stripe is not configured" });
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    const guestEmail = req.body?.guestEmail;
    const address = req.body?.address;
    const items = req.body?.items;

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromGuest({
        guestEmail,
        address,
        items,
        paymentMode: "STRIPE",
        session,
      });
    });

    const { order, orderItems, shippingFee, taxesFee } = created;
    const currency = getCurrency();

    const line_items = orderItems.map((it) => ({
      quantity: Number(it.quantity || 1),
      price_data: {
        currency,
        product_data: { name: it.product?.title || "Product" },
        unit_amount: moneyToStripeAmount(it.product?.price || 0),
      },
    }));

    if (shippingFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency, product_data: { name: "Shipping" }, unit_amount: moneyToStripeAmount(shippingFee) },
      });
    }
    if (taxesFee > 0) {
      line_items.push({
        quantity: 1,
        price_data: { currency, product_data: { name: "Taxes" }, unit_amount: moneyToStripeAmount(taxesFee) },
      });
    }

    const successUrl = `${process.env.ORIGIN}/payment/success?provider=stripe&orderId=${order._id}`;
    const cancelUrl = `${process.env.ORIGIN}/payment/cancel?provider=stripe&orderId=${order._id}`;

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: guestEmail,
      metadata: { orderId: String(order._id) },
    });

    await Order.findByIdAndUpdate(order._id, { paymentReference: checkout.id }).exec();
    return res.status(200).json({ url: checkout.url, orderId: String(order._id) });
  } catch (error) {
    console.log(error);
    const code = error?.statusCode || 500;
    return res.status(code).json({ message: error?.message || "Error creating Stripe session" });
  } finally {
    session.endSession();
  }
};

exports.stripeWebhook = async (req, res) => {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeSecret || !webhookSecret) return res.sendStatus(500);

    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log("Stripe webhook signature verification failed", err?.message);
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session?.metadata?.orderId;
      if (orderId) {
        const ord = await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "PAID",
          paidAt: new Date(),
          paymentReference: session.id,
          paymentProvider: "STRIPE",
        }, { new: true }).exec();
        if (ord) {
          await awardLoyaltyForOrderPaid(ord);
          await recordProductPurchaseEvents(ord);

          // Notify Buyer
          await notificationController.createNotification({
            title: "Payment Successful",
            body: `Payment for order #${ord._id.toString().slice(-6).toUpperCase()} was successful.`,
            recipient: ord.user,
            type: "payment",
            urgancy: "medium",
            link: "/orders",
            createdBy: ord.user
          }).catch(() => {});
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

const paypalBaseUrl = () => process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

const paypalAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal is not configured");

  const res = await axios.post(
    `${paypalBaseUrl()}/v1/oauth2/token`,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      auth: { username: clientId, password: secret },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return res.data.access_token;
};

exports.createPayPalOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user?._id;
    const addressId = req.body?.addressId;
    if (!addressId) return res.status(400).json({ message: "addressId is required" });

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromCart({
        userId,
        addressId,
        paymentMode: "PAYPAL",
        couponCode: req.body?.couponCode,
        loyaltyPointsToRedeem: req.body?.loyaltyPointsToRedeem,
        session,
      });
    });

    const { order } = created;
    const token = await paypalAccessToken();

    const amount = Number(order.total || 0).toFixed(2);
    const currency = (order.currency || "USD").toUpperCase();
    const returnUrl = `${process.env.ORIGIN}/payment/paypal/return?orderId=${order._id}`;
    const cancelUrl = `${process.env.ORIGIN}/payment/cancel?provider=paypal&orderId=${order._id}`;

    const pp = await axios.post(
      `${paypalBaseUrl()}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: amount } }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: "PAY_NOW",
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const paypalOrderId = pp.data.id;
    const approve = (pp.data.links || []).find((l) => l.rel === "approve")?.href;

    await Order.findByIdAndUpdate(order._id, {
      paymentReference: paypalOrderId,
      paymentProvider: "PAYPAL",
      paymentStatus: "PENDING",
    }).exec();

    return res.status(200).json({ url: approve });
  } catch (error) {
    console.log(error?.response?.data || error);
    return res.status(500).json({ message: "Error creating PayPal order" });
  } finally {
    session.endSession();
  }
};

exports.createPayPalOrderGuest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const guestEmail = req.body?.guestEmail;
    const address = req.body?.address;
    const items = req.body?.items;

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromGuest({
        guestEmail,
        address,
        items,
        paymentMode: "PAYPAL",
        session,
      });
    });

    const { order } = created;
    const token = await paypalAccessToken();

    const amount = Number(order.total || 0).toFixed(2);
    const currency = (order.currency || "USD").toUpperCase();
    const returnUrl = `${process.env.ORIGIN}/payment/paypal/return?orderId=${order._id}`;
    const cancelUrl = `${process.env.ORIGIN}/payment/cancel?provider=paypal&orderId=${order._id}`;

    const pp = await axios.post(
      `${paypalBaseUrl()}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: currency, value: amount } }],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: "PAY_NOW",
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const paypalOrderId = pp.data.id;
    const approve = (pp.data.links || []).find((l) => l.rel === "approve")?.href;

    await Order.findByIdAndUpdate(order._id, {
      paymentReference: paypalOrderId,
      paymentProvider: "PAYPAL",
      paymentStatus: "PENDING",
    }).exec();

    return res.status(200).json({ url: approve, orderId: String(order._id) });
  } catch (error) {
    console.log(error?.response?.data || error);
    return res.status(500).json({ message: "Error creating PayPal order" });
  } finally {
    session.endSession();
  }
};

exports.capturePayPalOrder = async (req, res) => {
  try {
    const orderId = req.body?.orderId;
    if (!orderId) return res.status(400).json({ message: "orderId is required" });

    const order = await Order.findById(orderId).exec();
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentProvider !== "PAYPAL") return res.status(400).json({ message: "Not a PayPal order" });

    const token = await paypalAccessToken();
    const paypalOrderId = order.paymentReference;
    const cap = await axios.post(
      `${paypalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const status = String(cap.data.status || "");
    if (status === "COMPLETED") {
      const ord = await Order.findByIdAndUpdate(orderId, { paymentStatus: "PAID", paidAt: new Date() }, { new: true }).exec();
      if (ord) {
        await awardLoyaltyForOrderPaid(ord);
        await recordProductPurchaseEvents(ord);

        // Notify Buyer
        await notificationController.createNotification({
          title: "Payment Successful",
          body: `Payment for order #${ord._id.toString().slice(-6).toUpperCase()} was successful.`,
          recipient: ord.user,
          type: "payment",
          urgancy: "medium",
          link: "/orders",
          createdBy: ord.user
        }).catch(() => {});
      }
      return res.status(200).json({ message: "Payment captured" });
    }
    await Order.findByIdAndUpdate(orderId, { paymentStatus: "FAILED" }).exec();
    // Notify Buyer on failure
    await notificationController.createNotification({
      title: "Payment Failed",
      body: `Payment for order #${order._id.toString().slice(-6).toUpperCase()} failed. Please try again.`,
      recipient: order.user,
      type: "payment",
      urgancy: "high",
      link: "/checkout",
      createdBy: order.user
    }).catch(() => {});
    return res.status(400).json({ message: "Payment not completed" });
  } catch (error) {
    console.log(error?.response?.data || error);
    return res.status(500).json({ message: "Error capturing PayPal payment" });
  }
};

exports.capturePayPalOrderGuest = async (req, res) => {
  // Same behavior; no auth cookie required for guest return page.
  return exports.capturePayPalOrder(req, res);
};

exports.paypalWebhook = async (req, res) => {
  try {
    // Verify PayPal webhook signature via PayPal API
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) return res.sendStatus(500);
    const token = await paypalAccessToken();

    const transmissionId = req.headers["paypal-transmission-id"];
    const transmissionTime = req.headers["paypal-transmission-time"];
    const certUrl = req.headers["paypal-cert-url"];
    const authAlgo = req.headers["paypal-auth-algo"];
    const transmissionSig = req.headers["paypal-transmission-sig"];

    const rawBody = req.body; // Buffer from express.raw
    const webhookEvent = JSON.parse(rawBody.toString("utf8"));

    const verifyRes = await axios.post(
      `${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`,
      {
        auth_algo: authAlgo,
        cert_url: certUrl,
        transmission_id: transmissionId,
        transmission_sig: transmissionSig,
        transmission_time: transmissionTime,
        webhook_id: webhookId,
        webhook_event: webhookEvent,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (verifyRes.data.verification_status !== "SUCCESS") {
      return res.sendStatus(400);
    }

    const eventType = webhookEvent.event_type;
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const paypalOrderId = webhookEvent?.resource?.supplementary_data?.related_ids?.order_id;
      if (paypalOrderId) {
        const ord = await Order.findOneAndUpdate(
          { paymentReference: paypalOrderId, paymentProvider: "PAYPAL" },
          { paymentStatus: "PAID", paidAt: new Date() },
          { new: true }
        ).exec();
        if (ord) {
          await awardLoyaltyForOrderPaid(ord);
          await recordProductPurchaseEvents(ord);

          // Notify Buyer
          await notificationController.createNotification({
            title: "Payment Successful",
            body: `Payment for order #${ord._id.toString().slice(-6).toUpperCase()} was successful.`,
            recipient: ord.user,
            type: "payment",
            urgancy: "medium",
            link: "/orders",
            createdBy: ord.user
          }).catch(() => {});
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error?.response?.data || error);
    return res.sendStatus(500);
  }
};

exports.createFlutterwavePayment = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const userId = req.user?._id;
    const addressId = req.body?.addressId;
    const method = req.body?.method; // "MOBILE_MONEY" | "ORANGE_MONEY"

    if (!addressId) return res.status(400).json({ message: "addressId is required" });
    if (!["MOBILE_MONEY", "ORANGE_MONEY"].includes(method)) {
      return res.status(400).json({ message: "method must be MOBILE_MONEY or ORANGE_MONEY" });
    }

    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret || flwSecret.includes("xxxx")) {
      console.warn("Flutterwave is not configured or using placeholder secret key");
      return res.status(500).json({ message: "Mobile money payments are not configured on the server" });
    }

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromCart({
        userId,
        addressId,
        paymentMode: method,
        couponCode: req.body?.couponCode,
        loyaltyPointsToRedeem: req.body?.loyaltyPointsToRedeem,
        session,
      });
    });

    const { order } = created;
    const amount = Number(order.total || 0).toFixed(2);
    const currency = (order.currency || "XAF").toUpperCase();

    // For XAF/XOF regions Flutterwave uses mobilemoneyxaf/mobilemoneyxof.
    // Sanitize origin (remove trailing slash)
    const sanitizedOrigin = process.env.ORIGIN ? process.env.ORIGIN.replace(/\/$/, "") : "";
    const redirect_url = `${sanitizedOrigin}/payment/success?provider=flutterwave&orderId=${order._id}`;

    console.log(`Initiating Flutterwave payment for order ${order._id} (${amount} ${currency})`);

    const resp = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: String(order._id),
        amount,
        currency,
        redirect_url,
        payment_options,
        meta: {
          orderId: String(order._id),
          method,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${flwSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    const link = resp?.data?.data?.link;
    await Order.findByIdAndUpdate(order._id, {
      paymentProvider: "FLUTTERWAVE",
      paymentStatus: "PENDING",
      paymentReference: resp?.data?.data?.id ? String(resp.data.data.id) : undefined,
    }).exec();

    return res.status(200).json({ url: link });
  } catch (error) {
    console.error("Flutterwave Create Payment Error:", error?.response?.data || error.message || error);
    const errorDetail = error?.response?.data?.message || error.message || "Unknown error";
    return res.status(500).json({ message: `Error creating mobile money payment: ${errorDetail}` });
  } finally {
    session.endSession();
  }
};

exports.createFlutterwavePaymentGuest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const method = req.body?.method; // "MOBILE_MONEY" | "ORANGE_MONEY"
    const guestEmail = req.body?.guestEmail;
    const address = req.body?.address;
    const items = req.body?.items;

    if (!["MOBILE_MONEY", "ORANGE_MONEY"].includes(method)) {
      return res.status(400).json({ message: "method must be MOBILE_MONEY or ORANGE_MONEY" });
    }
    const flwSecret = process.env.FLW_SECRET_KEY;
    if (!flwSecret) return res.status(500).json({ message: "Flutterwave is not configured" });

    let created;
    await session.withTransaction(async () => {
      created = await buildOrderFromGuest({
        guestEmail,
        address,
        items,
        paymentMode: method,
        session,
      });
    });

    const { order } = created;
    const amount = Number(order.total || 0).toFixed(2);
    const currency = (order.currency || "XAF").toUpperCase();
    const payment_options = currency === "XOF" ? "mobilemoneyxof" : "mobilemoneyxaf";
    const redirect_url = `${process.env.ORIGIN}/payment/success?provider=flutterwave&orderId=${order._id}`;

    const resp = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      {
        tx_ref: String(order._id),
        amount,
        currency,
        redirect_url,
        payment_options,
        customer: { email: guestEmail },
        meta: { orderId: String(order._id), method },
      },
      {
        headers: {
          Authorization: `Bearer ${flwSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    const link = resp?.data?.data?.link;
    await Order.findByIdAndUpdate(order._id, {
      paymentProvider: "FLUTTERWAVE",
      paymentStatus: "PENDING",
      paymentReference: resp?.data?.data?.id ? String(resp.data.data.id) : undefined,
    }).exec();

    return res.status(200).json({ url: link, orderId: String(order._id) });
  } catch (error) {
    console.error("Flutterwave Guest Create Payment Error:", error?.response?.data || error.message || error);
    const errorDetail = error?.response?.data?.message || error.message || "Unknown error";
    return res.status(500).json({ message: `Error creating mobile money payment: ${errorDetail}` });
  } finally {
    session.endSession();
  }
};

exports.flutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLW_WEBHOOK_SECRET_HASH;
    const incoming = req.headers["verif-hash"];
    if (!secretHash || !incoming || incoming !== secretHash) {
      return res.sendStatus(401);
    }

    const event = req.body; // parsed JSON (this route will use express.json)
    if (event?.event === "charge.completed") {
      const orderId = event?.data?.meta?.orderId || event?.data?.tx_ref;
      const status = String(event?.data?.status || "").toLowerCase();
      if (orderId && status === "successful") {
        const ord = await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "PAID",
          paidAt: new Date(),
          paymentProvider: "FLUTTERWAVE",
        }, { new: true }).exec();
        if (ord) {
          await awardLoyaltyForOrderPaid(ord);
          await recordProductPurchaseEvents(ord);

          // Notify Buyer
          await notificationController.createNotification({
            title: "Payment Successful",
            body: `Payment for order #${ord._id.toString().slice(-6).toUpperCase()} was successful.`,
            recipient: ord.user,
            type: "payment",
            urgancy: "medium",
            link: "/orders",
            createdBy: ord.user
          }).catch(() => {});
        }
      } else if (orderId && status === "failed") {
        const ord = await Order.findByIdAndUpdate(orderId, { paymentStatus: "FAILED" }).exec();
        if (ord && ord.user) {
          await notificationController.createNotification({
            title: "Payment Failed",
            body: `Payment for order #${ord._id.toString().slice(-6).toUpperCase()} failed.`,
            recipient: ord.user,
            type: "payment",
            urgancy: "high",
            link: "/checkout",
            createdBy: ord.user
          }).catch(() => {});
        }
      }
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

