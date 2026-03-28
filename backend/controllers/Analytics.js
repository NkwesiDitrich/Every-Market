const Order = require("../models/Order")
const User = require("../models/User")
const Product = require("../models/Product")
const SellerProfile = require("../models/SellerProfile")
const Cart = require("../models/Cart")
const ProductEvent = require("../models/ProductEvent")

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

exports.overview = async (req, res) => {
  try {
    const now = new Date()
    const todayStart = startOfDay(now)
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const monthStart = new Date(now)
    monthStart.setMonth(monthStart.getMonth() - 1)

    const paidFilter = { paymentStatus: "PAID" }

    const [allPaid, todayPaid, weekPaid, monthPaid] = await Promise.all([
      Order.find(paidFilter).select("total").lean(),
      Order.find({ ...paidFilter, createdAt: { $gte: todayStart } }).select("total").lean(),
      Order.find({ ...paidFilter, createdAt: { $gte: weekStart } }).select("total").lean(),
      Order.find({ ...paidFilter, createdAt: { $gte: monthStart } }).select("total").lean(),
    ])

    const sumTotals = (arr) => arr.reduce((sum, o) => sum + Number(o.total || 0), 0)

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalUsers,
      newUsersToday,
      totalProducts,
      approvedProducts,
      pendingProducts,
      approvedSellers,
      pendingSellers,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: todayStart } }),
      Order.countDocuments({ createdAt: { $gte: weekStart } }),
      Order.countDocuments({ createdAt: { $gte: monthStart } }),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Product.countDocuments({ isDeleted: false }),
      Product.countDocuments({ status: "approved", isDeleted: false }),
      Product.countDocuments({ status: "pending", isDeleted: false }),
      SellerProfile.countDocuments({ status: "approved" }),
      SellerProfile.countDocuments({ status: "pending" }),
    ])

    return res.status(200).json({
      revenue: {
        total: sumTotals(allPaid),
        today: sumTotals(todayPaid),
        week: sumTotals(weekPaid),
        month: sumTotals(monthPaid),
      },
      orders: { total: totalOrders, today: todayOrders, week: weekOrders, month: monthOrders },
      users: { total: totalUsers, newToday: newUsersToday },
      products: { total: totalProducts, approved: approvedProducts, pending: pendingProducts },
      sellers: { approved: approvedSellers, pending: pendingSellers },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching analytics overview" })
  }
}

exports.sales = async (req, res) => {
  try {
    const range = String(req.query.range || "week")
    const now = new Date()
    const start = new Date(now)
    if (range === "month") start.setMonth(start.getMonth() - 1)
    else if (range === "year") start.setFullYear(start.getFullYear() - 1)
    else start.setDate(start.getDate() - 7)

    const orders = await Order.find({ paymentStatus: "PAID", createdAt: { $gte: start } })
      .select("total createdAt")
      .sort({ createdAt: 1 })
      .lean()

    const byDate = {}
    for (const o of orders) {
      const date = new Date(o.createdAt).toISOString().slice(0, 10)
      if (!byDate[date]) byDate[date] = { date, revenue: 0, orders: 0 }
      byDate[date].revenue += Number(o.total || 0)
      byDate[date].orders += 1
    }

    const timeseries = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date))
    return res.status(200).json({ range, timeseries })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching sales analytics" })
  }
}

exports.topProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const populated = await Order.find({ paymentStatus: "PAID" })
      .populate("item.product")
      .lean()
    const productStats = {}
    for (const order of populated) {
      for (const item of order.item || []) {
        const prod = item.product
        const pid = prod ? String(prod._id) : null
        if (!pid) continue
        if (!productStats[pid]) {
          productStats[pid] = {
            product: prod,
            revenue: 0,
            quantity: 0,
          }
        }
        const qty = Number(item.quantity || 0)
        const price = Number(prod?.price || 0)
        productStats[pid].revenue += qty * price
        productStats[pid].quantity += qty
      }
    }

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return res.status(200).json({ topProducts })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching top products" })
  }
}

