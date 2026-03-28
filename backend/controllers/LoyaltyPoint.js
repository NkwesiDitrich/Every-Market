const LoyaltyPoint = require("../models/LoyaltyPoint")
const mongoose = require("mongoose")

const getBalance = async (userId) => {
  const result = await LoyaltyPoint.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$delta" } } },
  ]).exec()
  return result[0]?.total ?? 0
}

exports.getBalance = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?._id
    if (!userId) return res.status(400).json({ message: "userId required" })
    const balance = await getBalance(userId)
    return res.status(200).json({ balance })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching loyalty balance" })
  }
}

exports.listForUser = async (req, res) => {
  try {
    const userId = req.user?._id
    const list = await LoyaltyPoint.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean().exec()
    const balance = await getBalance(userId)
    return res.status(200).json({ list, balance })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching loyalty history" })
  }
}

exports.adminAdjust = async (req, res) => {
  try {
    const { userId, delta, reason } = req.body || {}
    if (!userId || typeof delta !== "number") {
      return res.status(400).json({ message: "userId and delta (number) are required" })
    }
    const created = await LoyaltyPoint.create({
      user: userId,
      delta,
      points: 0,
      reason: reason || "admin_adjust",
    })
    const balance = await getBalance(userId)
    return res.status(201).json({ ...created.toObject(), balance })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error adjusting loyalty points" })
  }
}

exports.listForAdmin = async (req, res) => {
  try {
    const userId = req.query.userId
    const filter = userId ? { user: userId } : {}
    const list = await LoyaltyPoint.find(filter)
      .populate("user", "email name")
      .sort({ createdAt: -1 })
      .limit(200)
      .exec()
    return res.status(200).json(list)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching loyalty history" })
  }
}
