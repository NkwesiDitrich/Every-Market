const User = require("../models/User")

exports.list = async (req, res) => {
  try {
    const filter = {}
    if (req.query.role) filter.role = req.query.role
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === "true"
    if (req.query.isBanned) filter.isBanned = req.query.isBanned === "true"

    const users = await User.find(filter).sort({ createdAt: -1 }).select("-password").exec()
    return res.status(200).json(users)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching users" })
  }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params
    const allowed = {}
    if (["buyer", "seller", "admin", "support", "marketing"].includes(req.body?.role)) {
      allowed.role = req.body.role
    }
    if (typeof req.body?.isVerified === "boolean") {
      allowed.isVerified = req.body.isVerified
    }
    if (typeof req.body?.isBanned === "boolean") {
      allowed.isBanned = req.body.isBanned
    }
    const updated = await User.findByIdAndUpdate(id, allowed, { new: true }).select("-password").exec()
    if (!updated) return res.status(404).json({ message: "User not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating user" })
  }
}

