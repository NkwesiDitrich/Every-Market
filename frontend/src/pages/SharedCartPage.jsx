import React, { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Stack, Button, Paper, Grid, Divider, alpha, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import { fetchSharedCartAsync, selectSharedCartItems, selectCartStatus, addToCartAsync } from '../features/cart/CartSlice'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { BuyerLayout } from '../layouts/BuyerLayout'
import Lottie from 'lottie-react'
import { shoppingBagAnimation, loadingAnimation } from '../assets'
import { toast } from 'react-toastify'

export const SharedCartPage = () => {
    const { shareableId } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const theme = useTheme()
    
    const sharedItems = useSelector(selectSharedCartItems)
    const status = useSelector(selectCartStatus)
    const loggedInUser = useSelector(selectLoggedInUser)

    useEffect(() => {
        if (shareableId) {
            dispatch(fetchSharedCartAsync(shareableId))
        }
    }, [shareableId, dispatch])

    const handleImportCart = async () => {
        if (!loggedInUser) {
            toast.info("Please login to import this cart")
            navigate("/login")
            return
        }

        try {
            for (const item of sharedItems) {
                await dispatch(addToCartAsync({
                    product: item.product._id,
                    quantity: item.quantity,
                    user: loggedInUser._id
                }))
            }
            toast.success("Items imported to your cart!")
            navigate("/cart")
        } catch (error) {
            toast.error("Error importing cart items")
        }
    }

    const subtotal = sharedItems.reduce((acc, item) => (item.product?.price || 0) * item.quantity + acc, 0)

    return (
        <BuyerLayout>
            <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 8 } }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    <Button 
                        component={Link} 
                        to="/" 
                        startIcon={<ArrowBackIcon />}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                        Back to Shop
                    </Button>
                </Stack>

                <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                    <Stack spacing={4}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ width: 120, mx: 'auto', mb: 2 }}>
                                <Lottie animationData={shoppingBagAnimation} />
                            </Box>
                            <Typography variant="h4" fontWeight={800}>Shared Shopping Cart</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Someone shared this curated selection of products with you.
                            </Typography>
                        </Box>

                        <Divider />

                        {status === 'pending' ? (
                            <Stack alignItems="center" py={4}>
                                <Lottie animationData={loadingAnimation} style={{ width: 150 }} />
                            </Stack>
                        ) : sharedItems.length === 0 ? (
                            <Typography textAlign="center" color="text.secondary" py={4}>
                                This shared cart is empty or no longer exists.
                            </Typography>
                        ) : (
                            <Stack spacing={2}>
                                {sharedItems.map((item) => (
                                    <Stack key={item._id} direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Box 
                                                component="img" 
                                                src={item.product?.thumbnail} 
                                                sx={{ width: 50, height: 50, borderRadius: 1, objectFit: 'cover' }}
                                            />
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>{item.product?.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">Qty: {item.quantity}</Typography>
                                            </Box>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={700}>
                                            {(item.product?.price * item.quantity).toLocaleString()} CFA
                                        </Typography>
                                    </Stack>
                                ))}
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6" fontWeight={800}>Total Estimate</Typography>
                                    <Typography variant="h6" fontWeight={800} color="primary.main">
                                        {subtotal.toLocaleString()} CFA
                                    </Typography>
                                </Stack>

                                <Button 
                                    fullWidth 
                                    variant="contained" 
                                    size="large"
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={handleImportCart}
                                    sx={{ py: 2, borderRadius: 3, fontWeight: 700, mt: 2 }}
                                >
                                    Import to My Cart
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </Paper>
            </Box>
        </BuyerLayout>
    )
}
