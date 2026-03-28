import { axiosi } from "../../config/axios"

export const fetchAdminUsers = async (params = {}) => {
  const res = await axiosi.get("/admin/users", { params })
  return res.data
}

export const updateAdminUser = async (id, payload) => {
  const res = await axiosi.patch(`/admin/users/${id}`, payload)
  return res.data
}

export const fetchAdminSellers = async () => {
  const res = await axiosi.get("/sellers/admin")
  return res.data
}

export const updateAdminSeller = async (id, payload) => {
  const res = await axiosi.patch(`/sellers/admin/${id}`, payload)
  return res.data
}

export const fetchAdminAnalyticsOverview = async () => {
  const res = await axiosi.get("/admin/analytics/overview")
  return res.data
}

export const fetchAdminAnalyticsSales = async (range = "week") => {
  const res = await axiosi.get("/admin/analytics/sales", { params: { range } })
  return res.data
}

export const fetchAdminAnalyticsTopProducts = async (limit = 10) => {
  const res = await axiosi.get("/admin/analytics/top-products", { params: { limit } })
  return res.data
}

export const fetchAdminAnalyticsTopSellers = async (limit = 10) => {
  const res = await axiosi.get("/admin/analytics/top-sellers", { params: { limit } })
  return res.data
}

export const fetchAdminReturns = async (params = {}) => {
  const res = await axiosi.get("/returns/admin", { params })
  return res.data
}

export const updateAdminReturn = async (id, payload) => {
  const res = await axiosi.patch(`/returns/admin/${id}`, payload)
  return res.data
}

export const createReturnRequest = async (payload) => {
  const res = await axiosi.post("/returns", payload)
  return res.data
}

export const createDispute = async (payload) => {
  const res = await axiosi.post("/disputes", payload)
  return res.data
}

export const fetchAdminDisputes = async (params = {}) => {
  const res = await axiosi.get("/disputes/admin", { params })
  return res.data
}

export const updateAdminDispute = async (id, payload) => {
  const res = await axiosi.patch(`/disputes/admin/${id}`, payload)
  return res.data
}

export const fetchSellerDisputes = async () => {
  const res = await axiosi.get("/disputes/seller")
  return res.data
}

export const addDisputeMessage = async (id, payload, isSeller = false) => {
  const url = isSeller ? `/disputes/seller/${id}/messages` : `/disputes/${id}/messages`
  const res = await axiosi.post(url, payload)
  return res.data
}

export const escalateDispute = async (id) => {
  const res = await axiosi.post(`/disputes/${id}/escalate`)
  return res.data
}

// Catalog: categories, featured collections, search settings
export const fetchAdminCategories = async () => {
  const res = await axiosi.get("/admin/categories")
  return res.data
}
export const createAdminCategory = async (payload) => {
  const res = await axiosi.post("/admin/categories", payload)
  return res.data
}
export const updateAdminCategory = async (id, payload) => {
  const res = await axiosi.patch(`/admin/categories/${id}`, payload)
  return res.data
}
export const deleteAdminCategory = async (id) => {
  const res = await axiosi.delete(`/admin/categories/${id}`)
  return res.data
}

export const fetchAdminFeaturedCollections = async () => {
  const res = await axiosi.get("/featured-collections/admin")
  return res.data
}
export const createAdminFeaturedCollection = async (payload) => {
  const res = await axiosi.post("/featured-collections/admin", payload)
  return res.data
}
export const updateAdminFeaturedCollection = async (id, payload) => {
  const res = await axiosi.patch(`/featured-collections/admin/${id}`, payload)
  return res.data
}
export const deleteAdminFeaturedCollection = async (id) => {
  const res = await axiosi.delete(`/featured-collections/admin/${id}`)
  return res.data
}

export const fetchAdminSearchSettings = async () => {
  const res = await axiosi.get("/admin/search-settings")
  return res.data
}
export const updateAdminSearchSettings = async (payload) => {
  const res = await axiosi.patch("/admin/search-settings", payload)
  return res.data
}

// Marketing: campaigns, notifications, loyalty
export const fetchAdminCampaigns = async () => {
  const res = await axiosi.get("/campaigns/admin")
  return res.data
}
export const createAdminCampaign = async (payload) => {
  const res = await axiosi.post("/campaigns/admin", payload)
  return res.data
}
export const updateAdminCampaign = async (id, payload) => {
  const res = await axiosi.patch(`/campaigns/admin/${id}`, payload)
  return res.data
}
export const deleteAdminCampaign = async (id) => {
  const res = await axiosi.delete(`/campaigns/admin/${id}`)
  return res.data
}

export const fetchAdminNotifications = async () => {
  const res = await axiosi.get("/notifications/admin")
  return res.data
}
export const createAdminNotification = async (payload) => {
  const res = await axiosi.post("/notifications/admin", payload)
  return res.data
}
export const deleteAdminNotification = async (id) => {
  const res = await axiosi.delete(`/notifications/admin/${id}`)
  return res.data
}

export const fetchAdminLoyalty = async (params = {}) => {
  const res = await axiosi.get("/loyalty/admin", { params })
  return res.data
}
export const adminAdjustLoyalty = async (payload) => {
  const res = await axiosi.post("/loyalty/admin/adjust", payload)
  return res.data
}
export const fetchLoyaltyBalance = async (userId) => {
  const res = await axiosi.get(`/loyalty/balance/${userId}`)
  return res.data
}
export const fetchMyLoyalty = async () => {
  const res = await axiosi.get("/loyalty/me")
  return res.data
}

// System settings
export const fetchAdminSystemSettings = async () => {
  const res = await axiosi.get("/admin/settings")
  return res.data
}
export const updateAdminSystemSettings = async (payload) => {
  const res = await axiosi.patch("/admin/settings", payload)
  return res.data
}

export const fetchAdminAuditLogs = async (params = {}) => {
  const res = await axiosi.get("/admin/audit-logs", { params })
  return res.data
}

export const fetchAdminStaleOrders = async () => {
  const res = await axiosi.get("/orders/admin/stale-orders")
  return res.data
}

export const fetchAdminAdvancedStats = async () => {
  const res = await axiosi.get("/admin/analytics/advanced-stats")
  return res.data
}

export const fetchAdminReconciliation = async () => {
  const res = await axiosi.get("/admin/analytics/reconciliation")
  return res.data
}

export const fetchSellerMarketingStats = async () => {
  const res = await axiosi.get("/admin/analytics/seller-marketing")
  return res.data
}

