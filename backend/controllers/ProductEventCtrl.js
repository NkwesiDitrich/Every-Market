const ProductEvent = require("../models/ProductEvent")
const Product = require("../models/Product")

exports.track = async (req, res) => {
  try {
    const userId = req.user?._id
    const { productId, eventType } = req.body
    if (!productId || !["view", "add_to_cart"].includes(eventType)) {
      return res.status(400).json({ message: "Invalid productId or eventType (view|add_to_cart)" })
    }
    if (!require('mongoose').Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" })
    }
    const product = await Product.findById(productId).exec()
    if (!product) return res.status(404).json({ message: "Product not found" })

    const sessionId = req.cookies?.sid || req.headers["x-session-id"] || null
    await ProductEvent.create({
      product: productId,
      eventType,
      user: userId || null,
      sessionId,
    })
    return res.status(201).json({ tracked: true })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error tracking event" })
  }
}
