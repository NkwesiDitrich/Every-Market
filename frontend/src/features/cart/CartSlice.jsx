import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addToCart, fetchCartByUserId, updateCartItemById, deleteCartItemById, resetCartByUserId, generateShareableCart, fetchSharedCart } from './CartApi'
import { axiosi } from '../../config/axios'
import { loginAsync, signupAsync, verifyOtpAsync } from '../auth/AuthSlice'

const GUEST_CART_KEY = 'every_market_guest_cart'

const loadGuestCart = () => {
    try {
        const raw = localStorage.getItem(GUEST_CART_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
    } catch (e) {
        return []
    }
}

const saveGuestCart = (items) => {
    try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
    } catch (e) {
        // ignore
    }
}

const initialState = {
    status: "idle",
    items: [],
    guestItems: loadGuestCart(),
    cartItemAddStatus: "idle",
    cartItemRemoveStatus: "idle",
    shareableId: null,
    sharedItems: [],
    shareStatus: "idle",
    errors: null,
    successMessage: null
}

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async (item, { getState }) => {
    const loggedInUser = getState()?.AuthSlice?.loggedInUser
    if (!loggedInUser) {
        const productId = item.product
        const qty = Number(item.quantity || 1)
        const res = await axiosi.get(`/products/${productId}`)
        const product = res.data
        const current = loadGuestCart()
        const existingIndex = current.findIndex((ci) => ci.product?._id === productId)
        let next = [...current]
        if (existingIndex >= 0) {
            next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + qty }
        } else {
            next.push({ _id: `guest-${productId}`, product, quantity: qty })
        }
        saveGuestCart(next)
        return { __guest: true, items: next }
    }
    const addedItem = await addToCart(item)
    return { __guest: false, item: addedItem }
})
export const fetchCartByUserIdAsync = createAsyncThunk('cart/fetchCartByUserIdAsync', async (id, { getState }) => {
    const loggedInUser = getState()?.AuthSlice?.loggedInUser
    if (!loggedInUser) {
        return { __guest: true, items: loadGuestCart() }
    }
    const items = await fetchCartByUserId(id)
    return { __guest: false, items }
})
export const updateCartItemByIdAsync = createAsyncThunk('cart/updateCartItemByIdAsync', async (update, { getState }) => {
    const loggedInUser = getState()?.AuthSlice?.loggedInUser
    if (!loggedInUser) {
        const current = loadGuestCart()
        const idx = current.findIndex((ci) => ci._id === update._id)
        if (idx >= 0) {
            const next = [...current]
            next[idx] = { ...next[idx], quantity: Number(update.quantity || 1) }
            saveGuestCart(next)
            return { __guest: true, items: next }
        }
        return { __guest: true, items: current }
    }
    const updatedItem = await updateCartItemById(update)
    return { __guest: false, item: updatedItem }
})
export const deleteCartItemByIdAsync = createAsyncThunk('cart/deleteCartItemByIdAsync', async (id, { getState }) => {
    const loggedInUser = getState()?.AuthSlice?.loggedInUser
    if (!loggedInUser) {
        const current = loadGuestCart()
        const next = current.filter((ci) => ci._id !== id)
        saveGuestCart(next)
        return { __guest: true, items: next, deletedId: id }
    }
    const deletedItem = await deleteCartItemById(id)
    return { __guest: false, item: deletedItem }
})
export const mergeCartAsync = createAsyncThunk('cart/mergeCartAsync', async (id, { getState, dispatch }) => {
    const guestItems = getState()?.CartSlice?.guestItems || []
    if (guestItems.length === 0) return { __guest: false, items: [] }
    
    try {
        // Sequentially add each guest item to the user's permanent cart
        for (const item of guestItems) {
            const payload = {
                product: item.product?._id || item.product,
                quantity: item.quantity,
                user: id
            }
            await addToCart(payload)
        }
        saveGuestCart([]) // Clear local storage
        const userCart = await fetchCartByUserId(id)
        return { __guest: false, items: userCart }
    } catch (e) {
        console.error("Cart merge partially failed", e)
        throw e
    }
})

export const refreshCartAsync = createAsyncThunk('cart/refreshCartAsync', async (_, { getState }) => {
    const state = getState()
    const loggedInUser = state.AuthSlice?.loggedInUser
    
    if (loggedInUser) {
        const items = await fetchCartByUserId(loggedInUser._id)
        return { __guest: false, items }
    } else {
        const current = loadGuestCart()
        if (current.length === 0) return { __guest: true, items: [] }
        
        // Refresh products for guest items
        const next = await Promise.all(current.map(async (item) => {
            try {
                const productId = item.product?._id || item.product
                const res = await axiosi.get(`/products/${productId}`)
                return { ...item, product: res.data }
            } catch (e) {
                return item // fallback to old item if fetch fails
            }
        }))
        saveGuestCart(next)
        return { __guest: true, items: next }
    }
})