exports.topSellers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const paidOrders = await Order.find({ paymentStatus: "PAID" }).populate("item.product").exec()

    const sellerStats = {}
    paidOrders.forEach((order) => {
      order.item?.forEach((item) => {
        const sellerId = String(item.product?.seller || item.product?.seller?._id)
        if (!sellerId) return
        if (!sellerStats[sellerId]) {
          sellerStats[sellerId] = {
            sellerId,
            revenue: 0,
            orders: 0,
          }
        }
        const qty = Number(item.quantity || 0)
        const price = Number(item.product?.price || 0)
        sellerStats[sellerId].revenue += qty * price
        sellerStats[sellerId].orders += 1
      })
    })

    // Populate seller profiles
    const sellerIds = Object.keys(sellerStats)
    const profiles = await SellerProfile.find({ user: { $in: sellerIds } })
      .populate("user", "email name")
      .exec()

    const topSellers = sellerIds
      .map((sid) => {
        const stats = sellerStats[sid]
        const profile = profiles.find((p) => String(p.user._id) === sid)
        return {
          sellerId: sid,
          storeName: profile?.storeName || "Unknown",
          userEmail: profile?.user?.email || "Unknown",
          revenue: stats.revenue,
          orders: stats.orders,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)

    return res.status(200).json({ topSellers })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching top sellers" })
  }
}

exports.getAdvancedAdminStats = async (req, res) => {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 1. Churn Rate: Users who haven't ordered in 30 days vs total users
    const [totalUsers, activeUsers] = await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      Order.distinct('user', { createdAt: { $gte: thirtyDaysAgo } })
    ])
    const churnedUsersCount = totalUsers - activeUsers.length
    const churnRate = totalUsers > 0 ? (churnedUsersCount / totalUsers) * 100 : 0

    // 2. Abandoned Carts: Carts > 24h old and still active
    const twentyFourHoursAgo = new Date(now)
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    const abandonedCartsCount = await Cart.distinct('user', { updatedAt: { $lt: twentyFourHoursAgo } })

    // 3. LTV (Lifetime Value): Total revenue per user
    const ltvStats = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: '$user', totalLTV: { $sum: '$total' }, orderCount: { $sum: 1 } } },
      { $sort: { totalLTV: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
      { $unwind: '$userDetails' },
      { $project: { email: '$userDetails.email', name: '$userDetails.name', totalLTV: 1, orderCount: 1 } }
    ])

    return res.status(200).json({
      churn: { rate: churnRate, totalUsers, churnedCount: churnedUsersCount },
      abandonedCarts: { count: abandonedCartsCount.length },
      topLTV: ltvStats
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching advanced admin stats" })
  }
}

exports.getSellerMarketingStats = async (req, res) => {
  try {
    const sellerId = req.user._id
    const products = await Product.find({ seller: sellerId, isDeleted: false }).select('_id')
    const pIds = products.map(p => p._id)

    // 1. Conversion Rate: Views vs Sales
    const [views, purchases] = await Promise.all([
      ProductEvent.countDocuments({ product: { $in: pIds }, eventType: 'view' }),
      ProductEvent.countDocuments({ product: { $in: pIds }, eventType: 'purchase' })
    ])
    const conversionRate = views > 0 ? (purchases / views) * 100 : 0

    // 2. Abandoned Carts for this seller's products
    // (Approximation: active carts containing this seller's products)
    const abandonedItems = await Cart.countDocuments({ product: { $in: pIds } })

    // 3. Traffic Sources (Mock implementation as we don't have real referrer tracking yet)
    const trafficSources = [
      { source: 'Direct', count: Math.floor(views * 0.4) },
      { source: 'Search', count: Math.floor(views * 0.35) },
      { source: 'Social', count: Math.floor(views * 0.15) },
      { source: 'Referral', count: Math.floor(views * 0.1) }
    ]

    return res.status(200).json({
      conversionRate,
      views,
      purchases,
      abandonedItems,
      trafficSources
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching seller marketing stats" })
  }
}

exports.getReconciliationReport = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { 
          _id: null, 
          totalRevenue: { $sum: '$total' }, 
          totalCommission: { $sum: '$commissionTotal' },
          totalNetProfit: { $sum: '$netProfit' }
      }}
    ])

    const sellerBreakdown = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $unwind: '$item' },
      { $group: {
          _id: '$item.product.seller',
          revenue: { $sum: { $multiply: ['$item.unitPrice', '$item.quantity'] } },
          payout: { $sum: '$item.sellerPayout' },
          commissionSpent: { $sum: '$item.commissionAmount' }
      }},
      { $lookup: { from: 'sellerprofiles', localField: '_id', foreignField: 'user', as: 'profile' } },
      { $unwind: '$profile' },
      { $project: { storeName: '$profile.storeName', revenue: 1, payout: 1, commissionSpent: 1 } }
    ])

    return res.status(200).json({
      overview: stats[0] || { totalRevenue: 0, totalCommission: 0, totalNetProfit: 0 },
      sellerBreakdown
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Error fetching reconciliation report" })
  }
}
