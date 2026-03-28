const SellerProfile = require("../models/SellerProfile")
const Product = require("../models/Product")
const Wishlist = require("../models/Wishlist")
const ProductEvent = require("../models/ProductEvent")
const Order = require("../models/Order")
const Dispute = require("../models/Dispute")
const ReturnRequest = require("../models/ReturnRequest")
const notificationController = require("./Notification")

exports.apply = async (req, res) => {
  try {
    const userId = req.user?._id
    const { storeName, logoUrl, description, contactEmail, contactPhone } = req.body

    const existing = await SellerProfile.findOne({ user: userId })
    if (existing && existing.status === "pending") {
      return res.status(400).json({ message: "Your seller application is already pending." })
    }

    if (existing && existing.status === "approved") {
      return res.status(400).json({ message: "You are already an approved seller." })
    }

    const profileData = {
      user: userId,
      storeName,
      logoUrl,
      description,
      contactEmail,
      contactPhone,
      status: "pending",
    }

    let profile
    if (existing) {
      profile = await SellerProfile.findByIdAndUpdate(existing._id, profileData, { new: true })
    } else {
      profile = await SellerProfile.create(profileData)
    }

    // Notify Admins
    try {
      await notificationController.createNotification({
        title: "New Seller Application",
        body: `A new seller "${storeName}" has applied for approval.`,
        targets: ["admins"],
        type: "system",
        urgancy: "medium",
        link: "/admin/sellers",
        createdBy: userId
      });
    } catch (notiErr) {
      console.log("Seller application notification error:", notiErr)
    }

    return res.status(201).json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error submitting seller application. Please try again later." })
  }
}

exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id
    const profile = await SellerProfile.findOne({ user: userId })
    if (!profile) {
      return res.status(404).json({ message: "Seller profile not found" })
    }
    return res.status(200).json(profile)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller profile" })
  }
}

exports.listForAdmin = async (req, res) => {
  try {
    const profiles = await SellerProfile.find({})
      .populate("user", "-password")
      .sort({ createdAt: -1 })
      .exec()

    // Compute seller health: disputes, returns, orders, revenue per seller
    const sellerUserIds = profiles.map((p) => p.user?._id || p.user).filter(Boolean)
    const healthByUser = {}
    sellerUserIds.forEach((uid) => {
      healthByUser[String(uid)] = { disputes: 0, returns: 0, orders: 0, revenue: 0 }
    })

    const [disputeCounts, returnCounts, orders] = await Promise.all([
      Dispute.aggregate([{ $match: { seller: { $in: sellerUserIds } } }, { $group: { _id: "$seller", count: { $sum: 1 } } }]),
      ReturnRequest.aggregate([{ $match: { seller: { $in: sellerUserIds } } }, { $group: { _id: "$seller", count: { $sum: 1 } } }]),
      Order.find({ paymentStatus: "PAID" }).select("item").lean().exec(),
    ])

    disputeCounts.forEach((d) => {
      if (healthByUser[String(d._id)]) healthByUser[String(d._id)].disputes = d.count
    })
    returnCounts.forEach((r) => {
      if (healthByUser[String(r._id)]) healthByUser[String(r._id)].returns = r.count
    })

    for (const order of orders) {
      for (const line of order.item || []) {
        const sellerId = line?.product?.seller?._id || line?.product?.seller
        if (!sellerId) continue
        const key = String(sellerId)
        if (healthByUser[key]) {
          healthByUser[key].orders += 1
          const qty = Number(line.quantity || 0)
          const price = Number(line.product?.price || 0)
          healthByUser[key].revenue += qty * price
        }
      }
    }

    const enriched = profiles.map((p) => {
      const uid = p.user?._id || p.user
      const health = uid ? healthByUser[String(uid)] : { disputes: 0, returns: 0, orders: 0, revenue: 0 }
      return { ...p.toObject(), health }
    })

    return res.status(200).json(enriched)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching sellers" })
  }
}

