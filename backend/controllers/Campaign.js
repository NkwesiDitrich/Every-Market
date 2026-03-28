const Campaign = require("../models/Campaign")
const notificationController = require("./Notification")

exports.listForAdmin = async (req, res) => {
  try {
    const list = await Campaign.find({})
      .populate("bannerId", "title imageUrl linkUrl")
      .populate("featuredCollectionId", "name")
      .sort({ startDate: -1 })
      .exec()
    return res.status(200).json(list)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching campaigns" })
  }
}

exports.create = async (req, res) => {
  try {
    const created = await Campaign.create(req.body)

    // Notify Admins
    try {
      await notificationController.createNotification({
        title: "New Marketing Campaign Created",
        body: `Campaign "${created.name}" has been created and scheduled.`,
        targets: ["admins"],
        type: "marketing",
        urgancy: "low",
        link: "/admin/campaigns",
        createdBy: req.user?._id
      });

      // If active immediately, notify all buyers
      if (created.active && new Date(created.startDate) <= new Date()) {
        await notificationController.createNotification({
          title: "New Sale Live!",
          body: `Check out our "${created.name}" campaign for amazing deals!`,
          targets: "buyers",
          type: "marketing",
          urgancy: "medium",
          link: "/",
          createdBy: req.user?._id
        });
      }
    } catch (notiErr) {
      console.log("Campaign notification error:", notiErr)
    }

    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating campaign" })
  }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Campaign.findByIdAndUpdate(id, req.body, { new: true }).exec()
    if (!updated) return res.status(404).json({ message: "Campaign not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating campaign" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Campaign.findByIdAndDelete(id).exec()
    if (!deleted) return res.status(404).json({ message: "Campaign not found" })
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting campaign" })
  }
}
