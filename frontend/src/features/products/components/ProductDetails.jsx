import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductFetchStatus, selectProductFetchStatus, selectSelectedProduct } from '../ProductSlice'
import { Box, Checkbox, Rating, Stack, Typography, useMediaQuery, Button, Grid, Divider, IconButton, Paper } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { RoleGuard } from '../../auth/components/RoleGuard';
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { fetchReviewsByProductIdAsync, resetReviewFetchStatus, selectReviewFetchStatus, selectReviews, } from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Favorite from '@mui/icons-material/Favorite'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { useTheme } from '@mui/material/styles'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { createConversationAsync, resetMessagingStatus, selectMessagingStatus, selectMessagingError } from '../../messaging/MessagingSlice';
import { TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Lottie from 'lottie-react'
import { loadingAnimation } from '../../../assets'
import { addRecentlyViewed } from '../../../utils/recentlyViewed'
import { SimilarProductsBlock, RecommendedBlock } from './RecommendationBlocks'
import { trackProductEvent } from '../../seller/SellerApi'
import { useTranslation } from 'react-i18next';
import { ProductImage } from './ProductImage';


const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const COLORS = ['#020202', '#F6F6F6', '#B82222', '#BEA9A9', '#E2BB8D']
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


export const ProductDetails = () => {
    const { id } = useParams()
    const product = useSelector(selectSelectedProduct)
    const loggedInUser = useSelector(selectLoggedInUser)
    const dispatch = useDispatch()
    const cartItems = useSelector(selectCartItems)
    const cartItemAddStatus = useSelector(selectCartItemAddStatus)
    const [quantity, setQuantity] = useState(1)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColorIndex, setSelectedColorIndex] = useState(-1)
    const reviews = useSelector(selectReviews)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)
    const theme = useTheme()
    const is1420 = useMediaQuery(theme.breakpoints.down(1420))
    const is990 = useMediaQuery(theme.breakpoints.down(990))
    const is840 = useMediaQuery(theme.breakpoints.down(840))
    const is500 = useMediaQuery(theme.breakpoints.down(500))
    const is480 = useMediaQuery(theme.breakpoints.down(480))
    const is387 = useMediaQuery(theme.breakpoints.down(387))
    const is340 = useMediaQuery(theme.breakpoints.down(340))

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const wishlistItems = useSelector(selectWishlistItems)
    const { t } = useTranslation()



    const isProductAlreadyInCart = cartItems.some((item) => item.product._id === id)
    const isProductAlreadyinWishlist = wishlistItems.some((item) => item.product._id === id)

    const productFetchStatus = useSelector(selectProductFetchStatus)
    const reviewFetchStatus = useSelector(selectReviewFetchStatus)

    const totalReviewRating = reviews.reduce((acc, review) => acc + review.rating, 0)
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? Math.ceil(totalReviewRating / totalReviews) : 0

    const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)

    const messagingStatus = useSelector(selectMessagingStatus)
    const messagingError = useSelector(selectMessagingError)
    const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)
    const [chatMessage, setChatMessage] = useState('')

    const navigate = useNavigate()
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        })
    }, [])

    useEffect(() => {
        if (id) {
            dispatch(fetchProductByIdAsync(id))
            dispatch(fetchReviewsByProductIdAsync(id))
            addRecentlyViewed(id)
            trackProductEvent(id, 'view').catch(() => { })
        }
    }, [id, dispatch])

    useEffect(() => {

        if (cartItemAddStatus === 'fulfilled') {
            toast.success(t('product.notifications.addedToCart'))
        }

        else if (cartItemAddStatus === 'rejected') {
            toast.error(t('product.notifications.errorAddingToCart'))
        }
    }, [cartItemAddStatus])

    useEffect(() => {
        if (wishlistItemAddStatus === 'fulfilled') {
            toast.success(t('auth.profile.updateSuccess')) // Reusing common success if possible, or should add specific
        }
        else if (wishlistItemAddStatus === 'rejected') {
            toast.error(t('auth.profile.updateError'))
        }
    }, [wishlistItemAddStatus, t])

    useEffect(() => {
        if (wishlistItemDeleteStatus === 'fulfilled') {
            toast.success(t('product.notifications.removedFromWishlist'))
        }
        else if (wishlistItemDeleteStatus === 'rejected') {
            toast.error(t('product.notifications.errorRemovingFromWishlist'))
        }
    }, [wishlistItemDeleteStatus])

    useEffect(() => {
        if (productFetchStatus === 'rejected') {
            toast.error(t('product.notifications.errorFetchingDetails'))
        }
    }, [productFetchStatus])

    useEffect(() => {
        if (reviewFetchStatus === 'rejected') {
            toast.error(t('product.notifications.errorFetchingReviews'))
        }
    }, [reviewFetchStatus])

    useEffect(() => {
        if (messagingStatus === 'fulfilled') {
            toast.success(t('product.messageSuccess'))
            setIsChatDialogOpen(false)
            setChatMessage('')
            dispatch(resetMessagingStatus())
            navigate('/inbox')
        } else if (messagingStatus === 'rejected') {
            toast.error(messagingError || t('product.messageError'))
            dispatch(resetMessagingStatus())
        }
    }, [messagingStatus, dispatch, navigate, t])

    useEffect(() => {
        return () => {
            dispatch(clearSelectedProduct())
            dispatch(resetProductFetchStatus())
            dispatch(resetReviewFetchStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetCartItemAddStatus())
            dispatch(resetMessagingStatus())
        }
    }, [dispatch])

    const handleAddToCart = () => {
        const cartItem = cartItems.find((item) => item.product._id === id)
        const currentQtyInCart = cartItem ? cartItem.quantity : 0

        if (product.stockQuantity <= 0) {
            toast.error(t('product.notifications.outOfStock'))
            return
        }

        if (currentQtyInCart + quantity > product.stockQuantity) {
            const remaining = product.stockQuantity - currentQtyInCart
            if (remaining > 0) {
                toast.error(t('product.notifications.onlyMoreAvailable', { 
                    count: remaining, 
                    available: product.stockQuantity,
                    inCart: currentQtyInCart 
                }) || `Only ${remaining} more available (you have ${currentQtyInCart} in cart)`)
            } else {
                toast.error(t('product.notifications.alreadyHaveMax', { count: product.stockQuantity }) || `You already have the maximum available (${product.stockQuantity}) in your cart`)
            }
            return
        }

        trackProductEvent(id, 'add_to_cart').catch(() => { })
        const item = { user: loggedInUser?._id, product: id, quantity }
        dispatch(addToCartAsync(item))
        setQuantity(1)
    }

    const handleDecreaseQty = () => {
        if (quantity !== 1) {
            setQuantity(quantity - 1)
        }
    }

    const handleIncreaseQty = () => {
        const cartItem = cartItems.find((item) => item.product._id === id)
        const currentQtyInCart = cartItem ? cartItem.quantity : 0
        
        if (quantity < 20 && (quantity + currentQtyInCart) < product.stockQuantity) {
            setQuantity(quantity + 1)
        }
    }

    const handleSizeSelect = (size) => {
        setSelectedSize(size)
    }

    const handleAddRemoveFromWishlist = (e) => {
        if (e.target.checked) {
            const data = { user: loggedInUser?._id, product: id }
            dispatch(createWishlistItemAsync(data))
        }

        else if (!e.target.checked) {
            const index = wishlistItems.findIndex((item) => item.product._id === id)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    const handleStartChat = () => {
        if (!loggedInUser) {
            navigate('/login')
            return
        }
        setIsChatDialogOpen(true)
    }

    const handleSendInitialMessage = () => {
        if (!chatMessage.trim()) return
        dispatch(createConversationAsync({
            sellerId: product.seller?._id || product.seller,
            productId: product._id,
            body: chatMessage
        }))
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const images = (product?.images && product.images.length > 0) ? product.images : [product?.thumbnail];
    const maxSteps = images.length;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        if (!isNaN(step)) {
            setActiveStep(step);
        }
    };


    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: isMobile ? 12 : 6 }}>
            {productFetchStatus === 'pending' ? (
                <Stack alignItems="center" justifyContent="center" height="80vh">
                    <Lottie animationData={loadingAnimation} style={{ width: 200 }} />
                </Stack>
            ) : product ? (
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 2, md: 6 } }}>
                    <Grid container spacing={{ xs: 4, md: 8 }}>

                        {/* Left: Image Gallery */}
                        <Grid item xs={12} md={7}>
                            <Stack spacing={2}>
                                {isMobile ? (
                                    <Box sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: '#fff', border: '1px solid #F0F0F0' }}>
                                        <AutoPlaySwipeableViews index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents>
                                            {images.map((image, index) => (
                                                <ProductImage
                                                    key={index}
                                                    src={image}
                                                    sx={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', p: 4 }}
                                                />
                                            ))}
                                        </AutoPlaySwipeableViews>
                                        <MobileStepper
                                            steps={maxSteps || 1}
                                            activeStep={isNaN(activeStep) ? 0 : activeStep}
                                            position="static"
                                            sx={{ bgcolor: 'transparent', justifyContent: 'center' }}
                                            nextButton={null}
                                            backButton={null}
                                        />
                                    </Box>
                                ) : (
                                    <Stack direction="row" spacing={2} sx={{ height: 600 }}>
                                        <Stack spacing={2} sx={{ width: 100, overflowY: 'auto', pr: 1 }}>
                                            {images.map((image, index) => (
                                                <Paper
                                                    key={index}
                                                    elevation={0}
                                                    onClick={() => { setSelectedImageIndex(index); setActiveStep(index); }}
                                                    sx={{
                                                        cursor: 'pointer',
                                                        border: selectedImageIndex === index ? '2px solid' : '1px solid',
                                                        borderColor: selectedImageIndex === index ? 'primary.main' : '#E0E0E0',
                                                        borderRadius: 2,
                                                        p: 1,
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <ProductImage src={image} width='100%' sx={{ aspectRatio: '1/1', objectFit: 'contain' }} />
                                                </Paper>
                                            ))}
                                        </Stack>
                                        <Paper
                                            elevation={0}
                                            sx={{ flex: 1, borderRadius: 4, border: '1px solid #F0F0F0', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}
                                        >
                                            <ProductImage src={images[selectedImageIndex] || product?.thumbnail} width='auto' height='auto' sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </Paper>
                                    </Stack>
                                )}
                            </Stack>
                        </Grid>

                        {/* Right: Product Info */}
                        <Grid item xs={12} md={5}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {product.brand?.name}
                                    </Typography>
                                    <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 1.5 }}>
                                        {product.title}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Rating value={averageRating} precision={0.5} readOnly size="small" />
                                        <Typography variant="body2" color="text.secondary">
                                            ({totalReviews} Reviews)
                                        </Typography>
                                        <Divider orientation="vertical" flexItem sx={{ height: 16, alignSelf: 'center' }} />
                                        <Typography variant="body2" color={product.stockQuantity > 10 ? "success.main" : "error.main"} fontWeight={600}>
                                            {product.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Typography variant="h4" fontWeight={700} color="primary.main">
                                    {product.flashSalePrice || product.price} CFA
                                    {product.flashSalePrice && (
                                        <Typography component="span" variant="h6" color="text.secondary" sx={{ textDecoration: 'line-through', ml: 2 }}>
                                            {product.price} CFA
                                        </Typography>
                                    )}
                                </Typography>

                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {product.shortDescription}
                                </Typography>

                                <Divider />

                                {/* Options: Sizes */}
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Select Size</Typography>
                                    <Stack direction="row" spacing={1}>
                                        {SIZES.map((size) => (
                                            <Button
                                                key={size}
                                                variant={selectedSize === size ? "contained" : "outlined"}
                                                onClick={() => handleSizeSelect(size)}
                                                sx={{ minWidth: 50, height: 40, borderRadius: 2 }}
                                            >
                                                {size}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>

                                {/* Quantity & Actions */}
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Stack direction="row" alignItems="center" sx={{ border: '1px solid #E0E0E0', borderRadius: 2 }}>
                                        <IconButton onClick={handleDecreaseQty} size="small"><RemoveIcon /></IconButton>
                                        <Typography sx={{ width: 40, textAlign: 'center' }}>{quantity}</Typography>
                                        <IconButton onClick={handleIncreaseQty} size="small"><AddIcon /></IconButton>
                                    </Stack>
                                    {!isMobile && (
                                        <RoleGuard roles={['buyer']}>
                                            <Stack direction="row" spacing={2} width="100%" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: { xs: 2, sm: 0 } }}>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    onClick={handleAddToCart}
                                                    disabled={product.stockQuantity <= 0 || (cartItems.find(it => it.product._id === id)?.quantity || 0) >= product.stockQuantity}
                                                    startIcon={<ShoppingCartOutlinedIcon />}
                                                    sx={{ height: 50, flex: 2, minWidth: { xs: '100%', sm: 'auto' } }}
                                                >
                                                    {product.stockQuantity <= 0 ? t('product.outOfStock') : (cartItems.find(it => it.product._id === id)?.quantity || 0) >= product.stockQuantity ? t('product.inCart') : t('product.addToCart')}
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    size="large"
                                                    color="secondary"
                                                    onClick={handleStartChat}
                                                    startIcon={<ChatBubbleOutlineIcon />}
                                                    sx={{ height: 50, flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}
                                                >
                                                    {t('common.chat')}
                                                </Button>
                                            </Stack>
                                        </RoleGuard>
                                    )}
                                </Stack>

                                {/* Trust Badges */}
                                <Paper elevation={0} sx={{ bgcolor: '#F8F9FA', p: 3, borderRadius: 3, border: '1px solid #EDEDED' }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <LocalShippingOutlinedIcon color="primary" />
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>Free Delivery</Typography>
                                                <Typography variant="caption" color="text.secondary">Enter your postal code for Delivery Availability</Typography>
                                            </Box>
                                        </Stack>
                                        <Divider />
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <CachedOutlinedIcon color="primary" />
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>Return Delivery</Typography>
                                                <Typography variant="caption" color="text.secondary">Free 30 Days Delivery Returns. Details</Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Grid>

                        {/* Description & Reviews */}
                        <Grid item xs={12}>
                            <Stack spacing={6} sx={{ mt: 4 }}>
                                <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Product Description</Typography>
                                    <Box
                                        sx={{
                                            typography: 'body1',
                                            color: 'text.secondary',
                                            lineHeight: 1.7,
                                            '& img': { 
                                                maxWidth: '100%', 
                                                height: 'auto', 
                                                borderRadius: 2,
                                                my: 2,
                                                display: 'block'
                                            },
                                            '& h1, h2, h3': { color: 'text.primary', mt: 3, mb: 2 },
                                            '& p': { mb: 2 },
                                            '& ul, & ol': { pl: 3, mb: 2 },
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                                    />
                                </Box>

                                <Divider />

                                <Box>
                                    <Reviews productId={id} averageRating={averageRating} />
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <SimilarProductsBlock />
                            <RecommendedBlock />
                        </Grid>
                    </Grid>
                </Box>
            ) : null}

            {/* Sticky Mobile CTA */}
            {isMobile && product && (
                <Paper
                    elevation={10}
                    sx={{
                        position: 'fixed',
                        bottom: 64, // Above bottom nav
                        left: 0,
                        right: 0,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderTop: '1px solid #E0E0E0',
                        zIndex: 1100
                    }}
                >
                    <Stack direction="row" spacing={1}>
                        <IconButton
                            onClick={handleStartChat}
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                        >
                            <ChatBubbleOutlineIcon />
                        </IconButton>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={handleAddToCart}
                            disabled={product.stockQuantity <= 0 || (cartItems.find(it => it.product._id === id)?.quantity || 0) >= product.stockQuantity}
                            sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            {product.stockQuantity <= 0 ? t('product.outOfStock') : (cartItems.find(it => it.product._id === id)?.quantity || 0) >= product.stockQuantity ? t('product.inCart') : t('product.addToCart')}
                        </Button>
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            color="secondary"
                            onClick={() => { if(product.stockQuantity > 0) { handleAddToCart(); navigate('/cart'); } }}
                            disabled={product.stockQuantity <= 0}
                            sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                        >
                            {t('common.buyNow')}
                        </Button>
                    </Stack>
                </Paper>
            )}

            {/* Chat Dialog */}
            <Dialog open={isChatDialogOpen} onClose={() => setIsChatDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>{t('product.chatWithSeller')}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('product.askQuestionAbout', { title: product?.title })}
                    </Typography>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        placeholder={t('product.messagePlaceholder')}
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsChatDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button
                        onClick={handleSendInitialMessage}
                        variant="contained"
                        disabled={!chatMessage.trim() || messagingStatus === 'pending'}
                    >
                        {t('product.sendMessage')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
