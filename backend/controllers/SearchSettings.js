const SearchSettings = require("../models/SearchSettings")

const DEFAULT_KEY = "default"

const getOrCreateDefault = async () => {
  let doc = await SearchSettings.findOne({ key: DEFAULT_KEY }).exec()
  if (!doc) {
    doc = await SearchSettings.create({
      key: DEFAULT_KEY,
      defaultSort: "createdAt",
      defaultOrder: "desc",
      boostBrandIds: [],
      boostCategoryIds: [],
    })
  }
  return doc
}

exports.get = async (req, res) => {
  try {
    const doc = await getOrCreateDefault()
    return res.status(200).json(doc)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching search settings" })
  }
}

exports.update = async (req, res) => {
  try {
    const { defaultSort, defaultOrder, boostBrandIds, boostCategoryIds } = req.body || {}
    const doc = await getOrCreateDefault()
    const updates = {}
    if (defaultSort != null) updates.defaultSort = String(defaultSort)
    if (defaultOrder != null && ["asc", "desc"].includes(defaultOrder)) updates.defaultOrder = defaultOrder
    if (Array.isArray(boostBrandIds)) updates.boostBrandIds = boostBrandIds
    if (Array.isArray(boostCategoryIds)) updates.boostCategoryIds = boostCategoryIds
    const updated = await SearchSettings.findByIdAndUpdate(doc._id, updates, { new: true }).exec()
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating search settings" })
  }
}
