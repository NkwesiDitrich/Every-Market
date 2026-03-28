const Review = require("../models/Review")
const Product = require("../models/Product")

exports.listForSeller = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { productId, rating, page = 1, limit = 20 } = req.query
    const productIds = await Product.find({ seller: sellerId }).select("_id").lean().exec()
    const ids = productIds.map((p) => p._id)
    if (!ids.length) return res.status(200).json([])

    const filter = { product: { $in: ids } }
    if (productId) filter.product = productId
    if (rating) filter.rating = Number(rating)

    const skip = (Math.max(1, Number(page)) - 1) * Math.min(50, Math.max(1, Number(limit)))
    const lim = Math.min(50, Math.max(1, Number(limit)))
    const total = await Review.countDocuments(filter).exec()
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "title thumbnail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean()
      .exec()

    res.set("X-Total-Count", total)
    return res.status(200).json(reviews)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching reviews" })
  }
}

exports.replyToReview = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const { sellerReply } = req.body
    const review = await Review.findById(id).populate("product").exec()
    if (!review) return res.status(404).json({ message: "Review not found" })
    const product = await Product.findById(review.product?._id || review.product).exec()
    if (!product) return res.status(404).json({ message: "Product not found" })
    if (String(product.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const updated = await Review.findByIdAndUpdate(
      id,
      { sellerReply: String(sellerReply || "").trim(), sellerRepliedAt: new Date() },
      { new: true }
    )
      .populate("user", "name email")
      .populate("product", "title thumbnail")
      .exec()
    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error replying to review" })
  }
}