export const resetCartByUserIdAsync = createAsyncThunk('cart/resetCartByUserIdAsync', async (userId, { getState }) => {
    const loggedInUser = getState()?.AuthSlice?.loggedInUser
    if (!loggedInUser) {
        saveGuestCart([])
        return { __guest: true, items: [] }
    }
    await resetCartByUserId(userId)
    return { __guest: false }
})

export const generateShareableCartAsync = createAsyncThunk('cart/generateShareableCartAsync', async () => {
    const response = await generateShareableCart()
    return response
})

export const fetchSharedCartAsync = createAsyncThunk('cart/fetchSharedCartAsync', async (shareableId) => {
    const response = await fetchSharedCart(shareableId)
    return response
})

const cartSlice = createSlice({
    name: "cartSlice",
    initialState: initialState,
    reducers: {
        resetCartItemAddStatus: (state) => {
            state.cartItemAddStatus = 'idle'
        },
        resetCartItemRemoveStatus: (state) => {
            state.cartItemRemoveStatus = 'idle'
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.cartItemAddStatus = 'pending'
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.cartItemAddStatus = 'fulfilled'
                if (action.payload.__guest) {
                    state.guestItems = action.payload.items || []
                } else if (action.payload.item) {
                    state.items.push(action.payload.item)
                }
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.cartItemAddStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(fetchCartByUserIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                if (action.payload.__guest) {
                    state.guestItems = action.payload.items
                } else {
                    state.items = action.payload.items
                }
            })
            .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(updateCartItemByIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                if (action.payload.__guest) {
                    state.guestItems = action.payload.items || []
                } else if (action.payload.item) {
                    const index = state.items.findIndex((item) => item?._id === action.payload.item?._id)
                    if (index !== -1) {
                        state.items[index] = action.payload.item
                    }
                }
            })
            .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(deleteCartItemByIdAsync.pending, (state) => {
                state.cartItemRemoveStatus = 'pending'
            })
            .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
                state.cartItemRemoveStatus = 'fulfilled'
                if (action.payload.__guest) {
                    state.guestItems = action.payload.items || []
                } else if (action.payload.item) {
                    state.items = state.items.filter((item) => item && item._id !== action.payload.item._id)
                }
            })
            .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
                state.cartItemRemoveStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(mergeCartAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(mergeCartAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.items = action.payload.items
                state.guestItems = [] // Clear guest items in state
            })
            .addCase(mergeCartAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(resetCartByUserIdAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(resetCartByUserIdAsync.fulfilled, (state) => {
                state.status = 'fulfilled'
                state.items = []
                state.guestItems = []
            })
            .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(refreshCartAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(refreshCartAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                if (action.payload.__guest) {
                    state.guestItems = action.payload.items
                } else {
                    state.items = action.payload.items
                }
            })
            .addCase(refreshCartAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })

            .addCase(generateShareableCartAsync.pending, (state) => {
                state.shareStatus = 'pending'
            })
            .addCase(generateShareableCartAsync.fulfilled, (state, action) => {
                state.shareStatus = 'fulfilled'
                state.shareableId = action.payload.shareableId
            })
            .addCase(generateShareableCartAsync.rejected, (state, action) => {
                state.shareStatus = 'rejected'
                state.errors = action.error
            })

            .addCase(fetchSharedCartAsync.pending, (state) => {
                state.status = 'pending'
            })
            .addCase(fetchSharedCartAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled'
                state.sharedItems = action.payload
            })
            .addCase(fetchSharedCartAsync.rejected, (state, action) => {
                state.status = 'rejected'
                state.errors = action.error
            })
    }
})

// exporting selectors
export const selectCartStatus = (state) => state.CartSlice.status
export const selectCartItems = (state) => state.AuthSlice?.loggedInUser ? state.CartSlice.items : state.CartSlice.guestItems
export const selectCartErrors = (state) => state.CartSlice.errors
export const selectCartSuccessMessage = (state) => state.CartSlice.successMessage
export const selectCartItemAddStatus = (state) => state.CartSlice.cartItemAddStatus
export const selectCartItemRemoveStatus = (state) => state.CartSlice.cartItemRemoveStatus
export const selectShareableId = (state) => state.CartSlice.shareableId
export const selectSharedCartItems = (state) => state.CartSlice.sharedItems
export const selectShareStatus = (state) => state.CartSlice.shareStatus

// exporting reducers
export const { resetCartItemAddStatus, resetCartItemRemoveStatus } = cartSlice.actions

export default cartSlice.reducer