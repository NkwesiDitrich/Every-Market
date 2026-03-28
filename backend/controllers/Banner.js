const Banner = require("../models/Banner")

const activeFilter = () => {
  const now = new Date()
  return {
    active: true,
    $or: [
      { startsAt: { $exists: false } },
      { startsAt: { $lte: now } },
    ],
    $orAdditional: [
      { endsAt: { $exists: false } },
      { endsAt: { $gte: now } },
    ],
  }
}

exports.listPublic = async (req, res) => {
  try {
    const now = new Date()
    const filter = {
      active: true,
      $and: [
        {
          $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }],
        },
        {
          $or: [{ endsAt: { $exists: false } }, { endsAt: { $gte: now } }],
        },
      ],
    }
    const banners = await Banner.find(filter).sort({ priority: -1, createdAt: -1 }).exec()
    return res.status(200).json(banners)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching banners" })
  }
}

exports.listForAdmin = async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ priority: -1, createdAt: -1 }).exec()
    return res.status(200).json(banners)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching banners" })
  }
}

exports.create = async (req, res) => {
  try {
    const data = { ...req.body }
    if (req.file) {
      data.imageUrl = req.file.path
    }
    const created = await Banner.create(data)
    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating banner" })
  }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params
    const data = { ...req.body }
    if (req.file) {
      data.imageUrl = req.file.path
    }
    const updated = await Banner.findByIdAndUpdate(id, data, { new: true }).exec()
    if (!updated) return res.status(404).json({ message: "Banner not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating banner" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Banner.findByIdAndDelete(id).exec()
    if (!deleted) return res.status(404).json({ message: "Banner not found" })
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting banner" })
  }
}

