const Coupon = require("../models/Coupon")
const Cart = require("../models/Cart")
const Product = require("../models/Product")

const isCouponActive = (coupon) => {
  if (!coupon.active) return false
  const now = new Date()
  if (coupon.startsAt && coupon.startsAt > now) return false
  if (coupon.endsAt && coupon.endsAt < now) return false
  if (coupon.usageLimit != null && (coupon.usageCount || 0) >= coupon.usageLimit) return false
  return true
}

const computeDiscount = (coupon, subtotal) => {
  if (subtotal < (coupon.minOrderValue || 0)) return 0
  let discount = 0
  if (coupon.type === "percentage") {
    discount = (coupon.value / 100) * subtotal
  } else {
    discount = coupon.value
  }
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount
  }
  if (discount < 0) discount = 0
  if (discount > subtotal) discount = subtotal
  return discount
}

exports.listForAdmin = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).exec()
    return res.status(200).json(coupons)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching coupons" })
  }
}

exports.create = async (req, res) => {
  try {
    const data = { ...req.body, code: String(req.body.code || "").toUpperCase().trim() }
    const created = await Coupon.create(data)
    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating coupon" })
  }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params
    const data = { ...req.body }
    if (data.code) data.code = String(data.code).toUpperCase().trim()
    const updated = await Coupon.findByIdAndUpdate(id, data, { new: true }).exec()
    if (!updated) return res.status(404).json({ message: "Coupon not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating coupon" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Coupon.findByIdAndDelete(id).exec()
    if (!deleted) return res.status(404).json({ message: "Coupon not found" })
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting coupon" })
  }
}

exports.applyForUserCart = async (req, res) => {
  try {
    const userId = req.user?._id
    const code = String(req.body?.code || "").toUpperCase().trim()
    if (!code) return res.status(400).json({ message: "Coupon code is required" })

    const coupon = await Coupon.findOne({ code }).exec()
    if (!coupon || !isCouponActive(coupon)) {
      return res.status(400).json({ message: "Coupon is not valid" })
    }

    const cartItems = await Cart.find({ user: userId }).populate("product").exec()
    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" })

    let subtotal
    if (coupon.seller) {
      const sellerItems = cartItems.filter((ci) => String(ci.product?.seller) === String(coupon.seller))
      if (!sellerItems.length) {
        return res.status(400).json({ message: "This coupon applies only to products from this store. Add eligible items to your cart." })
      }
      subtotal = sellerItems.reduce((sum, ci) => {
        const price = Number(ci.product?.price || 0)
        const qty = Number(ci.quantity || 0)
        return sum + price * qty
      }, 0)
    } else {
      subtotal = cartItems.reduce((sum, ci) => {
        const price = Number(ci.product?.price || 0)
        const qty = Number(ci.quantity || 0)
        return sum + price * qty
      }, 0)
    }

    const discount = computeDiscount(coupon, subtotal)
    const shippingFee = Number(process.env.SHIPPING_FEE ?? 0)
    const taxesFee = Number(process.env.TAXES_FEE ?? 0)
    const total = subtotal - discount + shippingFee + taxesFee

    return res.status(200).json({
      code: coupon.code,
      subtotal,
      discount,
      shippingFee,
      taxesFee,
      total,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error applying coupon" })
  }
}

exports._computeDiscountForOrder = computeDiscount
exports._isCouponActive = isCouponActive

