const Category = require("../models/Category")

exports.list = async (req, res) => {
  try {
    const result = await Category.find({}).sort({ name: 1 }).exec()
    return res.status(200).json(result)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching categories" })
  }
}

exports.create = async (req, res) => {
  try {
    const { name } = req.body || {}
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name is required" })
    }
    const created = await Category.create({ name: String(name).trim() })
    return res.status(201).json(created)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error creating category" })
  }
}

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body || {}
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "name is required" })
    }
    const updated = await Category.findByIdAndUpdate(id, { name: String(name).trim() }, { new: true }).exec()
    if (!updated) return res.status(404).json({ message: "Category not found" })
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating category" })
  }
}

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Category.findByIdAndDelete(id).exec()
    if (!deleted) return res.status(404).json({ message: "Category not found" })
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting category" })
  }
}
