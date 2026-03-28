import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Typography, Grid, Paper, Stack, Button, IconButton, useTheme, alpha } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { fetchPublicWishlistAsync, selectPublicWishlist, selectWishlistFetchStatus } from '../features/wishlist/WishlistSlice'
import { ProductCard } from '../features/products/components/ProductCard'
import Lottie from 'lottie-react'
import { emptyWishlistAnimation, loadingAnimation } from '../assets'
import { BuyerLayout } from '../layouts/BuyerLayout'

export const PublicWishlistPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const theme = useTheme()
    
    const publicItems = useSelector(selectPublicWishlist)
    const status = useSelector(selectWishlistFetchStatus)

    useEffect(() => {
        if (id) {
            dispatch(fetchPublicWishlistAsync(id))
        }
    }, [id, dispatch])

    return (
        <BuyerLayout>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 8 } }}>
                
                {/* Header */}
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
                    <IconButton component={Link} to='/' size="large" sx={{ bgcolor: alpha(theme.palette.background.paper, 0.8), boxShadow: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: -1 }}>Shared Wishlist</Typography>
                        <Typography variant="body1" color="text.secondary">Take a look at these handpicked favorites!</Typography>
                    </Box>
                </Stack>

                {status === 'pending' ? (
                    <Stack alignItems="center" py={10}>
                        <Lottie animationData={loadingAnimation} style={{ width: 200 }} />
                    </Stack>
                ) : publicItems.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ maxWidth: 300, mx: 'auto', mb: 4 }}>
                            <Lottie animationData={emptyWishlistAnimation} />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>Nothing to see here</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                            This wishlist is either empty or private.
                        </Typography>
                        <Button variant="contained" component={Link} to="/" size="large">Back to Home</Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {publicItems.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item._id}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: 5,
                                        overflow: 'hidden',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)' }
                                    }}
                                >
                                    <ProductCard
                                        id={item.product._id}
                                        title={item.product.title}
                                        thumbnail={item.product.thumbnail}
                                        brand={item.product.brand?.name}
                                        price={item.product.price}
                                        stockQuantity={item.product.stockQuantity}
                                        isWishlistCard={false}
                                    />
                                    {item.note && (
                                        <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), borderTop: '1px solid', borderColor: 'divider' }}>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>
                                                USER NOTE:
                                            </Typography>
                                            <Typography variant="body2" fontStyle="italic">
                                                "{item.note}"
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </BuyerLayout>
    )
}
