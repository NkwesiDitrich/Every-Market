import { axiosi } from "../../config/axios"

export const fetchCouponsForAdmin = async () => {
  const res = await axiosi.get("/coupons/admin")
  return res.data
}

export const createCoupon = async (payload) => {
  const res = await axiosi.post("/coupons/admin", payload)
  return res.data
}

export const updateCoupon = async (payload) => {
  const res = await axiosi.patch(`/coupons/admin/${payload._id}`, payload)
  return res.data
}

export const deleteCoupon = async (id) => {
  const res = await axiosi.delete(`/coupons/admin/${id}`)
  return res.data
}

export const applyCouponToCart = async (code) => {
  const res = await axiosi.post("/coupons/apply", { code })
  return res.data
}

