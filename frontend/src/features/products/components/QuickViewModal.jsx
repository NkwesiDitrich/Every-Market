import React from 'react';
import {
    Dialog, DialogContent, Box, Grid, Typography, 
    Button, IconButton, Stack, Chip, Divider, useTheme, alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { toast } from 'react-toastify';

export const QuickViewModal = ({ open, onClose, product }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const loggedInUser = useSelector(selectLoggedInUser);
    const cartItems = useSelector(selectCartItems);

    if (!product) return null;

    const isProductAlreadyInCart = cartItems.some((item) => item.product?._id === product._id);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (!loggedInUser) {
            toast.error("Please login to add to cart");
            return;
        }
        dispatch(addToCartAsync({ user: loggedInUser._id, product: product._id }));
        toast.success("Added to cart");
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 6, overflow: 'hidden' } }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton 
                    onClick={onClose} 
                    sx={{ position: 'absolute', right: 16, top: 16, zIndex: 10, bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fff' } }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent sx={{ p: 0 }}>
                    <Grid container>
                        {/* Image Gallery Column */}
                        <Grid item xs={12} md={6} sx={{ bgcolor: '#F9F9F9', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                            <Box 
                                component="img" 
                                src={product.thumbnail} 
                                alt={product.title}
                                sx={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
                            />
                        </Grid>

                        {/* Product Info Column */}
                        <Grid item xs={12} md={6} sx={{ p: { xs: 3, md: 5 } }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Typography variant="caption" color="primary" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                        {product.brand?.name || product.brand || 'Premium Collection'}
                                    </Typography>
                                    <Typography variant="h4" fontWeight={900} sx={{ mt: 1, mb: 2 }}>{product.title}</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="h5" color="primary" fontWeight={800}>{product.price} CFA</Typography>
                                        {product.stockQuantity > 0 ? (
                                            <Chip label="In Stock" color="success" size="small" sx={{ fontWeight: 700 }} />
                                        ) : (
                                            <Chip label="Out of Stock" color="error" size="small" sx={{ fontWeight: 700 }} />
                                        )}
                                    </Stack>
                                </Box>

                                <Divider />

                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                                    {product.description || "Experience the perfect blend of style and functionality with this premium product. Designed for durability and performance."}
                                </Typography>

                                <Box sx={{ mt: 'auto', pt: 4 }}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        size="large"
                                        startIcon={<ShoppingCartOutlinedIcon />}
                                        disabled={isProductAlreadyInCart || product.stockQuantity <= 0}
                                        onClick={handleAddToCart}
                                        sx={{ 
                                            py: 2, 
                                            borderRadius: 3, 
                                            fontWeight: 800, 
                                            textTransform: 'none',
                                            boxShadow: '0 8px 25px ' + alpha(theme.palette.primary.main, 0.4)
                                        }}
                                    >
                                        {isProductAlreadyInCart ? "In Your Cart" : "Add to Cart"}
                                    </Button>
                                    <Button 
                                        fullWidth 
                                        variant="text" 
                                        onClick={onClose}
                                        sx={{ mt: 1, fontWeight: 600, color: 'text.secondary' }}
                                    >
                                        View Full Details
                                    </Button>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Box>
        </Dialog>
    );
};
