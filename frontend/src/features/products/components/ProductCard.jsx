import { Box, Paper, Stack, Typography, useMediaQuery, useTheme, IconButton, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser, selectActiveRole } from '../../auth/AuthSlice';
import { addToCartAsync, selectCartItems, selectCartItemAddStatus } from '../../cart/CartSlice';
import { motion } from 'framer-motion'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { ProductImage } from './ProductImage'
import { QuickViewModal } from './QuickViewModal';
import { addToComparison, removeFromComparison, selectComparisonList } from '../ProductSlice';
import { toast } from 'react-toastify';

export const ProductCard = ({ id, title, price, thumbnail, brand, stockQuantity, handleAddRemoveFromWishlist, isWishlistCard, isAdminCard, flashSalePrice, flashSaleStartsAt, flashSaleEndsAt }) => {
    const navigate = useNavigate()
    const wishlistItems = useSelector(selectWishlistItems)
    const loggedInUser = useSelector(selectLoggedInUser)
    const cartItems = useSelector(selectCartItems)
    const dispatch = useDispatch()
    const theme = useTheme()
    const activeRole = useSelector(selectActiveRole)
    const comparisonList = useSelector(selectComparisonList)

    const isProductAlreadyinWishlist = wishlistItems.some((item) => item.product?._id === id)
    const isProductAlreadyInCart = cartItems.some((item) => item.product?._id === id)
    const isProductInComparison = comparisonList.some((p) => p._id === id)

    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const cartItemAddStatus = useSelector(selectCartItemAddStatus)

    const handleAddToCart = async (e) => {
        e.stopPropagation()
        setIsAddingToCart(true)
        const data = { user: loggedInUser?._id, product: id }
        dispatch(addToCartAsync(data))
    }

    React.useEffect(() => {
        if (cartItemAddStatus === 'fulfilled' || cartItemAddStatus === 'rejected') {
            setIsAddingToCart(false)
        }
    }, [cartItemAddStatus])

    const handleToggleComparison = (e) => {
        e.stopPropagation();
        if (isProductInComparison) {
            dispatch(removeFromComparison(id));
        } else {
            if (comparisonList.length >= 4) {
                toast.warning("You can compare up to 4 products at once");
                return;
            }
            dispatch(addToComparison({ _id: id, title, price, thumbnail, brand, stockQuantity }));
            toast.info(`${title} added to comparison`);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: { xs: '100%', sm: 260, md: 280 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #F0F0F0',
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': {
                        boxShadow: '0px 12px 30px rgba(0,0,0,0.08)',
                    },
                    cursor: 'pointer',
                    position: 'relative'
                }}
                onClick={() => navigate(`/product-details/${id}`)}
            >
                {/* Wishlist Toggle */}
                {!isAdminCard && activeRole === 'buyer' && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        <Checkbox
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                            checked={isProductAlreadyinWishlist}
                            onChange={(e) => handleAddRemoveFromWishlist(e, id)}
                            icon={<FavoriteBorder fontSize="small" />}
                            checkedIcon={<Favorite sx={{ color: '#DB4444' }} fontSize="small" />}
                            sx={{ bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: '#fff' } }}
                        />
                    </Box>
                )}

                {/* Image Container */}
                <Box sx={{ height: 260, bgcolor: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                    <ProductImage
                        src={thumbnail}
                        alt={title}
                        width="100%"
                        height="100%"
                        sx={{ objectFit: 'contain' }}
                    />
                </Box>

                {/* Details Section */}
                <Stack p={2} spacing={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {brand || "General"}
                    </Typography>

                    <Typography variant="body1" fontWeight={600} noWrap sx={{ color: 'text.primary', mb: 0.5 }}>
                        {title}
                    </Typography>

                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {flashSalePrice != null ? (
                                <>
                                    <Typography variant="h6" fontWeight={700} color="secondary.main">{flashSalePrice} CFA</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>{price} CFA</Typography>
                                </>
                            ) : (
                                <Typography variant="h6" fontWeight={700}>{price} CFA</Typography>
                            )}
                        </Stack>

                        {/* Quick View/Add Button */}
                        {!isAdminCard && !isWishlistCard && activeRole === 'buyer' && (
                            <Stack direction="row" spacing={1}>
                                <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); setIsQuickViewOpen(true); }}
                                    sx={{ 
                                        bgcolor: 'rgba(0,0,0,0.05)', 
                                        '&:hover': { bgcolor: 'primary.main', color: '#fff' } 
                                    }}
                                >
                                    <VisibilityOutlinedIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleToggleComparison}
                                    sx={{ 
                                        bgcolor: isProductInComparison ? 'primary.main' : 'rgba(0,0,0,0.05)', 
                                        color: isProductInComparison ? '#fff' : 'inherit',
                                        '&:hover': { bgcolor: isProductInComparison ? 'primary.dark' : 'rgba(0,0,0,0.1)' } 
                                    }}
                                >
                                    <CompareArrowsIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={handleAddToCart}
                                    disabled={isProductAlreadyInCart || stockQuantity <= 0 || isAddingToCart}
                                    sx={{
                                        bgcolor: stockQuantity <= 0 ? 'grey.300' : (isProductAlreadyInCart ? 'success.light' : 'primary.main'),
                                        color: '#fff',
                                        '&:hover': { bgcolor: stockQuantity <= 0 ? 'grey.300' : (isProductAlreadyInCart ? 'success.dark' : '#333') },
                                        position: 'relative'
                                    }}
                                >
                                    {isAddingToCart ? (
                                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                                    ) : (
                                        <ShoppingCartOutlinedIcon fontSize="small" sx={{ color: '#fff' }} />
                                    )}
                                </IconButton>
                            </Stack>
                        )}
                    </Stack>

                    {stockQuantity > 0 && stockQuantity <= 10 && (
                        <Typography variant="caption" color="error" fontWeight={600}>
                            Only {stockQuantity} left in stock!
                        </Typography>
                    )}
                </Stack>
            </Paper>
            <QuickViewModal 
                open={isQuickViewOpen} 
                onClose={() => setIsQuickViewOpen(false)} 
                product={{ id, title, price, thumbnail, brand, stockQuantity }} 
            />
        </motion.div>
    )
}
