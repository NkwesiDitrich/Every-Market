const Conversation = require("../models/Conversation")
const Message = require("../models/Message")
const notificationController = require("./Notification")

exports.listConversations = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const conversations = await Conversation.find({ seller: sellerId })
      .populate("buyer", "name email")
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
    const sellerId = req.user?._id
    const { conversationId } = req.params
    const conv = await Conversation.findById(conversationId).exec()
    if (!conv) return res.status(404).json({ message: "Conversation not found" })
    if (String(conv.seller) !== String(sellerId)) {
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
    const sellerId = req.user?._id
    const { conversationId } = req.params
    const { body } = req.body
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: "Message body is required" })
    }
    const conv = await Conversation.findById(conversationId).exec()
    if (!conv) return res.status(404).json({ message: "Conversation not found" })
    if (String(conv.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const created = await Message.create({
      conversation: conversationId,
      sender: sellerId,
      body: String(body).trim(),
    })
    await created.populate("sender", "name email")
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() }).exec()

    // Notify Buyer
    try {
      await notificationController.createNotification({
        title: "Seller Replied to Your Message",
        body: `${req.user?.name || "The seller"} sent you a message regarding your inquiry.`,
        recipient: conv.buyer,
        type: "communication",
        urgancy: "medium",
        link: "/inbox",
        createdBy: sellerId
      });
    } catch (notiErr) {
      console.log("Seller message notification error:", notiErr)
    }

    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error sending message" })
  }
}
