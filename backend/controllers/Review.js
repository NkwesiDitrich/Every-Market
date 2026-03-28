const Review = require("../models/Review")
const Product = require("../models/Product")
const notificationController = require("./Notification")

exports.create = async (req, res) => {
    try {
        const userId = req.user?._id
        const created = await new Review({ ...req.body, user: userId }).populate({ path: 'user', select: "-password" })
        await created.save()

        // Notify Seller
        try {
            const product = await Product.findById(req.body.product).lean()
            if (product && product.seller) {
                await notificationController.createNotification({
                    title: "New Product Review",
                    body: `A customer left a ${req.body.rating}-star review for "${product.title}".`,
                    recipient: product.seller,
                    type: "product",
                    urgancy: "low",
                    link: "/seller/reviews",
                    createdBy: userId
                });
            }
        } catch (notiErr) {
            console.log("Review notification error:", notiErr)
        }

        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error posting review, please trying again later' })
    }
}

exports.getByProductId = async (req, res) => {
    try {
        const { id } = req.params
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        let skip = 0
        let limit = 0

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page

            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const totalDocs = await Review.find({ product: id }).countDocuments().exec()
        const result = await Review.find({ product: id }).skip(skip).limit(limit).populate('user').exec()

        res.set("X-Total-Count", totalDocs)
        res.status(200).json(result)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting reviews for this product, please try again later' })
    }
}

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await Review.findById(id)
        if (!existing) {
            return res.status(404).json({ message: "Review not found" })
        }
        if (!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const { user, product, ...safeBody } = req.body || {}
        const updated = await Review.findByIdAndUpdate(id, safeBody, { new: true }).populate('user')
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating review, please try again later' })
    }
}

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params
        const existing = await Review.findById(id)
        if (!existing) {
            return res.status(404).json({ message: "Review not found" })
        }
        if (!req.user?.isAdmin && String(existing.user) !== String(req.user?._id)) {
            return res.status(403).json({ message: "Forbidden" })
        }
        const deleted = await Review.findByIdAndDelete(id)
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting review, please try again later' })
    }
}