import { Box, Button, Divider, FormControl, Grid, IconButton, Paper, Radio, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import React, { useEffect, useState } from 'react'
import { Cart } from '../../cart/components/Cart'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Link, useNavigate } from 'react-router-dom'
import { createOrderAsync, selectCurrentOrder, selectOrderStatus, selectOrdersErrors } from '../../order/OrderSlice'
import { refreshCartAsync, resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SHIPPING, TAXES } from '../../../constants'
import { motion } from 'framer-motion'
import { applyCouponToCartAsync, resetAppliedCoupon, selectAppliedCoupon, selectApplyCouponStatus } from '../../coupon/CouponSlice'
import { fetchMyLoyalty } from '../../admin/AdminApi'
import { createFlutterwavePayment, createFlutterwavePaymentGuest, createPayPalOrder, createPayPalOrderGuest, createStripeCheckoutSession, createStripeCheckoutSessionGuest } from '../../payment/PaymentApi'
import { axiosi } from '../../../config/axios'
import { toast } from 'react-toastify'


export const Checkout = () => {
    const status = ''
    const addresses = useSelector(selectAddresses)
    const [selectedAddress, setSelectedAddress] = useState(addresses[0])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD')
    const { register, handleSubmit, watch, reset } = useForm()
    const dispatch = useDispatch()
    const loggedInUser = useSelector(selectLoggedInUser)
    const isGuest = !loggedInUser
    const addressStatus = useSelector(selectAddressStatus)
    const navigate = useNavigate()
    const cartItems = useSelector(selectCartItems)
    const orderStatus = useSelector(selectOrderStatus)
    const currentOrder = useSelector(selectCurrentOrder)
    const orderCreationErrors = useSelector(selectOrdersErrors)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const appliedCoupon = useSelector(selectAppliedCoupon)
    const applyCouponStatus = useSelector(selectApplyCouponStatus)
    const [couponCode, setCouponCode] = useState('')
    const [loyaltyBalance, setLoyaltyBalance] = useState(0)
    const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0)

    useEffect(() => {
        if (loggedInUser) {
            fetchMyLoyalty().then((d) => setLoyaltyBalance(d.balance ?? 0)).catch(() => setLoyaltyBalance(0))
        }
        // Always refresh cart to get latest stock levels
        dispatch(refreshCartAsync())
    }, [loggedInUser, dispatch])

    useEffect(() => {
        if (addressStatus === 'fulfilled') {
            reset()
            toast.success("Address added successfully")
        }
    }, [addressStatus, reset])

    useEffect(() => {
        if (currentOrder && currentOrder?._id) {
            dispatch(resetCartByUserIdAsync(loggedInUser?._id))
            navigate(`/order-success/${currentOrder?._id}`)
        }
        else if (orderStatus === 'rejected' && orderCreationErrors) {
            toast.error(orderCreationErrors.message || "Order failed. Please check stock.")
        }
    }, [currentOrder, dispatch, loggedInUser?._id, navigate, orderStatus, orderCreationErrors])

    const handleAddAddress = (data) => {
        if (isGuest) {
            setSelectedAddress(data)
            return
        }
        const address = { ...data, user: loggedInUser._id }
        dispatch(addAddressAsync(address))
    }

    const handleCreateOrder = () => {
        if (!selectedAddress) {
            toast.error('Please select an address')
            return
        }

        const guestEmail = watch('guestEmail')
        const guestItems = cartItems.map((ci) => ({ productId: ci.product?._id, quantity: ci.quantity }))

        if (selectedPaymentMethod === 'COD') {
            if (isGuest) {
                const run = async () => {
                    try {
                        const res = await axiosi.post('/orders/guest', { guestEmail, address: selectedAddress, items: guestItems, paymentMode: 'COD' })
                        dispatch(resetCartByUserIdAsync())
                        navigate(`/payment/success?provider=cod&orderId=${res.data._id}`, { replace: true })
                    } catch (e) {
                        toast.error(e.response?.data?.message || 'Guest order failed. Please try again.')
                    }
                }
                run()
                return
            } else {
                const order = {
                    user: loggedInUser._id,
                    item: cartItems,
                    address: selectedAddress,
                    paymentMode: 'COD',
                    total: cartItems.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0) + SHIPPING + TAXES,
                    couponCode: appliedCoupon?.code || null,
                    loyaltyPointsToRedeem: loyaltyPointsToRedeem || 0,
                }
                dispatch(createOrderAsync(order))
                return
            }
        }

        // Online payments
        const addressId = selectedAddress?._id
        const run = async () => {
            try {
                if (selectedPaymentMethod === 'STRIPE') {
                    const { url } = isGuest
                        ? await createStripeCheckoutSessionGuest({ guestEmail, address: selectedAddress, items: guestItems })
                        : await createStripeCheckoutSession({ addressId, couponCode: appliedCoupon?.code, loyaltyPointsToRedeem })
                    window.location.href = url
                }
                else if (selectedPaymentMethod === 'PAYPAL') {
                    const { url } = isGuest
                        ? await createPayPalOrderGuest({ guestEmail, address: selectedAddress, items: guestItems })
                        : await createPayPalOrder({ addressId, couponCode: appliedCoupon?.code, loyaltyPointsToRedeem })
                    window.location.href = url
                }
                else if (selectedPaymentMethod === 'MOBILE_MONEY' || selectedPaymentMethod === 'ORANGE_MONEY') {
                    const { url } = isGuest
                        ? await createFlutterwavePaymentGuest({ guestEmail, address: selectedAddress, items: guestItems, method: selectedPaymentMethod })
                        : await createFlutterwavePayment({ addressId, method: selectedPaymentMethod, couponCode: appliedCoupon?.code, loyaltyPointsToRedeem })
                    window.location.href = url
                }
            } catch (e) {
                toast.error('Payment initialization failed. Please try again.')
            }
        }
        run()
    }

    const hasStockIssue = cartItems.some(item => item.quantity > (item.product?.stockQuantity || 0))

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 6 }}>Checkout</Typography>

                <Grid container spacing={{ xs: 4, md: 8 }}>

                    {/* Left: Forms */}
                    <Grid item xs={12} md={7}>
                        <Stack spacing={6}>

                            {/* Shipping Information */}
                            <Box>
                                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
                                    1. Shipping Information
                                </Typography>

                                {!isGuest && addresses.length > 0 && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                            Choose an existing address
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {addresses.map((address) => (
                                                <Grid item xs={12} sm={6} key={address._id}>
                                                    <Paper
                                                        elevation={0}
                                                        onClick={() => setSelectedAddress(address)}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 4,
                                                            border: '2px solid',
                                                            borderColor: selectedAddress?._id === address._id ? 'primary.main' : '#F0F0F0',
                                                            bgcolor: selectedAddress?._id === address._id ? 'rgba(0, 0, 0, 0.02)' : '#fff',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            height: '100%'
                                                        }}
                                                    >
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                                            <Typography fontWeight={700}>{address.type}</Typography>
                                                            <Radio
                                                                size="small"
                                                                checked={selectedAddress?._id === address._id}
                                                                sx={{ p: 0 }}
                                                            />
                                                        </Stack>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {address.street}, {address.city}<br />
                                                            {address.state}, {address.country} {address.postalCode}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            {address.phoneNumber}
                                                        </Typography>
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                )}

                                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: '#FAFAFA', border: '1px solid #EDEDED' }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                                        {isGuest ? "Enter your shipping details" : "Or add a new address"}
                                    </Typography>
                                    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(handleAddAddress)}>
                                        {isGuest && (
                                            <TextField
                                                fullWidth
                                                label="Email Address"
                                                variant="outlined"
                                                {...register("guestEmail", { required: true })}
                                            />
                                        )}
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Address Type (e.g. Home)" {...register("type", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Full Name" {...register("fullName", { required: false })} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Street Address" {...register("street", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="City" {...register("city", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="State / Province" {...register("state", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Postal Code" {...register("postalCode", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField fullWidth label="Country" {...register("country", { required: true })} />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField fullWidth label="Phone Number" {...register("phoneNumber", { required: true })} />
                                            </Grid>
                                        </Grid>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            sx={{ alignSelf: 'flex-start', px: 4, height: 48 }}
                                        >
                                            {isGuest ? "Use this address" : "Save and use this address"}
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Box>

                            <Divider />

                            {/* Payment Methods */}
                            <Box>
                                <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>2. Payment Method</Typography>
                                <Stack spacing={2}>
                                    {[
                                        { id: 'COD', label: 'Cash on Delivery', icon: 'https://img.icons8.com/plasticine/100/cash-in-hand.png' },
                                        { id: 'STRIPE', label: 'Credit / Debit Card (Stripe)', icon: 'https://img.icons8.com/color/100/visa.png' },
                                        { id: 'PAYPAL', label: 'PayPal', icon: 'https://img.icons8.com/color/100/paypal.png' },
                                        { id: 'MOBILE_MONEY', label: 'Mobile Money (MTN, Airtel)', icon: 'https://img.icons8.com/color/100/sim-card.png' },
                                        { id: 'ORANGE_MONEY', label: 'Orange Money', icon: 'https://img.icons8.com/color/100/orange.png' }
                                    ].map((method) => (
                                        <Paper
                                            key={method.id}
                                            elevation={0}
                                            onClick={() => setSelectedPaymentMethod(method.id)}
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 4,
                                                border: '2px solid',
                                                borderColor: selectedPaymentMethod === method.id ? 'primary.main' : '#F0F0F0',
                                                bgcolor: selectedPaymentMethod === method.id ? 'rgba(0, 0, 0, 0.02)' : '#fff',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2
                                            }}
                                        >
                                            <Radio checked={selectedPaymentMethod === method.id} size="small" />
                                            <Box component="img" src={method.icon} sx={{ width: 32, height: 32 }} />
                                            <Typography fontWeight={700}>{method.label}</Typography>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Right: Summary */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #F0F0F0' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Summary</Typography>
                                <Cart checkout={true} appliedCoupon={appliedCoupon} loyaltyPoints={loyaltyPointsToRedeem} />

                                {!isGuest && (
                                    <Stack spacing={3} sx={{ mt: 4 }}>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Have a coupon code?</Typography>
                                            <Stack direction="row" spacing={1}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Enter code"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                />
                                                <LoadingButton
                                                    variant="outlined"
                                                    onClick={() => dispatch(applyCouponToCartAsync(couponCode))}
                                                    loading={applyCouponStatus === 'pending'}
                                                >
                                                    Apply
                                                </LoadingButton>
                                            </Stack>
                                            {appliedCoupon && (
                                                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                                                    Coupon {appliedCoupon.code} applied!
                                                </Typography>
                                            )}
                                        </Box>

                                        {loyaltyBalance > 0 && (
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                                                    Redeem Loyalty Points
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                                    Balance: {loyaltyBalance} pts (100 pts = $1)
                                                </Typography>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    fullWidth
                                                    placeholder="Points to use"
                                                    value={loyaltyPointsToRedeem || ''}
                                                    onChange={(e) => setLoyaltyPointsToRedeem(Math.min(Math.max(0, parseInt(e.target.value) || 0), loyaltyBalance))}
                                                />
                                            </Box>
                                        )}
                                    </Stack>
                                )}

                                    <LoadingButton
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        sx={{ py: 2, borderRadius: 3, mt: 4, fontWeight: 800, fontSize: '1.1rem' }}
                                        onClick={handleCreateOrder}
                                        loading={orderStatus === 'pending'}
                                        disabled={hasStockIssue}
                                    >
                                        {hasStockIssue ? "Insufficient Stock" : "Place Order"}
                                    </LoadingButton>
                                    {hasStockIssue && (
                                        <Typography variant="caption" color="error" sx={{ mt: 1, textAlign: 'center', display: 'block', fontWeight: 600 }}>
                                            Some items are no longer available in the requested quantity. Please check your cart.
                                        </Typography>
                                    )}
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </Typography>
                            </Paper>
                        </Box>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    )
}
