const Dispute = require("../models/Dispute")
const Order = require("../models/Order")
const notificationController = require("./Notification")

exports.create = async (req, res) => {
  try {
    const userId = req.user?._id
    const { orderId, itemIndex, reason } = req.body || {}

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }
    if (!orderId || typeof itemIndex !== "number" || !reason) {
      return res.status(400).json({ message: "orderId, itemIndex and reason are required" })
    }

    const order = await Order.findById(orderId).exec()
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    if (String(order.user) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    if (!order.item || !order.item[itemIndex]) {
      return res.status(400).json({ message: "Invalid item index" })
    }

    const existing = await Dispute.findOne({
      order: orderId,
      user: userId,
      itemIndex,
      status: { $in: ["open", "in_review"] },
    }).exec()
    if (existing) {
      return res.status(400).json({ message: "A dispute is already open for this item" })
    }

    const line = order.item[itemIndex]
    const sellerId = line?.product?.seller || null

    const dispute = await Dispute.create({
      order: orderId,
      user: userId,
      seller: sellerId,
      itemIndex,
      reason,
      evidence: req.body.evidence || [],
      messages: [
        {
          sender: userId,
          role: "buyer",
          body: req.body.description || reason,
          attachments: req.body.evidence || [],
        },
      ],
    })

    // Notify Admin and Seller
    try {
      await notificationController.createNotification({
        title: "New Dispute Opened",
        body: `A new dispute has been opened for order #${order._id.toString().slice(-6).toUpperCase()}.`,
        targets: "admins",
        type: "dispute",
        urgancy: "high",
        link: "/admin/disputes",
        createdBy: userId
      });

      if (sellerId) {
        await notificationController.createNotification({
          title: "Dispute Opened on Your Product",
          body: `A customer has opened a dispute for an item in order #${order._id.toString().slice(-6).toUpperCase()}.`,
          recipient: sellerId,
          type: "dispute",
          urgancy: "medium",
          link: "/seller/disputes",
          createdBy: userId
        });
      }
    } catch (notiErr) {
      console.log("Dispute creation notification error:", notiErr)
    }

    return res.status(201).json(dispute)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating dispute" })
  }
}

exports.getMyDisputes = async (req, res) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const disputes = await Dispute.find({ user: userId })
      .populate("order")
      .sort({ createdAt: -1 })
      .exec()

    return res.status(200).json(disputes)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching disputes" })
  }
}

exports.getSellerDisputes = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const disputes = await Dispute.find({ seller: sellerId })
      .populate("order")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .exec()
    return res.status(200).json(disputes)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller disputes" })
  }
}

exports.addMessage = async (req, res) => {
  try {
    const userId = req.user?._id
    const { id } = req.params
    const { body, attachments } = req.body

    const dispute = await Dispute.findById(id).exec()
    if (!dispute) return res.status(404).json({ message: "Dispute not found" })

    // Check permissions
    const isBuyer = String(dispute.user) === String(userId)
    const isSeller = String(dispute.seller) === String(userId)
    const isAdmin = req.user?.role === "admin"

    if (!isBuyer && !isSeller && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const role = isAdmin ? "admin" : isSeller ? "seller" : "buyer"

    dispute.messages.push({
      sender: userId,
      role,
      body,
      attachments: attachments || [],
    })

    // Auto-update status
    if (isSeller && dispute.status === "open") {
      dispute.status = "responded"
    } else if (isAdmin) {
      dispute.status = "under_review"
    }

    await dispute.save()

    // Notify other parties
    try {
      const recipient = isBuyer ? dispute.seller : dispute.user
      const notifyAdmin = !isAdmin

      if (recipient) {
        await notificationController.createNotification({
          title: "New Dispute Message",
          body: `A new message has been posted in dispute #${dispute._id.toString().slice(-6).toUpperCase()}.`,
          recipient,
          type: "dispute",
          urgancy: "medium",
          link: isBuyer ? "/seller/disputes" : "/disputes",
          createdBy: userId
        });
      }

      if (notifyAdmin) {
        await notificationController.createNotification({
          title: "Dispute Activity",
          body: `Activity in dispute #${dispute._id.toString().slice(-6).toUpperCase()}.`,
          targets: "admins",
          type: "dispute",
          urgancy: "low",
          link: "/admin/disputes",
          createdBy: userId
        });
      }
    } catch (notiErr) {
      console.log("Dispute message notification error:", notiErr)
    }

    return res.status(200).json(dispute)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error adding message to dispute" })
  }
}

exports.escalate = async (req, res) => {
  try {
    const userId = req.user?._id
    const { id } = req.params

    const dispute = await Dispute.findById(id).exec()
    if (!dispute) return res.status(404).json({ message: "Dispute not found" })

    if (String(dispute.user) !== String(userId)) {
      return res.status(403).json({ message: "Only the buyer can escalate the dispute" })
    }

    dispute.status = "escalated"
    await dispute.save()

    // Notify Admin
    await notificationController.createNotification({
      title: "Dispute Escalated",
      body: `Dispute #${dispute._id.toString().slice(-6).toUpperCase()} has been escalated to admin review.`,
      targets: "admins",
      type: "dispute",
      urgancy: "high",
      link: "/admin/disputes",
      createdBy: userId
    });

    return res.status(200).json(dispute)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error escalating dispute" })
  }
}

exports.listForAdmin = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) {
      filter.status = req.query.status
    }

    const disputes = await Dispute.find(filter)
      .populate("order")
      .populate("user", "email name")
      .populate("seller", "email name")
      .sort({ createdAt: -1 })
      .exec()

    return res.status(200).json(disputes)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching disputes" })
  }
}

exports.updateForAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { status, resolution, notes, orderStatus } = req.body || {}
    const allowed = {}

    if (["open", "responded", "escalated", "under_review", "resolved", "closed"].includes(status)) {
      allowed.status = status
    }
    if (["refund", "replacement", "partial_refund", "other", null].includes(resolution)) {
      allowed.resolution = resolution
    }
    if (typeof notes === "string") {
      allowed.notes = notes
    }

    const dispute = await Dispute.findByIdAndUpdate(id, allowed, { new: true })
      .populate("order")
      .populate("user", "email name")
      .populate("seller", "email name")
      .populate("messages.sender", "name email")
      .exec()

    if (!dispute) {
      return res.status(404).json({ message: "Dispute not found" })
    }

    if (orderStatus && dispute.order) {
      await Order.findByIdAndUpdate(dispute.order._id, { status: orderStatus }).exec()
    }

    // Notify parties on update
    try {
      const statusTitle = dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)
      // Notify Buyer
      await notificationController.createNotification({
        title: `Dispute ${statusTitle}`,
        body: `Your dispute for order #${dispute.order?._id.toString().slice(-6).toUpperCase()} is now ${dispute.status}.`,
        recipient: dispute.user,
        type: "dispute",
        urgancy: "medium",
        link: "/disputes",
        createdBy: req.user?._id
      });
      // Notify Seller
      if (dispute.seller) {
        await notificationController.createNotification({
          title: `Dispute ${statusTitle}`,
          body: `The dispute for an item in order #${dispute.order?._id.toString().slice(-6).toUpperCase()} is now ${dispute.status}.`,
          recipient: dispute.seller,
          type: "dispute",
          urgancy: "medium",
          link: "/seller/disputes",
          createdBy: req.user?._id
        });
      }
    } catch (notiErr) {
      console.log("Dispute update notification error:", notiErr)
    }

    return res.status(200).json(dispute)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating dispute" })
  }
}

