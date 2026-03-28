import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { getOrderByUserIdAsync, resetOrderFetchStatus, selectOrderFetchStatus, selectOrders, updateOrderByIdAsync } from '../OrderSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Divider, Box, Grid } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Link } from 'react-router-dom'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import Lottie from 'lottie-react'
import { loadingAnimation, noOrdersAnimation } from '../../../assets'
import { toast } from 'react-toastify'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion'
import { createReturnRequest } from '../../admin/AdminApi'
import { sendMessageToSeller } from '../../seller/SellerApi'
import { DisputeForm } from '../../user/components/DisputeForm';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';
import DownloadIcon from '@mui/icons-material/Download';

const NO_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjYuNjY2NyA2Ni42NjY3SDEzMy4zMzNWMTMzLjMzM0g2Ni42NjY3VjY2LjY2NjdaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02Ni42NjY3IDExNi42NjdMODMuMzMzMyAxMDBMMTAzLjMzMyAxMjBMMTE2LjY2NyAxMDYuNjY3TDEzMy4zMzMgMTIzLjMzMyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjgzLjMzMzMiIGN5PSI4My4zMzMzIiByPSI2LjY2NjY3IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+`


export const UserOrders = () => {

    const { t } = useTranslation()
    const dispatch = useDispatch()
    const loggedInUser = useSelector(selectLoggedInUser)
    const orders = useSelector(selectOrders)
    const cartItems = useSelector(selectCartItems)
    const orderFetchStatus = useSelector(selectOrderFetchStatus)

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const cartItemAddStatus = useSelector(selectCartItemAddStatus)

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        })
    }, [])

    useEffect(() => {
        dispatch(getOrderByUserIdAsync(loggedInUser?._id))
    }, [dispatch, loggedInUser?._id])


    useEffect(() => {

        if (cartItemAddStatus === 'fulfilled') {
            toast.success("Product added to cart")
        }

        else if (cartItemAddStatus === 'rejected') {
            toast.error('Error adding product to cart, please try again later')
        }
    }, [cartItemAddStatus])

    useEffect(() => {
        if (orderFetchStatus === 'rejected') {
            toast.error("Error fetching orders, please try again later")
        }
    }, [orderFetchStatus])

    useEffect(() => {
        return () => {
            dispatch(resetOrderFetchStatus())
            dispatch(resetCartItemAddStatus())
        }
    }, [dispatch])


    const handleAddToCart = (product) => {
        const productId = product?._id || (typeof product === 'string' ? product : null)
        if (!productId) return
        const item = { user: loggedInUser._id, product: productId, quantity: 1 }
        dispatch(addToCartAsync(item))
    }

    const [returnFormOpen, setReturnFormOpen] = React.useState(false)
    const [returnTarget, setReturnTarget] = React.useState({ orderId: null, itemIndex: null })
    const [returnReason, setReturnReason] = React.useState("")
    const [returnSending, setReturnSending] = React.useState(false)

    const handleRequestReturn = (orderId, itemIndex) => {
        setReturnTarget({ orderId, itemIndex })
        setReturnReason("")
        setReturnFormOpen(true)
    }

    const handleSubmitReturn = async () => {
        if (!returnReason.trim()) return
        setReturnSending(true)
        try {
            await createReturnRequest({ 
                orderId: returnTarget.orderId, 
                itemIndex: returnTarget.itemIndex, 
                reason: returnReason 
            })
            toast.success("Return request submitted")
            setReturnFormOpen(false)
        } catch (error) {
            console.log(error)
            toast.error("Error submitting return request")
        } finally {
            setReturnSending(false)
        }
    }

    const [disputeFormOpen, setDisputeFormOpen] = React.useState(false)
    const [disputeTarget, setDisputeTarget] = React.useState({ orderId: null, itemIndex: null, itemTitle: '' })

    const handleOpenDispute = (orderId, itemIndex, itemTitle) => {
        setDisputeTarget({ orderId, itemIndex, itemTitle })
        setDisputeFormOpen(true)
    }

    const [messageSellerOpen, setMessageSellerOpen] = React.useState(false)
    const [messageSellerTarget, setMessageSellerTarget] = React.useState({ sellerId: null, orderId: null })
    const [messageBody, setMessageBody] = React.useState("")
    const [messageSending, setMessageSending] = React.useState(false)

    const handleOpenMessageSeller = (sellerId, orderId) => {
        setMessageSellerTarget({ sellerId, orderId })
        setMessageBody("")
        setMessageSellerOpen(true)
    }

    const handleSendMessageToSeller = async () => {
        const body = String(messageBody || "").trim()
        if (!body || !messageSellerTarget.sellerId) return
        setMessageSending(true)
        try {
            await sendMessageToSeller(messageSellerTarget.sellerId, body, messageSellerTarget.orderId)
            toast.success("Message sent")
            setMessageSellerOpen(false)
        } catch (e) {
            toast.error("Error sending message")
        } finally {
            setMessageSending(false)
        }
    }

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return
        try {
            await dispatch(updateOrderByIdAsync({ _id: orderId, status: 'Cancelled' })).unwrap()
            toast.success("Order cancelled successfully")
            dispatch(getOrderByUserIdAsync(loggedInUser?._id))
        } catch (e) {
            toast.error(e?.message || "Error cancelling order")
        }
    }

    const [trackingOpen, setTrackingOpen] = React.useState(false)
    const [trackingData, setTrackingData] = React.useState(null)
    const [trackingLoading, setTrackingLoading] = React.useState(false)

    const handleTrackOrder = async (orderId) => {
        setTrackingLoading(true)
        setTrackingOpen(true)
        setTrackingData(null)
        try {
            const { axiosi } = await import('../../../config/axios')
            const res = await axiosi.get(`/orders/tracking/${orderId}`)
            setTrackingData(res.data)
        } catch (error) {
            toast.error("Tracking information not available yet")
            setTrackingOpen(false)
        } finally {
            setTrackingLoading(false)
        }
    }

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>

                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    {!isMobile && (
                        <motion.div whileHover={{ x: -4 }}>
                            <IconButton component={Link} to='/' size="large" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <ArrowBackIcon />
                            </IconButton>
                        </motion.div>
                    )}
                    <Box>
                        <Typography variant="h3" fontWeight={800}>{t('Order History')}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('Track, manage, and review your previous purchases.')}
                        </Typography>
                    </Box>
                </Stack>

                {orderFetchStatus === 'pending' ? (
                    <Stack alignItems="center" py={10}>
                        <Lottie animationData={loadingAnimation} style={{ width: 200 }} />
                    </Stack>
                ) : orders?.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '1px solid #F0F0F0', bgcolor: '#fff' }}>
                        <Box sx={{ maxWidth: 300, mx: 'auto', mb: 4 }}>
                            <Lottie animationData={noOrdersAnimation} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>No orders yet</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            Looks like you haven't been shopping lately. Explore our products and find something you love!
                        </Typography>
                        <Button variant="contained" component={Link} to="/" size="large">Start Shopping</Button>
                    </Paper>
                ) : (
                    <Stack spacing={4}>
                        {orders.map((order) => (
                            <Paper
                                key={order._id}
                                elevation={0}
                                sx={{
                                    borderRadius: 5,
                                    border: '1px solid #F0F0F0',
                                    overflow: 'hidden',
                                    bgcolor: '#fff'
                                }}
                            >
                                {/* Order Header */}
                                <Box sx={{ p: 3, bgcolor: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                                    <Grid container spacing={3} alignItems="center">
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Order Date</Typography>
                                            <Typography variant="body2" fontWeight={700}>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Amount</Typography>
                                            <Typography variant="body2" fontWeight={700}>{order.total.toFixed(2)} CFA</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{t('Status')}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" fontWeight={700}>{t(order.status)}</Typography>
                                            </Box>
                                            {order.trackingNumber && (
                                                <Box>
                                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'primary.main', fontWeight: 700 }}>
                                                        Tracking: {order.carrierName} - {order.trackingNumber}
                                                    </Typography>
                                                    <Button size="small" variant="text" onClick={() => handleTrackOrder(order._id)} sx={{ p: 0, minWidth: 0, fontSize: '0.7rem', fontWeight: 800 }}>Track Live</Button>
                                                </Box>
                                            )}
                                        </Grid>
                                        <Grid item xs={12} sm={3} sx={{ textAlign: { sm: 'right' } }}>
                                            {order.status === 'Pending' && (
                                                <Button 
                                                    size="small" 
                                                    color="error" 
                                                    variant="outlined" 
                                                    onClick={(e) => { e.stopPropagation(); handleCancelOrder(order._id); }}
                                                    sx={{ borderRadius: 2, mb: 1, fontWeight: 700, mr: 1 }}
                                                >
                                                    Cancel Order
                                                </Button>
                                            )}
                                            {order.status !== 'Cancelled' && (
                                                <Button 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined" 
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => generateInvoicePDF(order)}
                                                    sx={{ borderRadius: 2, mb: 1, fontWeight: 700 }}
                                                >
                                                    {t('Receipt')}
                                                </Button>
                                            )}
                                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mt: 1, display: 'block' }}>Order ID</Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</Typography>
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* Order Items */}
                                <Stack spacing={0} divider={<Divider />}>
                                    {order.item.map((item, idx) => (
                                        <Box key={idx} sx={{ p: 3 }}>
                                            <Grid container spacing={3}>
                                                <Grid item xs={4} sm={2}>
                                                    <Box
                                                        component="img"
                                                        src={item.product?.images?.[0] || item.product?.thumbnail || item.product?.images?.[0] || NO_IMAGE_BASE64}
                                                        onError={(e) => { e.target.src = NO_IMAGE_BASE64 }}
                                                        sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 3, bgcolor: '#F9F9F9' }}
                                                        alt={item.product?.title || 'Product'}
                                                    />
                                                </Grid>
                                                <Grid item xs={8} sm={10}>
                                                    <Stack spacing={1}>
                                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                            <Box>
                                                                <Typography variant="subtitle1" fontWeight={700}>
                                                                    {item.product?.title || (typeof item.product === 'string' && item.product !== 'undefined' ? `Product ID: ${item.product.slice(-8).toUpperCase()}` : 'Product Information Unavailable')}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary">{item.product?.brand?.name || ''}</Typography>
                                                                <Typography variant="body2" sx={{ mt: 0.5 }}>Quantity: {item.quantity}</Typography>
                                                            </Box>
                                                            <Typography variant="subtitle1" fontWeight={800}>
                                                                {item.product?.price ? `${item.product.price.toFixed(2)} CFA` : (item.unitPrice ? `${item.unitPrice.toFixed(2)} CFA` : '--')}
                                                            </Typography>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                component={Link}
                                                                to={(item.product?._id || (typeof item.product === 'string' && item.product !== 'undefined' ? item.product : null)) ? `/product-details/${item.product?._id || item.product}` : '#'}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                View
                                                            </Button>
                                                            <LoadingButton
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => handleAddToCart(item.product)}
                                                                loading={cartItemAddStatus === 'pending'}
                                                                disabled={!item.product || item.product === 'undefined'}
                                                                sx={{ borderRadius: 2 }}
                                                            >
                                                                {t('Buy Again')}
                                                            </LoadingButton>
                                                             {order.status === 'Delivered' && (
                                                                <Button size="small" color="inherit" variant="text" onClick={() => handleRequestReturn(order._id, idx)} sx={{ borderRadius: 2, fontWeight: 700 }}>Return</Button>
                                                             )}
                                                            <Button size="small" color="error" variant="text" onClick={() => handleOpenDispute(order._id, idx, item.product?.title || 'Product')} sx={{ borderRadius: 2, fontWeight: 700 }}>{t('Dispute')}</Button>
                                                            {item.product?.seller && (
                                                                <Button size="small" variant="outlined" onClick={() => handleOpenMessageSeller(item.product.seller._id || item.product.seller, order._id)} sx={{ borderRadius: 2 }}>Message Seller</Button>
                                                            )}
                                                        </Stack>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}

                {/* Message Seller Dialog */}
                <Dialog open={messageSellerOpen} onClose={() => setMessageSellerOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Message seller</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Your message"
                            value={messageBody}
                            onChange={(e) => setMessageBody(e.target.value)}
                            placeholder="Ask a question about your order…"
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMessageSellerOpen(false)}>Cancel</Button>
                        <LoadingButton variant="contained" onClick={handleSendMessageToSeller} disabled={!messageBody.trim()} loading={messageSending}>
                            Send
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* Return Request Dialog */}
                <Dialog open={returnFormOpen} onClose={() => setReturnFormOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>Request a Return</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            We're sorry your item didn't work out. Please tell us why you'd like to return it.
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Reason for return"
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            placeholder="e.g. Wrong size, damaged, item not as described…"
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2.5 }}>
                        <Button onClick={() => setReturnFormOpen(false)}>Cancel</Button>
                        <LoadingButton 
                            variant="contained" 
                            onClick={handleSubmitReturn} 
                            disabled={!returnReason.trim()} 
                            loading={returnSending}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                        >
                            Submit Request
                        </LoadingButton>
                    </DialogActions>
                </Dialog>

                <DisputeForm 
                    open={disputeFormOpen} 
                    onClose={() => setDisputeFormOpen(false)}
                    orderId={disputeTarget.orderId}
                    itemIndex={disputeTarget.itemIndex}
                    itemTitle={disputeTarget.itemTitle}
                />
                <Dialog open={trackingOpen} onClose={() => setTrackingOpen(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontWeight: 800 }}>Order Tracking</DialogTitle>
                    <DialogContent>
                        {trackingLoading ? (
                            <Stack alignItems="center" py={4}><LoadingButton loading variant="text" /></Stack>
                        ) : trackingData ? (
                            <Stack spacing={3} sx={{ mt: 1 }}>
                                <Box sx={{ p: 2, bgcolor: 'primary.main', color: '#fff', borderRadius: 3 }}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'uppercase', letterSpacing: 1 }}>Current Status</Typography>
                                    <Typography variant="h5" fontWeight={800}>{trackingData.status}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>Tracking Milestones</Typography>
                                    <Stack spacing={2}>
                                        {trackingData.milestones?.map((m, i) => (
                                            <Stack key={i} direction="row" spacing={2}>
                                                <Box sx={{ width: 2, bgcolor: i === 0 ? 'primary.main' : '#EEE', position: 'relative' }}>
                                                    <Box sx={{ position: 'absolute', top: 0, left: -4, width: 10, height: 10, borderRadius: '50%', bgcolor: i === 0 ? 'primary.main' : '#CCC' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700}>{m.status}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{new Date(m.timestamp).toLocaleString()}</Typography>
                                                </Box>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Carrier: {trackingData.carrier}</Typography>
                                    <br />
                                    <Typography variant="caption" color="text.secondary">Est. Delivery: {new Date(trackingData.estimatedDelivery).toLocaleDateString()}</Typography>
                                </Box>
                            </Stack>
                        ) : (
                            <Typography>Unable to load tracking data.</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setTrackingOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

            </Box>
        </Box>
    )
}
