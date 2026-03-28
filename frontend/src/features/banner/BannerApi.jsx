import { axiosi } from "../../config/axios"

export const fetchPublicBanners = async () => {
  const res = await axiosi.get("/banners")
  return res.data
}

export const fetchBannersForAdmin = async () => {
  const res = await axiosi.get("/banners/admin")
  return res.data
}

export const createBanner = async (payload) => {
  const res = await axiosi.post("/banners/admin", payload)
  return res.data
}

export const updateBanner = async (payload) => {
  const res = await axiosi.patch(`/banners/admin/${payload._id}`, payload)
  return res.data
}

export const deleteBanner = async (id) => {
  const res = await axiosi.delete(`/banners/admin/${id}`)
  return res.data
}

