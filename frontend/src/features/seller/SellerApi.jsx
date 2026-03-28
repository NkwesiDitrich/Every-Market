import { axiosi } from "../../config/axios"

export const applyAsSeller = async (payload) => {
  const res = await axiosi.post("/sellers/apply", payload)
  return res.data
}

export const fetchMySellerProfile = async () => {
  const res = await axiosi.get("/sellers/me")
  return res.data
}

export const fetchSellerProducts = async () => {
  const res = await axiosi.get("/sellers/products")
  return res.data
}

export const createSellerProduct = async (payload) => {
  const res = await axiosi.post("/sellers/products", payload)
  return res.data
}

export const updateSellerProduct = async (update) => {
  const res = await axiosi.patch(`/sellers/products/${update._id}`, update)
  return res.data
}

export const deleteSellerProduct = async (id) => {
  const res = await axiosi.delete(`/sellers/products/${id}`)
  return res.data
}

export const fetchSellerOrders = async () => {
  const res = await axiosi.get("/sellers/orders")
  return res.data
}

export const fetchSellerAnalyticsSummary = async () => {
  const res = await axiosi.get("/sellers/analytics/summary")
  return res.data
}

export const fetchSellerMarketingStats = async () => {
  const res = await axiosi.get("/admin/analytics/seller-marketing")
  return res.data
}

export const fetchSellerAnalyticsFunnel = async () => {
  const res = await axiosi.get("/sellers/analytics/funnel")
  return res.data
}

export const fetchSellerAnalyticsCohorts = async () => {
  const res = await axiosi.get("/sellers/analytics/cohorts")
  return res.data
}

export const fetchSellerCoupons = async () => {
  const res = await axiosi.get("/sellers/coupons")
  return res.data
}

export const createSellerCoupon = async (payload) => {
  const res = await axiosi.post("/sellers/coupons", payload)
  return res.data
}

export const updateSellerCoupon = async (payload) => {
  const res = await axiosi.patch(`/sellers/coupons/${payload._id}`, payload)
  return res.data
}

export const deleteSellerCoupon = async (id) => {
  const res = await axiosi.delete(`/sellers/coupons/${id}`)
  return res.data
}

export const fetchSellerBundles = async () => {
  const res = await axiosi.get("/sellers/bundles")
  return res.data
}

export const createSellerBundle = async (payload) => {
  const res = await axiosi.post("/sellers/bundles", payload)
  return res.data
}

export const updateSellerBundle = async (payload) => {
  const res = await axiosi.patch(`/sellers/bundles/${payload._id}`, payload)
  return res.data
}

export const deleteSellerBundle = async (id) => {
  const res = await axiosi.delete(`/sellers/bundles/${id}`)
  return res.data
}

export const fetchSellerConversations = async () => {
  const res = await axiosi.get("/sellers/conversations")
  return res.data
}

export const fetchSellerConversationMessages = async (conversationId) => {
  const res = await axiosi.get(`/sellers/conversations/${conversationId}/messages`)
  return res.data
}

export const sendSellerMessage = async (conversationId, body) => {
  const res = await axiosi.post(`/sellers/conversations/${conversationId}/messages`, { body })
  return res.data
}

export const fetchSellerReviews = async (params = {}) => {
  const res = await axiosi.get("/sellers/reviews", { params })
  return res.data
}

export const replyToSellerReview = async (reviewId, sellerReply) => {
  const res = await axiosi.patch(`/sellers/reviews/${reviewId}/reply`, { sellerReply })
  return res.data
}

export const sendMessageToSeller = async (sellerId, body, orderId) => {
  const res = await axiosi.post("/conversations", { sellerId, body, orderId })
  return res.data
}

export const trackProductEvent = async (productId, eventType) => {
  const res = await axiosi.post("/products/track", { productId, eventType })
  return res.data
}

export const fetchSellersForAdmin = async () => {
  const res = await axiosi.get("/sellers/admin")
  return res.data
}

export const updateSellerForAdmin = async (update) => {
  const res = await axiosi.patch(`/sellers/admin/${update._id}`, update)
  return res.data
}

export const updateSellerOrder = async (orderId, status) => {
  const res = await axiosi.patch(`/orders/${orderId}`, { status })
  return res.data
}

export const updateInventory = async (productId, payload) => {
  const res = await axiosi.patch(`/inventory/${productId}/update`, payload)
  return res.data
}

export const fetchInventoryHistory = async (productId) => {
  const res = await axiosi.get(`/inventory/${productId}/history`)
  return res.data
}

export const fetchSellerReturns = async (params = {}) => {
  const res = await axiosi.get("/returns/seller", { params })
  return res.data
}

export const updateSellerReturn = async (returnId, payload) => {
  const res = await axiosi.patch(`/returns/seller/${returnId}`, payload)
  return res.data
}

