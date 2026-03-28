const Wishlist = require("../models/Wishlist")

exports.create = async (req, res) => {
    try {
        const userId = req.user?._id
        const created = await new Wishlist({ ...req.body, user: userId }).populate({ path: "product", populate: ["brand"] })
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error adding product to wishlist, please try again later" })
    }
}
exports.getByUserId = async (req, res) => {
    try {
        const { id } = req.params
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page

            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const [result, totalResults] = await Promise.all([
            Wishlist.find({ user: id }).skip(skip).limit(limit).populate({ path: "product", populate: { path: 'brand', select: 'name' }, select: 'title price thumbnail brand stockQuantity' }).lean().exec(),
            Wishlist.find({ user: id }).countDocuments().exec()
        ])

        res.set("X-Total-Count", totalResults)
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching your wishlist, please try again later" })
    }
}
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await Wishlist.findById(id)
        if (!existing) {
            return res.status(404).json({ message: "Wishlist item not found" })
        }
        if (!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const { user, product, ...safeBody } = req.body || {}
        const updated = await Wishlist.findByIdAndUpdate(id, safeBody, { new: true }).populate("product")
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating your wishlist, please try again later" })
    }
}
exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await Wishlist.findById(id)
        if (!existing) {
            return res.status(404).json({ message: "Wishlist item not found" })
        }
        if (!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const deleted = await Wishlist.findByIdAndDelete(id)
        return res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting that product from wishlist, please try again later" })
    }
}

exports.toggleWishlistPublic = async (req, res) => {
    try {
        const userId = req.user._id
        const { isPublic } = req.body
        await Wishlist.updateMany({ user: userId }, { isPublic })
        res.status(200).json({ message: `Wishlist is now ${isPublic ? 'public' : 'private'}`, isPublic })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error toggling wishlist visibility" })
    }
}

exports.getPublicByUserId = async (req, res) => {
    try {
        const { id } = req.params
        const result = await Wishlist.find({ user: id, isPublic: true })
            .populate({ path: "product", populate: { path: 'brand', select: 'name' }, select: 'title price thumbnail brand stockQuantity' })
            .lean()
            .exec()
        res.status(200).json(result)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error fetching public wishlist" })
    }
}