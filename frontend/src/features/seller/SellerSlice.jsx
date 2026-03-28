import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import {
  applyAsSeller,
  fetchMySellerProfile,
  fetchSellerAnalyticsSummary,
  fetchSellerOrders,
  fetchSellerProducts,
  updateSellerOrder,
  updateInventory,
  fetchInventoryHistory,
  fetchSellerMarketingStats,
} from "./SellerApi"

const initialState = {
  status: "idle",
  profileStatus: "idle",
  analyticsStatus: "idle",
  ordersStatus: "idle",
  productsStatus: "idle",
  profile: null,
  products: [],
  orders: [],
  analytics: null,
  inventoryHistory: [],
  inventoryHistoryStatus: "idle",
  marketingStats: null,
  marketingStatsStatus: "idle",
  errors: null,
}

export const applyAsSellerAsync = createAsyncThunk("seller/applyAsSellerAsync", async (payload) => {
  const profile = await applyAsSeller(payload)
  return profile
})

export const fetchMySellerProfileAsync = createAsyncThunk("seller/fetchMySellerProfileAsync", async () => {
  const profile = await fetchMySellerProfile()
  return profile
})

export const fetchSellerProductsAsync = createAsyncThunk("seller/fetchSellerProductsAsync", async () => {
  const data = await fetchSellerProducts()
  return data
})

export const fetchSellerOrdersAsync = createAsyncThunk("seller/fetchSellerOrdersAsync", async () => {
  const data = await fetchSellerOrders()
  return data
})

export const fetchSellerAnalyticsSummaryAsync = createAsyncThunk("seller/fetchSellerAnalyticsSummaryAsync", async () => {
  const data = await fetchSellerAnalyticsSummary()
  return data
})

export const updateSellerOrderAsync = createAsyncThunk("seller/updateSellerOrderAsync", async ({ orderId, status }) => {
  const data = await updateSellerOrder(orderId, status)
  return data
})

export const updateInventoryAsync = createAsyncThunk("seller/updateInventoryAsync", async ({ productId, payload }) => {
  const data = await updateInventory(productId, payload)
  return data
})

export const fetchInventoryHistoryAsync = createAsyncThunk("seller/fetchInventoryHistoryAsync", async (productId) => {
  const data = await fetchInventoryHistory(productId)
  return data
})

export const fetchSellerMarketingStatsAsync = createAsyncThunk("seller/fetchSellerMarketingStatsAsync", async () => {
  const data = await fetchSellerMarketingStats()
  return data
})

const sellerSlice = createSlice({
  name: "sellerSlice",
  initialState,
  reducers: {
    resetSellerStatus: (state) => {
      state.status = "idle"
      state.profileStatus = "idle"
      state.productsStatus = "idle"
      state.ordersStatus = "idle"
      state.analyticsStatus = "idle"
      state.inventoryHistoryStatus = "idle"
      state.marketingStatsStatus = "idle"
      state.errors = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyAsSellerAsync.pending, (state) => {
        state.status = "pending"
      })
      .addCase(applyAsSellerAsync.fulfilled, (state, action) => {
        state.status = "fulfilled"
        state.profile = action.payload
      })
      .addCase(applyAsSellerAsync.rejected, (state, action) => {
        state.status = "rejected"
        state.errors = action.error
      })

      .addCase(fetchMySellerProfileAsync.pending, (state) => {
        state.profileStatus = "pending"
      })
      .addCase(fetchMySellerProfileAsync.fulfilled, (state, action) => {
        state.profileStatus = "fulfilled"
        state.profile = action.payload
      })
      .addCase(fetchMySellerProfileAsync.rejected, (state, action) => {
        state.profileStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchSellerProductsAsync.pending, (state) => {
        state.productsStatus = "pending"
      })
      .addCase(fetchSellerProductsAsync.fulfilled, (state, action) => {
        state.productsStatus = "fulfilled"
        state.products = action.payload
      })
      .addCase(fetchSellerProductsAsync.rejected, (state, action) => {
        state.productsStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchSellerOrdersAsync.pending, (state) => {
        state.ordersStatus = "pending"
      })
      .addCase(fetchSellerOrdersAsync.fulfilled, (state, action) => {
        state.ordersStatus = "fulfilled"
        state.orders = action.payload
      })
      .addCase(fetchSellerOrdersAsync.rejected, (state, action) => {
        state.ordersStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchSellerAnalyticsSummaryAsync.pending, (state) => {
        state.analyticsStatus = "pending"
      })
      .addCase(fetchSellerAnalyticsSummaryAsync.fulfilled, (state, action) => {
        state.analyticsStatus = "fulfilled"
        state.analytics = action.payload
      })
      .addCase(fetchSellerAnalyticsSummaryAsync.rejected, (state, action) => {
        state.analyticsStatus = "rejected"
        state.errors = action.error
      })
      .addCase(updateSellerOrderAsync.pending, (state) => {
        state.ordersStatus = "pending"
      })
      .addCase(updateSellerOrderAsync.fulfilled, (state, action) => {
        state.ordersStatus = "fulfilled"
        const index = state.orders.findIndex(o => o._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(updateSellerOrderAsync.rejected, (state, action) => {
        state.ordersStatus = "rejected"
        state.errors = action.error
      })

      .addCase(updateInventoryAsync.pending, (state) => {
        state.productsStatus = "pending"
      })
      .addCase(updateInventoryAsync.fulfilled, (state, action) => {
        state.productsStatus = "fulfilled"
        const index = state.products.findIndex(p => p._id === action.payload.product?._id || action.payload.product?.id)
        if (index !== -1) {
          // Merge updated stock info
          state.products[index].stockQuantity = action.payload.product.stockQuantity
          state.products[index].stockStatus = action.payload.product.stockStatus
        }
      })
      .addCase(updateInventoryAsync.rejected, (state, action) => {
        state.productsStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchInventoryHistoryAsync.rejected, (state, action) => {
        state.inventoryHistoryStatus = "rejected"
        state.errors = action.error
      })

      .addCase(fetchSellerMarketingStatsAsync.pending, (state) => {
        state.marketingStatsStatus = "pending"
      })
      .addCase(fetchSellerMarketingStatsAsync.fulfilled, (state, action) => {
        state.marketingStatsStatus = "fulfilled"
        state.marketingStats = action.payload
      })
      .addCase(fetchSellerMarketingStatsAsync.rejected, (state, action) => {
        state.marketingStatsStatus = "rejected"
        state.errors = action.error
      })
  },
})

export const { resetSellerStatus } = sellerSlice.actions

export const selectSellerProfile = (state) => state.SellerSlice.profile
export const selectSellerProfileStatus = (state) => state.SellerSlice.profileStatus
export const selectSellerProducts = (state) => state.SellerSlice.products
export const selectSellerProductsStatus = (state) => state.SellerSlice.productsStatus
export const selectSellerOrders = (state) => state.SellerSlice.orders
export const selectSellerOrdersStatus = (state) => state.SellerSlice.ordersStatus
export const selectSellerAnalytics = (state) => state.SellerSlice.analytics
export const selectSellerAnalyticsStatus = (state) => state.SellerSlice.analyticsStatus
export const selectInventoryHistory = (state) => state.SellerSlice.inventoryHistory
export const selectInventoryHistoryStatus = (state) => state.SellerSlice.inventoryHistoryStatus
export const selectSellerMarketingStats = (state) => state.SellerSlice.marketingStats
export const selectSellerMarketingStatsStatus = (state) => state.SellerSlice.marketingStatsStatus

export default sellerSlice.reducer
