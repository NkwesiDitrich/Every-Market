import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { fetchBannersForAdmin, fetchPublicBanners } from "./BannerApi"

const initialState = {
  publicStatus: "idle",
  adminStatus: "idle",
  publicBanners: [],
  adminBanners: [],
  errors: null,
}

export const fetchPublicBannersAsync = createAsyncThunk("banner/fetchPublicBannersAsync", async () => {
  const banners = await fetchPublicBanners()
  return banners
})

export const fetchBannersForAdminAsync = createAsyncThunk("banner/fetchBannersForAdminAsync", async () => {
  const banners = await fetchBannersForAdmin()
  return banners
})

const bannerSlice = createSlice({
  name: "bannerSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicBannersAsync.pending, (state) => {
        state.publicStatus = "pending"
      })
      .addCase(fetchPublicBannersAsync.fulfilled, (state, action) => {
        state.publicStatus = "fulfilled"
        state.publicBanners = action.payload
      })
      .addCase(fetchPublicBannersAsync.rejected, (state, action) => {
        state.publicStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchBannersForAdminAsync.pending, (state) => {
        state.adminStatus = "pending"
      })
      .addCase(fetchBannersForAdminAsync.fulfilled, (state, action) => {
        state.adminStatus = "fulfilled"
        state.adminBanners = action.payload
      })
      .addCase(fetchBannersForAdminAsync.rejected, (state, action) => {
        state.adminStatus = "rejected"
        state.errors = action.error
      })
  },
})

export const selectPublicBanners = (state) => state.BannerSlice.publicBanners
export const selectPublicBannersStatus = (state) => state.BannerSlice.publicStatus
export const selectAdminBanners = (state) => state.BannerSlice.adminBanners
export const selectAdminBannersStatus = (state) => state.BannerSlice.adminStatus

export default bannerSlice.reducer

