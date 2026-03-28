import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { applyCouponToCart, fetchCouponsForAdmin } from "./CouponApi"

const initialState = {
  adminStatus: "idle",
  applyStatus: "idle",
  coupons: [],
  applied: null,
  errors: null,
}

export const fetchCouponsForAdminAsync = createAsyncThunk("coupon/fetchCouponsForAdminAsync", async () => {
  const data = await fetchCouponsForAdmin()
  return data
})

export const applyCouponToCartAsync = createAsyncThunk("coupon/applyCouponToCartAsync", async (code) => {
  const data = await applyCouponToCart(code)
  return data
})

const couponSlice = createSlice({
  name: "couponSlice",
  initialState,
  reducers: {
    resetAppliedCoupon: (state) => {
      state.applied = null
      state.applyStatus = "idle"
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCouponsForAdminAsync.pending, (state) => {
        state.adminStatus = "pending"
      })
      .addCase(fetchCouponsForAdminAsync.fulfilled, (state, action) => {
        state.adminStatus = "fulfilled"
        state.coupons = action.payload
      })
      .addCase(fetchCouponsForAdminAsync.rejected, (state, action) => {
        state.adminStatus = "rejected"
        state.errors = action.error
      })

      .addCase(applyCouponToCartAsync.pending, (state) => {
        state.applyStatus = "pending"
      })
      .addCase(applyCouponToCartAsync.fulfilled, (state, action) => {
        state.applyStatus = "fulfilled"
        state.applied = action.payload
      })
      .addCase(applyCouponToCartAsync.rejected, (state, action) => {
        state.applyStatus = "rejected"
        state.errors = action.error
      })
  },
})

export const { resetAppliedCoupon } = couponSlice.actions

export const selectAdminCoupons = (state) => state.CouponSlice.coupons
export const selectAdminCouponsStatus = (state) => state.CouponSlice.adminStatus
export const selectAppliedCoupon = (state) => state.CouponSlice.applied
export const selectApplyCouponStatus = (state) => state.CouponSlice.applyStatus

export default couponSlice.reducer

