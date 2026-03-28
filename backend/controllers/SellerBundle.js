const ProductBundle = require("../models/ProductBundle")
const Product = require("../models/Product")

exports.listForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const bundles = await ProductBundle.find({ seller: sellerId })
      .populate("productIds", "title thumbnail price")
      .sort({ createdAt: -1 })
      .exec()
    return res.status(200).json(bundles)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching bundles" })
  }
}

exports.createForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { name, productIds, bundlePrice } = req.body
    if (!name || !Array.isArray(productIds) || productIds.length < 2 || typeof bundlePrice !== "number") {
      return res.status(400).json({ message: "Bundle must have name, at least 2 products, and a bundle price" })
    }
    const products = await Product.find({ _id: { $in: productIds }, seller: sellerId }).exec()
    if (products.length !== productIds.length) {
      return res.status(400).json({ message: "All products must belong to your store" })
    }
    const created = await ProductBundle.create({ seller: sellerId, name, productIds, bundlePrice })
    const populated = await ProductBundle.findById(created._id).populate("productIds", "title thumbnail price").exec()
    return res.status(201).json(populated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating bundle" })
  }
}

exports.updateForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await ProductBundle.findById(id).exec()
    if (!existing) return res.status(404).json({ message: "Bundle not found" })
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const { name, productIds, bundlePrice } = req.body
    const update = {}
    if (name != null) update.name = name
    if (Array.isArray(productIds) && productIds.length >= 2) {
      const products = await Product.find({ _id: { $in: productIds }, seller: sellerId }).exec()
      if (products.length !== productIds.length) {
        return res.status(400).json({ message: "All products must belong to your store" })
      }
      update.productIds = productIds
    }
    if (typeof bundlePrice === "number") update.bundlePrice = bundlePrice
    const updated = await ProductBundle.findByIdAndUpdate(id, update, { new: true })
      .populate("productIds", "title thumbnail price")
      .exec()
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating bundle" })
  }
}

exports.deleteForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await ProductBundle.findById(id).exec()
    if (!existing) return res.status(404).json({ message: "Bundle not found" })
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    await ProductBundle.findByIdAndDelete(id).exec()
    return res.status(200).json({ deleted: true })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting bundle" })
  }
}