exports.updateForAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const allowed = {}
    if (["pending", "approved", "rejected"].includes(req.body?.status)) {
      allowed.status = req.body.status
    }
    if (typeof req.body?.commissionRate === "number") {
      allowed.commissionRate = req.body.commissionRate
    }
    const updated = await SellerProfile.findByIdAndUpdate(id, allowed, { new: true }).populate("user", "-password")
    if (!updated) return res.status(404).json({ message: "Seller profile not found" })

    // If approved, ensure user role is seller
    if (updated.status === "approved" && updated.user) {
      updated.user.role = "seller"
      await updated.user.save()
    }

    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating seller profile" })
  }
}

exports.listSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const products = await Product.find({ seller: sellerId }).populate("brand category").exec()
    return res.status(200).json(products)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller products" })
  }
}

exports.createSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const payload = { ...req.body, seller: sellerId }
    const created = new Product(payload)
    await created.save()
    const populated = await Product.findById(created._id).populate("brand category")

    // Notify Admins for approval
    try {
      await notificationController.createNotification({
        title: "New Product for Approval",
        body: `Seller has submitted a new product: "${populated.title}".`,
        targets: ["admins"],
        type: "product",
        urgancy: "medium",
        link: "/admin/products",
        createdBy: sellerId
      });
    } catch (notiErr) {
      console.log("New product admin notification error:", notiErr)
    }

    return res.status(201).json(populated)
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error)
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error", details: error.errors })
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate value error (check SKU or Slug)", details: error.keyValue })
    }
    return res.status(500).json({ message: "Error adding product, please trying again later" })
  }
}

exports.updateSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await Product.findById(id)
    if (!existing) {
      return res.status(404).json({ message: "Product not found" })
    }
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const { seller, ...safeBody } = req.body || {}
    const updated = await Product.findByIdAndUpdate(id, safeBody, { new: true }).populate("brand category")

    // Notify users about Price Drop or Back in Stock
    try {
      if (req.body.price < existing.price) {
        // Price Drop
        const wishlists = await Wishlist.find({ product: id }).select("user").exec()
        const userIds = wishlists.map(w => w.user)
        if (userIds.length > 0) {
          await notificationController.createNotification({
            title: "Price Drop Alert!",
            body: `Great news! The price of "${updated.title}" has dropped to ${updated.price}.`,
            targets: userIds,
            type: "product",
            urgancy: "medium",
            link: `/product-details/${id}`,
            createdBy: sellerId
          })
        }
      } else if (existing.stockQuantity === 0 && req.body.stockQuantity > 0) {
        // Back in Stock
        const wishlists = await Wishlist.find({ product: id }).select("user").exec()
        const userIds = wishlists.map(w => w.user)
        if (userIds.length > 0) {
          await notificationController.createNotification({
            title: "Back in Stock!",
            body: `The product "${updated.title}" is now back in stock. Get it before it's gone!`,
            targets: userIds,
            type: "product",
            urgancy: "medium",
            link: `/product-details/${id}`,
            createdBy: sellerId
          })
        }
      }
    } catch (notiErr) {
      console.log("Wishlist alert notification error:", notiErr)
    }

    return res.status(200).json(updated)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error updating product" })
  }
}

exports.deleteSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const { id } = req.params
    const existing = await Product.findById(id)
    if (!existing) {
      return res.status(404).json({ message: "Product not found" })
    }
    if (String(existing.seller) !== String(sellerId)) {
      return res.status(403).json({ message: "Forbidden" })
    }
    const deleted = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).populate("brand category")
    return res.status(200).json(deleted)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error deleting product" })
  }
}

exports.listSellerOrders = async (req, res) => {
  try {
    const mongoose = require("mongoose")
    const sellerId = new mongoose.Types.ObjectId(req.user?._id)
    const orders = await Order.find({ "item.product.seller": sellerId }).sort({ createdAt: -1 }).exec()
    return res.status(200).json(orders)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller orders" })
  }
}

exports.analyticsSummary = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const orders = await Order.find({ "item.product.seller": sellerId, paymentStatus: "PAID" }).exec()

    let totalRevenue = 0
    let totalOrders = orders.length
    const productTotals = {}

    for (const order of orders) {
      for (const line of order.item || []) {
        if (!line.product) continue
        const pid = String(line.product._id || line.product)
        const qty = Number(line.quantity || 0)
        const price = Number(line.product.price || 0)
        const lineTotal = qty * price
        totalRevenue += lineTotal
        if (!productTotals[pid]) {
          productTotals[pid] = { product: line.product, revenue: 0, quantity: 0 }
        }
        productTotals[pid].revenue += lineTotal
        productTotals[pid].quantity += qty
      }
    }

    const topProducts = Object.values(productTotals)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      topProducts,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller analytics" })
  }
}

