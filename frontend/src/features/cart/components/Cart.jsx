import React, { useEffect } from 'react'
import { Box, Button, Chip, Stack, Typography, useMediaQuery, useTheme, Grid, Divider, Paper } from '@mui/material'
import { resetCartItemRemoveStatus, selectCartItemRemoveStatus, selectCartItems, generateShareableCartAsync, selectShareableId, selectShareStatus } from '../CartSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { SHIPPING, TAXES } from '../../../constants'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { shoppingBagAnimation } from '../../../assets'
import Lottie from 'lottie-react'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { updateCartItemByIdAsync, deleteCartItemByIdAsync } from '../CartSlice'
import { IconButton } from '@mui/material'
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { RoleGuard } from '../../auth/components/RoleGuard';
import { selectActiveRole } from '../../auth/AuthSlice';

const NO_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjYuNjY2NyA2Ni42NjY3SDEzMy4zMzNWMTMzLjMzM0g2Ni42NjY3VjY2LjY2NjdaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02Ni42NjY3IDExNi42NjdMODMuMzMzMyAxMDBMMTAzLjMzMyAxMjBMMTE2LjY2NyAxMDYuNjY3TDEzMy4zMzMgMTIzLjMzMyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjgzLjMzMzMiIGN5PSI4My4zMzMzIiByPSI2LjY2NjY3IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+`

export const CartItem = ({ id, thumbnail, title, category, brand, price, quantity, stockQuantity, productId }) => {
    const dispatch = useDispatch()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleAddQty = () => {
        if (quantity < stockQuantity) {
            const update = { _id: id, quantity: quantity + 1 }
            dispatch(updateCartItemByIdAsync(update))
        }
    }

    const handleRemoveQty = () => {
        if (quantity === 1) {
            dispatch(deleteCartItemByIdAsync(id))
        } else {
            const update = { _id: id, quantity: quantity - 1 }
            dispatch(updateCartItemByIdAsync(update))
        }
    }

    const handleProductRemove = () => {
        dispatch(deleteCartItemByIdAsync(id))
    }

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 4, border: '1px solid #F0F0F0', bgcolor: '#fff' }}>
            <Stack direction="row" spacing={2} alignItems="center">
                {/* Product Image */}
                <Box
                    component={Link}
                    to={`/product-details/${productId}`}
                    sx={{
                        width: { xs: 80, sm: 120 },
                        height: { xs: 80, sm: 120 },
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: '#F8F9FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                >
                    <img
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                        src={thumbnail || NO_IMAGE_BASE64}
                        alt={title}
                        onError={(e) => { e.target.src = NO_IMAGE_BASE64 }}
                    />
                </Box>

                {/* Product Details */}
                <Stack flex={1} spacing={0.5}>
                    <Typography
                        component={Link}
                        to={`/product-details/${productId}`}
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ textDecoration: 'none', color: 'text.primary', '&:hover': { color: 'primary.main' } }}
                    >
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                        {brand} • {category}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1.5 }}>
                        {/* Quantity Controls */}
                        <Stack direction="row" alignItems="center" sx={{ border: '1px solid #E0E0E0', borderRadius: 2, bgcolor: '#fff' }}>
                            <IconButton size="small" onClick={handleRemoveQty} sx={{ p: 0.5 }}><RemoveIcon fontSize="small" /></IconButton>
                            <Typography sx={{ width: 30, textAlign: 'center', fontWeight: 600 }}>{quantity}</Typography>
                            <IconButton 
                                size="small" 
                                onClick={handleAddQty} 
                                sx={{ p: 0.5 }} 
                                disabled={quantity >= stockQuantity}
                            >
                                <AddIcon fontSize="small" />
                            </IconButton>
                        </Stack>

                        {!isMobile && (
                            <Button
                                size="small"
                                color="error"
                                onClick={handleProductRemove}
                                sx={{ fontWeight: 600 }}
                            >
                                Remove
                            </Button>
                        )}
                    </Stack>
                    
                    {quantity > stockQuantity && (
                        <Typography variant="caption" color="error" fontWeight={700} sx={{ mt: 1 }}>
                            ⚠️ Insufficient stock (Only {stockQuantity} available)
                        </Typography>
                    )}
                </Stack>

                {/* Price & Mobile Remove */}
                <Stack alignItems="flex-end" spacing={1}>
                    <Typography variant="h6" fontWeight={700}>
                        {(price * quantity).toFixed(2)} CFA
                    </Typography>
                    {isMobile && (
                        <IconButton size="small" color="error" onClick={handleProductRemove}>
                            <RemoveIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            </Stack>
        </Paper>
    )
}

export const Cart = ({ checkout, appliedCoupon, loyaltyDiscount = 0 }) => {
    const items = useSelector(selectCartItems)
    const subtotal = items.reduce((acc, item) => (item.product?.price || 0) * item.quantity + acc, 0)
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
    const navigate = useNavigate()
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))

    const cartItemRemoveStatus = useSelector(selectCartItemRemoveStatus)
    const shareableId = useSelector(selectShareableId)
    const shareStatus = useSelector(selectShareStatus)
    const activeRole = useSelector(selectActiveRole);
    const dispatch = useDispatch()

    const handleShareCart = () => {
        dispatch(generateShareableCartAsync())
    }

    const shareUrl = shareableId ? `${window.location.origin}/cart/shared/${shareableId}` : null

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareUrl)
        toast.success("Cart link copied!")
    }

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
    }, [])

    useEffect(() => {
        if (cartItemRemoveStatus === 'fulfilled') {
            toast.success("Product removed from cart")
        }
        else if (cartItemRemoveStatus === 'rejected') {
            toast.error("Error removing product from cart, please try again later")
        }
    }, [cartItemRemoveStatus])

    useEffect(() => {
        return () => dispatch(resetCartItemRemoveStatus())
    }, [dispatch])

    if (items.length === 0 && !checkout) {
        return (
            <Box sx={{ bgcolor: 'background.default', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stack
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                    sx={{ px: 2, textAlign: 'center', maxWidth: 400 }}
                >
                    <Box sx={{ width: 240, mb: -2 }}>
                        <Lottie animationData={shoppingBagAnimation} />
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} gutterBottom>
                            Your cart is empty
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Looks like you haven't added anything to your cart yet. Let's find some amazing products!
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/')}
                        sx={{ px: 6, py: 2, borderRadius: 3, fontWeight: 700 }}
                    >
                        Start Shopping
                    </Button>
                </Stack>
            </Box>
        )
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800}>
                        {checkout ? "Order Summary" : "Shopping Cart"}
                    </Typography>
                    
                    {!checkout && items.length > 0 && (
                        <Stack direction="row" spacing={1}>
                            {shareableId ? (
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ContentCopyIcon />} 
                                    onClick={copyToClipboard}
                                    sx={{ borderRadius: 3, textTransform: 'none' }}
                                >
                                    Copy Link
                                </Button>
                            ) : (
                                <Button 
                                    variant="outlined" 
                                    startIcon={<ShareIcon />} 
                                    onClick={handleShareCart}
                                    disabled={shareStatus === 'pending'}
                                    sx={{ borderRadius: 3, textTransform: 'none' }}
                                >
                                    Share Cart
                                </Button>
                            )}
                        </Stack>
                    )}
                </Stack>

                <Grid container spacing={{ xs: 4, md: 6 }}>
                    {/* Items List */}
                    <Grid item xs={12} md={checkout ? 12 : 8}>
                        <Stack spacing={2}>
                            {items.map((item) => (
                                <CartItem
                                    key={item._id}
                                    id={item._id}
                                    title={item.product?.title || 'Product Not Available'}
                                    brand={item.product?.brand?.name}
                                    category={item.product?.category?.name}
                                    price={item.product?.price || 0}
                                    quantity={item.quantity}
                                    thumbnail={item.product?.images?.[0] || item.product?.thumbnail || NO_IMAGE_BASE64}
                                    stockQuantity={item.product?.stockQuantity || 0}
                                    productId={item.product?._id}
                                />
                            ))}
                        </Stack>
                    </Grid>

                    {/* Summary Section */}
                    {!checkout && (
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #F0F0F0', position: 'sticky', top: 100 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Summary</Typography>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Subtotal ({totalItems} items)</Typography>
                                        <Typography fontWeight={600}>{subtotal.toFixed(2)} CFA</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Shipping</Typography>
                                        <Typography fontWeight={600} color="success.main">FREE</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Taxes</Typography>
                                        <Typography fontWeight={600}>Calculated at checkout</Typography>
                                    </Stack>

                                    <Divider sx={{ my: 1 }} />

                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="h6" fontWeight={800}>Total</Typography>
                                        <Typography variant="h6" fontWeight={800}>{subtotal.toFixed(2)} CFA</Typography>
                                    </Stack>

                                    <RoleGuard 
                                        roles={['buyer']} 
                                        fallback={
                                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary" align="center">
                                                    You are currently in <strong>{activeRole} Mode</strong>. 
                                                    Please switch to <strong>Buyer Mode</strong> to proceed with checkout.
                                                </Typography>
                                            </Box>
                                        }
                                    >
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            component={Link}
                                            to="/checkout"
                                            sx={{ py: 2, borderRadius: 3, mt: 2, fontWeight: 700 }}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </RoleGuard>

                                    <Button
                                        fullWidth
                                        variant="text"
                                        component={Link}
                                        to="/"
                                        sx={{ color: 'text.secondary' }}
                                    >
                                        Continue Shopping
                                    </Button>
                                </Stack>
                            </Paper>
                        </Grid>
                    )}

                    {checkout && (
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #F0F0F0' }}>
                                <Stack spacing={2} sx={{ maxWidth: 400, ml: 'auto' }}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography fontWeight={600}>{subtotal.toFixed(2)} CFA</Typography>
                                    </Stack>
                                    {appliedCoupon?.discount > 0 && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography color="success.main">Coupon ({appliedCoupon.code})</Typography>
                                            <Typography color="success.main">-{appliedCoupon.discount.toFixed(2)} CFA</Typography>
                                        </Stack>
                                    )}
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Shipping</Typography>
                                        <Typography fontWeight={600}>{SHIPPING.toFixed(2)} CFA</Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography color="text.secondary">Taxes</Typography>
                                        <Typography fontWeight={600}>{TAXES.toFixed(2)} CFA</Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="h6" fontWeight={800}>Total</Typography>
                                        <Typography variant="h6" fontWeight={800}>
                                            {(Math.max(0, (appliedCoupon?.total ?? (subtotal + SHIPPING + TAXES)) - loyaltyDiscount)).toFixed(2)} CFA
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Box>
    )
}
