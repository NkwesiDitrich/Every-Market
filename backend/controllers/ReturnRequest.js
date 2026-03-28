const ReturnRequest = require("../models/ReturnRequest")
const Order = require("../models/Order")
const Product = require("../models/Product")
const notificationController = require("./Notification")

exports.create = async (req, res) => {
  try {
    const userId = req.user?._id
    const { orderId, itemIndex, reason } = req.body

    if (!orderId || typeof itemIndex !== "number" || !reason) {
      return res.status(400).json({ message: "orderId, itemIndex, and reason are required" })
    }

    const order = await Order.findById(orderId).exec()
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Verify ownership
    if (String(order.user) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    // Check if item exists
    if (!order.item || !order.item[itemIndex]) {
      return res.status(400).json({ message: "Invalid item index" })
    }

    // Check if return already exists for this item
    const existing = await ReturnRequest.findOne({
      order: orderId,
      itemIndex,
      status: { $in: ["pending", "approved"] },
    }).exec()

    if (existing) {
      return res.status(400).json({ message: "Return request already exists for this item" })
    }

    const line = order.item[itemIndex]
    const sellerId = line?.product?.seller?._id || line?.product?.seller || null

    const returnRequest = await ReturnRequest.create({
      order: orderId,
      user: userId,
      seller: sellerId,
      itemIndex,
      reason,
      status: "pending",
    })

    // Notify Seller and Admin
    try {
      await notificationController.createNotification({
        title: "New Return Requested",
        body: `A customer has requested a return for order #${order._id.toString().slice(-6).toUpperCase()}.`,
        targets: "admins",
        type: "system",
        urgancy: "medium",
        link: "/admin/returns",
        createdBy: userId
      });

      if (sellerId) {
        await notificationController.createNotification({
          title: "Return Request Received",
          body: `A customer has requested a return for an item in order #${order._id.toString().slice(-6).toUpperCase()}.`,
          recipient: sellerId,
          type: "system",
          urgancy: "medium",
          link: "/seller/orders", // or seller returns if exists
          createdBy: userId
        });
      }
    } catch (notiErr) {
      console.log("Return request notification error:", notiErr)
    }

    return res.status(201).json(returnRequest)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating return request" })
  }
}

exports.getMyReturns = async (req, res) => {
  try {
    const userId = req.user?._id
    const returns = await ReturnRequest.find({ user: userId })
      .populate("order")
      .sort({ createdAt: -1 })
      .exec()
    return res.status(200).json(returns)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching return requests" })
  }
}

exports.listForAdmin = async (req, res) => {
  try {
    const statusFilter = req.query.status
    const filter = {}
    if (statusFilter) {
      filter.status = statusFilter
    }

    const returns = await ReturnRequest.find(filter)
      .populate("order")
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .exec()

    return res.status(200).json(returns)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching return requests" })
  }
}

exports.updateForAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { status, resolution, notes } = req.body

    const allowed = {}
    if (["pending", "approved", "rejected"].includes(status)) {
      allowed.status = status
    }
    if (["refund", "replacement", "store_credit", null].includes(resolution)) {
      allowed.resolution = resolution
    }
    if (typeof notes === "string") {
      allowed.notes = notes
    }

    const updated = await ReturnRequest.findByIdAndUpdate(id, allowed, { new: true })
      .populate("order")
      .populate("user", "email name")
      .exec()

    if (!updated) {
      return res.status(404).json({ message: "Return request not found" })
    }

    // If approved and resolution is refund/replacement, restock product
    if (updated.status === "approved" && updated.resolution && updated.order) {
      const order = updated.order
      const item = order.item?.[updated.itemIndex]
      if (item && item.product) {
        const productId = item.product._id || item.product
        const qty = Number(item.quantity || 0)
        await Product.findByIdAndUpdate(productId, { $inc: { stockQuantity: qty } }).exec()
      }
    }

    // Notify Buyer on status change
    try {
      const statusTitle = updated.status.charAt(0).toUpperCase() + updated.status.slice(1)
      await notificationController.createNotification({
        title: `Return Request ${statusTitle}`,
        body: `Your return request for order #${updated.order?._id.toString().slice(-6).toUpperCase()} has been ${updated.status}.`,
        recipient: updated.user._id || updated.user,
        type: "system",
        urgancy: "medium",
        link: "/orders",
        createdBy: req.user?._id
      });
    } catch (notiErr) {
      console.log("Return update notification error:", notiErr)
    }

    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating return request" })
  }
}

exports.listForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const statusFilter = req.query.status
    const filter = { seller: sellerId }
    if (statusFilter) {
      filter.status = statusFilter
    }

    const returns = await ReturnRequest.find(filter)
      .populate("order")
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .exec()

    return res.status(200).json(returns)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching return requests" })
  }
}

exports.updateForSeller = async (req, res) => {
  try {
    const { id } = req.params
    const sellerId = req.user?._id
    const { status, resolution, notes } = req.body

    const existing = await ReturnRequest.findById(id).exec()
    if (!existing) {
      return res.status(404).json({ message: "Return request not found" })
    }

    // Permission check
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden: You do not own this product return" })
    }

    const allowed = {}
    if (["approved", "rejected"].includes(status)) {
      allowed.status = status
    }
    if (["refund", "replacement", "store_credit", null].includes(resolution)) {
      allowed.resolution = resolution
    }
    if (typeof notes === "string") {
      allowed.notes = notes
    }

    const updated = await ReturnRequest.findByIdAndUpdate(id, allowed, { new: true })
      .populate("order")
      .populate("user", "email name")
      .exec()

    // If approved and resolution is refund/replacement, restock product
    if (updated.status === "approved" && (updated.resolution === "refund" || updated.resolution === "replacement")) {
      const order = updated.order
      const item = order?.item?.[updated.itemIndex]
      if (item && item.product) {
        const productId = item.product._id || item.product
        const qty = Number(item.quantity || 0)
        await Product.findByIdAndUpdate(productId, { $inc: { stockQuantity: qty } }).exec()
      }
    }

    // Notify Buyer on status change
    try {
      const statusTitle = updated.status.charAt(0).toUpperCase() + updated.status.slice(1)
      await notificationController.createNotification({
        title: `Return Request ${statusTitle}`,
        body: `Seller ${req.user?.name || 'Your seller'} has ${updated.status} your return request for order #${updated.order?._id.toString().slice(-6).toUpperCase()}.`,
        recipient: updated.user._id || updated.user,
        type: "system",
        urgancy: "medium",
        link: "/orders",
        createdBy: sellerId
      });
    } catch (notiErr) {
      console.log("Return update notification error:", notiErr)
    }

    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating return request" })
  }
}
