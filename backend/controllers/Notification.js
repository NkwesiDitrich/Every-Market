const Notification = require("../models/Notification")

exports.getByUser = async (req, res) => {
  try {
    const userId = req.user?._id
    const role = req.user?.role // assuming role is 'buyer', 'seller', or 'admin'

    const query = {
      $or: [
        { recipient: userId },
        { targets: "all" },
        { targets: role === "admin" ? "admins" : role === "seller" ? "sellers" : "buyers" }
      ]
    }

    const list = await Notification.find(query).sort({ createdAt: -1 }).limit(50).exec()
    return res.status(200).json(list)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching user notifications" })
  }
}

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec()
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error marking notification as read" })
  }
}

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?._id
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true }).exec()
    return res.status(200).json({ message: "All notifications marked as read" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error marking all notifications as read" })
  }
}

exports.create = async (req, res) => {
  try {
    const data = req.body
    data.createdBy = req.user?._id
    const notification = await exports.createNotification(data)
    return res.status(201).json(notification)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating notification" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    await Notification.findByIdAndDelete(id).exec()
    return res.status(200).json({ message: "Notification deleted" })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting notification" })
  }
}

// Helper for other controllers
exports.createNotification = async ({ title, body, recipient, targets, type, urgancy, link, createdBy }) => {
  try {
    const notification = new Notification({
      title,
      body,
      recipient,
      targets: targets || "user",
      type: type || "system",
      urgancy: urgancy || "low",
      link,
      createdBy,
    })
    await notification.save()
    return notification
  } catch (error) {
    console.log("Notification create helper error:", error)
  }
}
