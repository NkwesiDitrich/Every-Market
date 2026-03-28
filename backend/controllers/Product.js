const { Schema, default: mongoose } = require("mongoose")
const Product = require("../models/Product")
const notificationController = require("./Notification")

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.create = async (req, res) => {
    try {
        const created = new Product(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding product, please trying again later' })
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter = {}
        const sort = {}
        let skip = 0
        let limit = 0

        if (req.query.brand) {
            filter.brand = { $in: req.query.brand }
        }

        if (req.query.category) {
            filter.category = { $in: req.query.category }
        }

        // Public catalog only: hide deleted/non-approved items
        filter.isDeleted = false
        filter.status = "approved"

        if (req.query.q) {
            const q = String(req.query.q).trim()
            if (q.length) {
                const safe = escapeRegExp(q)
                const rx = new RegExp(safe, "i")
                filter.$or = [{ title: rx }, { shortDescription: rx }, { fullDescription: rx }]
            }
        }

        if (req.query.sort) {
            sort[req.query.sort] = req.query.order ? req.query.order === 'asc' ? 1 : -1 : 1
        } else {
            sort.createdAt = -1
        }


        if (req.query.page && req.query.limit) {

            const pageSize = req.query.limit
            const page = req.query.page

            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const [totalDocs, results] = await Promise.all([
            Product.countDocuments(filter).exec(),
            Product.find(filter)
                .sort(sort)
                .populate("brand", "name")
                .skip(skip)
                .limit(limit)
                .lean()
                .exec()
        ])

        res.set("X-Total-Count", totalDocs)

        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error fetching products, please try again later' })
    }
};

// Admin catalog listing: includes pending/approved/rejected/draft, supports status filter
exports.getAllAdmin = async (req, res) => {
    try {
        const filter = {}
        const sort = {}
        let skip = 0
        let limit = 0

        if (req.query.brand) {
            filter.brand = { $in: req.query.brand }
        }

        if (req.query.category) {
            filter.category = { $in: req.query.category }
        }

        if (req.query.status) {
            filter.status = req.query.status
        }

        if (req.query.includeDeleted !== "true") {
            filter.isDeleted = false
        }

        if (req.query.q) {
            const q = String(req.query.q).trim()
            if (q.length) {
                const safe = escapeRegExp(q)
                const rx = new RegExp(safe, "i")
                filter.$or = [{ title: rx }, { shortDescription: rx }, { fullDescription: rx }]
            }
        }

        if (req.query.sort) {
            sort[req.query.sort] = req.query.order ? (req.query.order === "asc" ? 1 : -1) : 1
        } else {
            sort.createdAt = -1
        }

        if (req.query.page && req.query.limit) {
            const pageSize = req.query.limit
            const page = req.query.page
            skip = pageSize * (page - 1)
            limit = pageSize
        }

        const [totalDocs, results] = await Promise.all([
            Product.countDocuments(filter).exec(),
            Product.find(filter)
                .sort(sort)
                .populate("brand", "name")
                .populate("category", "name")
                .skip(skip)
                .limit(limit)
                .lean()
                .exec()
        ])

        res.set("X-Total-Count", totalDocs)
        return res.status(200).json(results)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching admin products" })
    }
}

exports.getSimilar = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        const limit = Math.min(Number(req.query.limit) || 8, 20)
        const product = await Product.findById(id).select("category").lean().exec()
        if (!product || !product.category) {
            return res.status(200).json([])
        }
        const results = await Product.find({
            _id: { $ne: id },
            category: product.category,
            isDeleted: false,
            status: "approved",
        })
            .populate("brand")
            .limit(limit)
            .lean()
            .exec()
        return res.status(200).json(results)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching similar products" })
    }
}

exports.getByIds = async (req, res) => {
    try {
        const raw = req.query.ids
        const ids = Array.isArray(raw) ? raw : (typeof raw === "string" ? raw.split(",") : [])
        const validIds = ids.filter((x) => mongoose.Types.ObjectId.isValid(x)).slice(0, 20)
        if (!validIds.length) return res.status(200).json([])
        const results = await Product.find({
            _id: { $in: validIds },
            isDeleted: false,
            status: "approved",
        })
            .populate("brand")
            .lean()
            .exec()
        const orderMap = new Map(validIds.map((id, i) => [String(id), i]))
        results.sort((a, b) => (orderMap.get(String(a._id)) ?? 999) - (orderMap.get(String(b._id)) ?? 999))
        return res.status(200).json(results)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching products by ids" })
    }
}

exports.getRecommended = async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 8, 20)
        const results = await Product.find({ isDeleted: false, status: "approved" })
            .populate("brand")
            .sort({ createdAt: -1 })
            .limit(limit * 2)
            .lean()
            .exec()
        const shuffled = results.sort(() => Math.random() - 0.5).slice(0, limit)
        return res.status(200).json(shuffled)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Error fetching recommended products" })
    }
}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        const result = await Product.findById(id).populate("brand").populate("category").populate("seller", "name email profilePicture").lean().exec()
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error getting product details, please try again later' })
    }
}

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        const product = await Product.findById(id).lean()
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        const prevStatus = product.status
        const updated = await Product.findByIdAndUpdate(id, req.body, { new: true })

        // Notify Seller on status change (e.g. approved/rejected)
        if (req.body?.status && req.body.status !== prevStatus) {
            try {
                await notificationController.createNotification({
                    title: `Product ${req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1)}`,
                    body: `Your product "${updated.title}" has been ${req.body.status}.`,
                    recipient: updated.seller,
                    type: "product",
                    urgancy: "medium",
                    link: "/seller/products",
                    createdBy: req.user?._id
                });
            } catch (notiErr) {
                console.log("Product status notification error:", notiErr)
            }
        }

        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error updating product, please try again later' })
    }
}

exports.undeleteById = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        const unDeleted = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true }).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error restoring product, please try again later' })
    }
}

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }
        const deleted = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error deleting product, please try again later' })
    }
}


