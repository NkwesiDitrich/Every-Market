import { Box, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Typography, useMediaQuery, useTheme, Paper, Button, Drawer, Divider } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductsAsync, resetProductFetchStatus, selectProductFetchStatus, selectProductIsFilterOpen, selectProductTotalResults, selectProducts, toggleFilters, selectSearchQuery, clearProductSuccessMessage, clearProductErrors } from '../ProductSlice'
import { ProductCard } from './ProductCard'
import { selectBrands } from '../../brands/BrandSlice'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { selectCategories } from '../../categories/CategoriesSlice'
import Pagination from '@mui/material/Pagination';
import { ITEMS_PER_PAGE } from '../../../constants'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { toast } from 'react-toastify'
import { banner1, banner2, banner3, banner4, loadingAnimation } from '../../../assets'
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice'
import { motion } from 'framer-motion'
import ClearIcon from '@mui/icons-material/Clear';
import Lottie from 'lottie-react'


const sortOptions = [
    { name: "Price: low to high", sort: "price", order: "asc" },
    { name: "Price: high to low", sort: "price", order: "desc" },
]



export const ProductList = () => {
    const searchQuery = useSelector(selectSearchQuery)
    const [filters, setFilters] = useState({})
    const [page, setPage] = useState(1)
    const [sort, setSort] = useState(null)
    const theme = useTheme()

    const is1200 = useMediaQuery(theme.breakpoints.down(1200))
    const is800 = useMediaQuery(theme.breakpoints.down(800))
    const is700 = useMediaQuery(theme.breakpoints.down(700))
    const is600 = useMediaQuery(theme.breakpoints.down(600))
    const is500 = useMediaQuery(theme.breakpoints.down(500))
    const is488 = useMediaQuery(theme.breakpoints.down(488))
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const brands = useSelector(selectBrands)
    const categories = useSelector(selectCategories)
    const products = useSelector(selectProducts)
    const totalResults = useSelector(selectProductTotalResults)
    const loggedInUser = useSelector(selectLoggedInUser)

    const productFetchStatus = useSelector(selectProductFetchStatus)

    const wishlistItems = useSelector(selectWishlistItems)
    const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)

    const cartItemAddStatus = useSelector(selectCartItemAddStatus)

    const isProductFilterOpen = useSelector(selectProductIsFilterOpen)

    const dispatch = useDispatch()

    const handleBrandFilters = (e) => {

        const filterSet = new Set(filters.brand)

        if (e.target.checked) { filterSet.add(e.target.value) }
        else { filterSet.delete(e.target.value) }

        const filterArray = Array.from(filterSet);
        setFilters({ ...filters, brand: filterArray })
    }

    const handleCategoryFilters = (e) => {
        const filterSet = new Set(filters.category)

        if (e.target.checked) { filterSet.add(e.target.value) }
        else { filterSet.delete(e.target.value) }

        const filterArray = Array.from(filterSet);
        setFilters({ ...filters, category: filterArray })
    }

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        })
    }, [])

    useEffect(() => {
        setPage(1)
    }, [totalResults])


    useEffect(() => {
        const finalFilters = { ...filters }

        finalFilters['pagination'] = { page: page, limit: ITEMS_PER_PAGE }
        finalFilters['sort'] = sort
        if (searchQuery && String(searchQuery).trim()) {
            finalFilters['q'] = String(searchQuery).trim()
        }

        if (loggedInUser?.role !== 'admin') {
            finalFilters['user'] = true
        }

        dispatch(fetchProductsAsync(finalFilters))

    }, [filters, page, sort, searchQuery, dispatch, loggedInUser?.role])


    const handleAddRemoveFromWishlist = (e, productId) => {
        if (e.target.checked) {
            const data = { user: loggedInUser?._id, product: productId }
            dispatch(createWishlistItemAsync(data))
        }

        else if (!e.target.checked) {
            const index = wishlistItems.findIndex((item) => item.product._id === productId)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    useEffect(() => {
        if (wishlistItemAddStatus === 'fulfilled') {
            toast.success("Product added to wishlist")
        }
        else if (wishlistItemAddStatus === 'rejected') {
            toast.error("Error adding product to wishlist, please try again later")
        }

    }, [wishlistItemAddStatus])

    useEffect(() => {
        if (wishlistItemDeleteStatus === 'fulfilled') {
            toast.success("Product removed from wishlist")
        }
        else if (wishlistItemDeleteStatus === 'rejected') {
            toast.error("Error removing product from wishlist, please try again later")
        }
    }, [wishlistItemDeleteStatus])

    useEffect(() => {
        if (cartItemAddStatus === 'fulfilled') {
            toast.success("Product added to cart")
        }
        else if (cartItemAddStatus === 'rejected') {
            toast.error("Error adding product to cart, please try again later")
        }

    }, [cartItemAddStatus])

    useEffect(() => {
        if (productFetchStatus === 'rejected') {
            toast.error("Error fetching products, please try again later")
        }
    }, [productFetchStatus])

    useEffect(() => {
        return () => {
            dispatch(resetProductFetchStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetCartItemAddStatus())
        }
    }, [dispatch])


    const handleFilterClose = () => {
        dispatch(toggleFilters())
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Redesigned Filter Drawer */}
            <Drawer
                anchor="left"
                open={isProductFilterOpen}
                onClose={handleFilterClose}
                PaperProps={{
                    sx: {
                        width: is500 ? "100vw" : "320px",
                        p: 3,
                        boxShadow: '8px 0px 30px rgba(0,0,0,0.08)',
                        borderRight: 'none'
                    }
                }}
            >
                <Stack spacing={4}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant='h5' fontWeight={800} color="primary.main">Filters</Typography>
                        <IconButton onClick={handleFilterClose} sx={{ bgcolor: 'action.hover' }}>
                            <ClearIcon />
                        </IconButton>
                    </Stack>

                    <Divider />

                    {/* brand filters */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 16, bgcolor: 'primary.main', borderRadius: 1 }} />
                            Brands
                        </Typography>
                        <FormGroup onChange={handleBrandFilters}>
                            {brands?.map((brand) => (
                                <FormControlLabel
                                    key={brand._id}
                                    sx={{
                                        mb: 0.5,
                                        '& .MuiTypography-root': { fontSize: '0.9rem', color: 'text.secondary' },
                                        '&:hover .MuiTypography-root': { color: 'text.primary' }
                                    }}
                                    control={<Checkbox size="small" checked={filters.brand?.includes(brand._id) || false} />}
                                    label={brand.name}
                                    value={brand._id}
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Divider />

                    {/* category filters */}
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 16, bgcolor: 'secondary.main', borderRadius: 1 }} />
                            Categories
                        </Typography>
                        <FormGroup onChange={handleCategoryFilters}>
                            {categories?.map((category) => (
                                <FormControlLabel
                                    key={category._id}
                                    sx={{
                                        mb: 0.5,
                                        '& .MuiTypography-root': { fontSize: '0.9rem', color: 'text.secondary' },
                                        '&:hover .MuiTypography-root': { color: 'text.primary' }
                                    }}
                                    control={<Checkbox size="small" checked={filters.category?.includes(category._id) || false} />}
                                    label={category.name}
                                    value={category._id}
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    <Box sx={{ pt: 4 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={() => { setFilters({}); setPage(1); }}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Reset All Filters
                        </Button>
                    </Box>
                </Stack>
            </Drawer>

            <Stack spacing={4}>
                {/* Sort Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                        {totalResults} Products found
                    </Typography>

                    <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            label="Sort By"
                            value={sort ? JSON.stringify(sort) : ''}
                            onChange={(e) => setSort(e.target.value ? JSON.parse(e.target.value) : null)}
                        >
                            <MenuItem value="">Default</MenuItem>
                            {sortOptions.map((option) => (
                                <MenuItem key={option.name} value={JSON.stringify(option)}>{option.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                {/* Product Grid */}
                {productFetchStatus === 'pending' ? (
                    <Stack alignItems="center" py={10}>
                        <Lottie animationData={loadingAnimation} style={{ width: 200 }} />
                    </Stack>
                ) : products.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '1px solid #F0F0F0', bgcolor: '#fff' }}>
                        <Typography variant="h4" fontWeight={900} color="primary" sx={{ mb: 2 }}>Oops! No matches found</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                            We couldn't find any products matching "{searchQuery}". Try using different keywords or resetting your filters.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => { setFilters({}); setSort(null); }}
                            size="large"
                        >
                            Clear all filters
                        </Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {products.map((product) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <ProductCard
                                    id={product._id}
                                    title={product.title}
                                    thumbnail={product.thumbnail}
                                    brand={product.brand?.name}
                                    price={product.price}
                                    stockQuantity={product.stockQuantity ?? 0}
                                    flashSalePrice={product.flashSalePrice}
                                    flashSaleStartsAt={product.flashSaleStartsAt}
                                    flashSaleEndsAt={product.flashSaleEndsAt}
                                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Pagination */}
                <Stack alignItems="center" spacing={2} sx={{ mt: 6, mb: 10 }}>
                    <Pagination
                        count={Math.ceil(totalResults / ITEMS_PER_PAGE)}
                        page={page}
                        onChange={(e, p) => setPage(p)}
                        color="primary"
                        size={isMobile ? "medium" : "large"}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalResults)} of {totalResults} items
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}
