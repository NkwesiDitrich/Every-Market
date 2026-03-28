const FeaturedCollection = require("../models/FeaturedCollection")

exports.listForAdmin = async (req, res) => {
  try {
    const list = await FeaturedCollection.find({})
      .populate("productIds", "title thumbnail price")
      .populate("categoryIds", "name")
      .sort({ priority: -1, createdAt: -1 })
      .exec()
    return res.status(200).json(list)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching featured collections" })
  }
}

exports.listPublic = async (req, res) => {
  try {
    const list = await FeaturedCollection.find({ active: true })
      .populate("productIds", "title thumbnail price category brand")
      .sort({ priority: -1 })
      .limit(10)
      .exec()
    return res.status(200).json(list)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching featured collections" })
  }
}

exports.create = async (req, res) => {
  try {
    const body = { ...req.body }
    if (body.slug) body.slug = String(body.slug).toLowerCase().trim()
    const created = await FeaturedCollection.create(body)
    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating featured collection" })
  }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params
    const body = { ...req.body }
    if (body.slug) body.slug = String(body.slug).toLowerCase().trim()
    const updated = await FeaturedCollection.findByIdAndUpdate(id, body, { new: true }).exec()
    if (!updated) return res.status(404).json({ message: "Featured collection not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating featured collection" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await FeaturedCollection.findByIdAndDelete(id).exec()
    if (!deleted) return res.status(404).json({ message: "Featured collection not found" })
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting featured collection" })
  }
}
