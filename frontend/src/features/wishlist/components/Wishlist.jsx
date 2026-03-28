import { Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme, Divider } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useDispatch, useSelector } from 'react-redux'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistFetchStatus, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, resetWishlistItemUpdateStatus, selectWishlistFetchStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItemUpdateStatus, selectWishlistItems, updateWishlistItemByIdAsync, selectIsWishlistPublic, selectWishlistPublicStatus, toggleWishlistPublicAsync } from '../WishlistSlice'
import { ProductCard } from '../../products/components/ProductCard'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { emptyWishlistAnimation, loadingAnimation } from '../../../assets';
import Lottie from 'lottie-react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useForm } from "react-hook-form"
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { motion } from 'framer-motion';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const Wishlist = () => {
  const dispatch = useDispatch()
  const wishlistItems = useSelector(selectWishlistItems)
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)
  const wishlistItemUpdateStatus = useSelector(selectWishlistItemUpdateStatus)
  const loggedInUser = useSelector(selectLoggedInUser)
  const cartItems = useSelector(selectCartItems)
  const cartItemAddStatus = useSelector(selectCartItemAddStatus)
  const wishlistFetchStatus = useSelector(selectWishlistFetchStatus)
  const isWishlistPublic = useSelector(selectIsWishlistPublic)
  const wishlistPublicStatus = useSelector(selectWishlistPublicStatus)

  const [editIndex, setEditIndex] = useState(-1)
  const [editValue, setEditValue] = useState('')

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      const data = { user: loggedInUser?._id, product: productId }
      dispatch(createWishlistItemAsync(data))
    } else {
      const index = wishlistItems.findIndex((item) => item.product._id === productId)
      dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id))
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [])

  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') toast.success("Added to wishlist")
    else if (wishlistItemAddStatus === 'rejected') toast.error("Error adding to wishlist")
  }, [wishlistItemAddStatus])

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') toast.success("Removed from wishlist")
    else if (wishlistItemDeleteStatus === 'rejected') toast.error("Error removing from wishlist")
  }, [wishlistItemDeleteStatus])

  useEffect(() => {
    if (wishlistItemUpdateStatus === 'fulfilled') {
      toast.success("Wishlist updated")
      setEditIndex(-1)
      setEditValue("")
    } else if (wishlistItemUpdateStatus === 'rejected') {
      toast.error("Error updating wishlist")
    }
  }, [wishlistItemUpdateStatus])

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') toast.success("Product added to cart")
    else if (cartItemAddStatus === 'rejected') toast.error('Error adding to cart')
  }, [cartItemAddStatus])

  useEffect(() => {
    if (wishlistFetchStatus === 'rejected') toast.error("Error fetching wishlist")
  }, [wishlistFetchStatus])

  useEffect(() => {
    return () => {
      dispatch(resetWishlistFetchStatus())
      dispatch(resetCartItemAddStatus())
      dispatch(resetWishlistItemUpdateStatus())
      dispatch(resetWishlistItemDeleteStatus())
      dispatch(resetWishlistItemAddStatus())
    }
  }, [dispatch])

  const handleNoteUpdate = (wishlistItemId) => {
    const update = { _id: wishlistItemId, note: editValue }
    dispatch(updateWishlistItemByIdAsync(update))
  }

  const handleEdit = (index) => {
    setEditValue(wishlistItems[index].note || "")
    setEditIndex(index)
  }

  const handleAddToCart = (productId) => {
    const data = { user: loggedInUser?._id, product: productId }
    dispatch(addToCartAsync(data))
    const wishlistEntry = wishlistItems.find(it => it.product._id === productId)
    if (wishlistEntry) dispatch(deleteWishlistItemByIdAsync(wishlistEntry._id))
  }

  const handleTogglePublic = () => {
    dispatch(toggleWishlistPublicAsync(!isWishlistPublic))
  }

  const shareUrl = `${window.location.origin}/wishlist/public/${loggedInUser?._id}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success("Link copied to clipboard!")
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 10 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 6 } }}>

        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
          <motion.div whileHover={{ x: -4 }}>
            <IconButton component={Link} to='/' size="large" sx={{ bgcolor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <ArrowBackIcon />
            </IconButton>
          </motion.div>
          <Typography variant="h3" fontWeight={800}>My Wishlist</Typography>
          
          <Box sx={{ flexGrow: 1 }} />

          {wishlistItems.length > 0 && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
               <Button
                variant={isWishlistPublic ? "contained" : "outlined"}
                color={isWishlistPublic ? "success" : "inherit"}
                startIcon={isWishlistPublic ? <VisibilityIcon /> : <VisibilityOffIcon />}
                onClick={handleTogglePublic}
                disabled={wishlistPublicStatus === 'pending'}
                sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 700 }}
              >
                {isWishlistPublic ? "Publicly Shared" : "Private Wishlist"}
              </Button>

              {isWishlistPublic && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={copyToClipboard}
                  sx={{ borderRadius: 3, textTransform: 'none' }}
                >
                  Copy Share Link
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        {wishlistFetchStatus === 'pending' ? (
          <Stack alignItems="center" py={10}>
            <Lottie animationData={loadingAnimation} style={{ width: 200 }} />
          </Stack>
        ) : wishlistItems.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 6, border: '1px solid #F0F0F0', bgcolor: '#fff' }}>
            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 4 }}>
              <Lottie animationData={emptyWishlistAnimation} />
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>Your wishlist is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Save items you love to keep track of them and buy later.
            </Typography>
            <Button variant="contained" component={Link} to="/" size="large">Start Shopping</Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {wishlistItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 5,
                    overflow: 'hidden',
                    border: '1px solid #F0F0F0',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.05)' }
                  }}
                >
                  <ProductCard
                    id={item.product._id}
                    title={item.product.title}
                    thumbnail={item.product.thumbnail}
                    brand={item.product.brand?.name}
                    price={item.product.price}
                    stockQuantity={item.product.stockQuantity}
                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                    isWishlistCard={true}
                  />

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.secondary">Personal Note</Typography>
                      <IconButton size="small" onClick={() => handleEdit(index)}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Stack>

                    {editIndex === index ? (
                      <Stack spacing={1.5}>
                        <TextField
                          size="small"
                          multiline
                          rows={2}
                          placeholder="Add a note..."
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" onClick={() => handleNoteUpdate(item._id)}>Save</Button>
                          <Button variant="text" size="small" color="inherit" onClick={() => setEditIndex(-1)}>Cancel</Button>
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          px: 2, py: 1, borderRadius: 2, bgcolor: '#FAFAFA',
                          color: item.note ? 'text.primary' : 'text.disabled',
                          fontStyle: item.note ? 'normal' : 'italic'
                        }}
                      >
                        {item.note || "No note added yet..."}
                      </Typography>
                    )}

                    <Box sx={{ mt: 3 }}>
                      {cartItems.some((ci) => ci.product._id === item.product._id) ? (
                        <Button fullWidth variant="outlined" component={Link} to="/cart" sx={{ borderRadius: 3 }}>
                          Already in cart
                        </Button>
                      ) : (
                        <Button fullWidth variant="contained" onClick={() => handleAddToCart(item.product._id)} sx={{ borderRadius: 3 }}>
                          Move to Cart
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  )
}
