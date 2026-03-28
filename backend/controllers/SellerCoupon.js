const Coupon = require("../models/Coupon")

const isCouponActive = (coupon) => {
  if (!coupon.active) return false
  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) return false
  if (coupon.endsAt && coupon.endsAt < now) return false
  if (coupon.usageLimit != null && (coupon.usageCount || 0) >= coupon.usageLimit) return false
  return true
}

exports.listForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const coupons = await Coupon.find({ seller: sellerId }).sort({ createdAt: -1 }).exec()
    return res.status(200).json(coupons)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching coupons" })
  }
}

exports.createForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const data = {
      ...req.body,
      code: String(req.body.code || "").toUpperCase().trim(),
      seller: sellerId,
    }
    const created = await Coupon.create(data)
    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating coupon" })
  }
}

exports.updateForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await Coupon.findById(id).exec()
    if (!existing) return res.status(404).json({ message: "Coupon not found" })
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const data = { ...req.body }
    delete data.seller
    if (data.code) data.code = String(data.code).toUpperCase().trim()
    const updated = await Coupon.findByIdAndUpdate(id, data, { new: true }).exec()
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating coupon" })
  }
}

exports.deleteForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await Coupon.findById(id).exec()
    if (!existing) return res.status(404).json({ message: "Coupon not found" })
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    await Coupon.findByIdAndDelete(id).exec()
    return res.status(200).json({ deleted: true })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting coupon" })
  }
}
