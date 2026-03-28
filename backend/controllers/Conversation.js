const Conversation = require("../models/Conversation")
const Message = require("../models/Message")
const SellerProfile = require("../models/SellerProfile")
const notificationController = require("./Notification")

exports.createOrSend = async (req, res) => {
  try {
    const userId = req.user?._id
    const { sellerId, orderId, productId, body } = req.body
    if (!sellerId || !body || !String(body).trim()) {
      return res.status(400).json({ message: "sellerId and message body are required" })
    }
    const sellerProfile = await SellerProfile.findOne({ user: sellerId, status: "approved" }).exec()
    if (!sellerProfile) {
      return res.status(400).json({ message: "Invalid seller" })
    }
    let conv = await Conversation.findOne({ buyer: userId, seller: sellerId }).exec()
    if (!conv) {
      conv = await Conversation.create({
        buyer: userId,
        seller: sellerId,
        order: orderId || null,
        product: productId || null
      })
    }
    const msg = await Message.create({ conversation: conv._id, sender: userId, body: String(body).trim() })
    await msg.populate("sender", "name email")
    await conv.populate("seller", "name email")

    // Notify Seller
    try {
      await notificationController.createNotification({
        title: "New Message Received",
        body: `You have a new message from ${req.user?.name || "a buyer"}.`,
        recipient: sellerId,
        type: "communication",
        urgancy: "medium",
        link: "/seller/inbox",
        createdBy: userId
      });
    } catch (notiErr) {
      console.log("Message notification error:", notiErr)
    }

    return res.status(201).json({ conversation: conv, message: msg })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error sending message" })
  }
}
exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user?._id
    const conversations = await Conversation.find({ buyer: userId })
      .populate("seller", "name email")
      .populate("order")
      .populate("product", "title thumbnail price")
      .sort({ updatedAt: -1 })
      .lean()
      .exec()

    const convIds = conversations.map((c) => c._id)
    const lastMessages = await Message.aggregate([
      { $match: { conversation: { $in: convIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$conversation", last: { $first: "$$ROOT" } } },
    ]).exec()

    const lastByConv = {}
    lastMessages.forEach((m) => {
      lastByConv[String(m._id)] = m.last
    })

    const enriched = conversations.map((c) => ({
      ...c,
      lastMessage: lastByConv[String(c._id)] || null,
    }))

    return res.status(200).json(enriched)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching conversations" })
  }
}

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user?._id
    const { conversationId } = req.params
    const conv = await Conversation.findById(conversationId).exec()
    if (!conv) return res.status(404).json({ message: "Conversation not found" })

    // Check if user is either buyer or seller
    if (String(conv.buyer) !== String(userId) && String(conv.seller) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .lean()
      .exec()
    return res.status(200).json(messages)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching messages" })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user?._id
    const { conversationId } = req.params
    const { body } = req.body
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: "Message body is required" })
    }
    const conv = await Conversation.findById(conversationId).exec()
    if (!conv) return res.status(404).json({ message: "Conversation not found" })

    if (String(conv.buyer) !== String(userId) && String(conv.seller) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" })
    }

    const created = await Message.create({
      conversation: conversationId,
      sender: userId,
      body: String(body).trim(),
    })
    await created.populate("sender", "name email")
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() }).exec()

    // Notify other party
    try {
      const isBuyer = String(conv.buyer) === String(userId);
      const otherParty = isBuyer ? conv.seller : conv.buyer;
      const otherPartyLink = isBuyer ? "/seller/inbox" : "/inbox";

      await notificationController.createNotification({
        title: "New Message",
        body: `${req.user?.name || "User"} sent you a message.`,
        recipient: otherParty,
        type: "communication",
        urgancy: "low",
        link: otherPartyLink,
        createdBy: userId
      });
    } catch (notiErr) {
      console.log("Message sending notification error:", notiErr)
    }

    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error sending message" })
  }
}
