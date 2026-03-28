import React from 'react';
import { 
    Box, Stack, Typography, Grid, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Button, IconButton, Rating, Divider, useTheme, alpha 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { clearComparison, removeFromComparison, selectComparisonList } from '../features/products/ProductSlice';
import { Link, useNavigate } from 'react-router-dom';
import { addToCartAsync } from '../features/cart/CartSlice';
import { selectLoggedInUser } from '../features/auth/AuthSlice';
import { toast } from 'react-toastify';

export const ProductComparisonPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const comparisonList = useSelector(selectComparisonList);
    const loggedInUser = useSelector(selectLoggedInUser);

    const handleAddToCart = (productId) => {
        if (!loggedInUser) {
            toast.error("Please login to add to cart");
            return;
        }
        dispatch(addToCartAsync({ user: loggedInUser._id, product: productId }));
        toast.success("Added to cart");
    };

    if (comparisonList.length === 0) {
        return (
            <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <Typography variant="h4" fontWeight={800}>Nothing to compare</Typography>
                    <Typography color="text.secondary">Add at least two products to comparison to see them side-by-side.</Typography>
                    <Button variant="contained" component={Link} to="/" sx={{ px: 4, borderRadius: 2 }}>Back to Shop</Button>
                </Stack>
            </Box>
        );
    }

    const attributes = [
        { label: 'Brand', key: 'brand' },
        { label: 'Price', key: 'price', format: (val) => `${val} CFA` },
        { label: 'Stock Status', key: 'stockQuantity', format: (val) => val > 0 ? 'In Stock' : 'Out of Stock' },
        { label: 'Description', key: 'description' }
    ];

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
                
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box>
                            <Typography variant="h3" fontWeight={900}>Compare Products</Typography>
                            <Typography variant="body1" color="text.secondary">Detailed side-by-side comparison</Typography>
                        </Box>
                    </Stack>
                    <Button variant="outlined" color="error" onClick={() => dispatch(clearComparison())} sx={{ borderRadius: 2, fontWeight: 700 }}>
                        Clear All
                    </Button>
                </Stack>

                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 6, border: '1px solid #F0F0F0', overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                                <TableCell sx={{ width: 200, borderBottom: '2px solid #EEE' }}>
                                    <Typography variant="subtitle2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase' }}>Parameters</Typography>
                                </TableCell>
                                {comparisonList.map((product) => (
                                    <TableCell key={product._id} align="center" sx={{ borderBottom: '2px solid #EEE', position: 'relative' }}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => dispatch(removeFromComparison(product._id))}
                                            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.03)' }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                        <Stack spacing={2} alignItems="center" sx={{ pt: 2, pb: 2 }}>
                                            <Box 
                                                component="img" 
                                                src={product.thumbnail} 
                                                sx={{ height: 120, width: 120, objectFit: 'contain', mb: 1 }} 
                                            />
                                            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ maxWidth: 180 }}>{product.title}</Typography>
                                            <Button 
                                                size="small" 
                                                variant="contained" 
                                                startIcon={<ShoppingCartOutlinedIcon />}
                                                onClick={() => handleAddToCart(product._id)}
                                                disabled={product.stockQuantity <= 0}
                                                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                                            >
                                                Add to Cart
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                ))}
                                {/* Fill empty slots */}
                                {[...Array(Math.max(0, 4 - comparisonList.length))].map((_, i) => (
                                    <TableCell key={`empty-${i}`} sx={{ borderBottom: '2px solid #EEE', bgcolor: 'action.hover', opacity: 0.5 }}>
                                        <Stack alignItems="center" spacing={1}>
                                            <Box sx={{ width: 60, height: 60, border: '2px dashed #CCC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Typography color="text.secondary">+</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">Add product</Typography>
                                        </Stack>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attributes.map((attr) => (
                                <TableRow key={attr.key} hover>
                                    <TableCell sx={{ fontWeight: 700, bgcolor: '#FAFAFA' }}>{attr.label}</TableCell>
                                    {comparisonList.map((product) => (
                                        <TableCell key={`${product._id}-${attr.key}`} align="center">
                                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                                {attr.format ? attr.format(product[attr.key]) : (product[attr.key] || 'N/A')}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                    {[...Array(Math.max(0, 4 - comparisonList.length))].map((_, i) => (
                                        <TableCell key={`empty-val-${attr.key}-${i}`} sx={{ bgcolor: 'action.hover' }} />
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer Insight */}
                <Paper sx={{ mt: 4, p: 4, borderRadius: 6, bgcolor: alpha(theme.palette.primary.main, 0.05), border: '1px solid ' + alpha(theme.palette.primary.main, 0.1) }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>Which one to choose?</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Our platform helps you make informed choices. If you need more help, check the customer reviews on the full product pages or contact our support team.
                    </Typography>
                </Paper>

            </Box>
        </Box>
    );
};