exports.analyticsFunnel = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const productIds = await Product.find({ seller: sellerId }).select("_id").lean().exec()
    const ids = productIds.map((p) => p._id)
    if (!ids.length) {
      return res.status(200).json({ byProduct: [], views: 0, addToCart: 0, purchases: 0 })
    }

    const [viewCounts, addToCartCounts, purchaseCounts] = await Promise.all([
      ProductEvent.aggregate([
        { $match: { product: { $in: ids }, eventType: "view" } },
        { $group: { _id: "$product", count: { $sum: 1 } } },
      ]).exec(),
      ProductEvent.aggregate([
        { $match: { product: { $in: ids }, eventType: "add_to_cart" } },
        { $group: { _id: "$product", count: { $sum: 1 } } },
      ]).exec(),
      ProductEvent.aggregate([
        { $match: { product: { $in: ids }, eventType: "purchase" } },
        { $group: { _id: "$product", count: { $sum: 1 } } },
      ]).exec(),
    ])

    const viewMap = {}
    viewCounts.forEach((v) => { viewMap[String(v._id)] = v.count })
    const cartMap = {}
    addToCartCounts.forEach((c) => { cartMap[String(c._id)] = c.count })
    const purchaseMap = {}
    purchaseCounts.forEach((p) => { purchaseMap[String(p._id)] = p.count })

    const products = await Product.find({ _id: { $in: ids } }).select("title thumbnail").lean().exec()
    const byProduct = products.map((p) => ({
      product: p,
      views: viewMap[String(p._id)] || 0,
      addToCart: cartMap[String(p._id)] || 0,
      purchases: purchaseMap[String(p._id)] || 0,
    })).sort((a, b) => b.views - a.views)

    return res.status(200).json({
      byProduct,
      views: viewCounts.reduce((s, v) => s + v.count, 0),
      addToCart: addToCartCounts.reduce((s, c) => s + c.count, 0),
      purchases: purchaseCounts.reduce((s, p) => s + p.count, 0),
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching funnel analytics" })
  }
}

exports.analyticsCohorts = async (req, res) => {
  try {
    const sellerId = req.user?._id
    const orders = await Order.find({ "item.product.seller": sellerId, paymentStatus: "PAID" })
      .select("user item createdAt")
      .populate("user", "name email")
      .lean()
      .exec()

    const customerFirstOrder = {}
    const customerOrders = {}
    for (const order of orders) {
      const uid = order.user?._id || order.user
      if (!uid) continue
      const key = String(uid)
      const date = new Date(order.createdAt)
      if (!customerFirstOrder[key]) {
        customerFirstOrder[key] = date
      } else if (date < customerFirstOrder[key]) {
        customerFirstOrder[key] = date
      }
      customerOrders[key] = (customerOrders[key] || 0) + 1
    }

    const cohortMap = {}
    for (const [uid, firstDate] of Object.entries(customerFirstOrder)) {
      const cohort = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, "0")}`
      const ordersCount = customerOrders[uid] || 0
      if (!cohortMap[cohort]) {
        cohortMap[cohort] = { newCustomers: 0, repeatCustomers: 0, totalOrders: 0 }
      }
      cohortMap[cohort].newCustomers += 1
      cohortMap[cohort].totalOrders += ordersCount
      if (ordersCount > 1) cohortMap[cohort].repeatCustomers += 1
    }

    const cohorts = Object.entries(cohortMap).map(([month, data]) => ({
      month,
      newCustomers: data.newCustomers,
      repeatCustomers: data.repeatCustomers,
      repeatRate: data.newCustomers > 0 ? ((data.repeatCustomers / data.newCustomers) * 100).toFixed(1) : 0,
      totalOrders: data.totalOrders,
    })).sort((a, b) => b.month.localeCompare(a.month))

    return res.status(200).json({ cohorts })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching cohort analytics" })
  }
}

