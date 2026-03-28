import React, { useEffect, useState } from "react"
import {
  Card, CardContent, FormControl, InputLabel, MenuItem,
  Rating, Select, Stack, TextField, Typography,
  Avatar, Box, Grid, alpha, useTheme, Divider,
  IconButton, Button, CircularProgress
} from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import { fetchSellerReviews, replyToSellerReview } from "../features/seller/SellerApi"
import { LoadingButton } from "@mui/lab"
import { toast } from "react-toastify"
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import FilterListIcon from '@mui/icons-material/FilterList'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export const SellerReviewsPage = () => {
  const theme = useTheme()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [productFilter, setProductFilter] = useState("")
  const [ratingFilter, setRatingFilter] = useState("")
  const [replying, setReplying] = useState(null)
  const [replyText, setReplyText] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (productFilter) params.productId = productFilter
      if (ratingFilter) params.rating = ratingFilter
      const data = await fetchSellerReviews(params)
      setReviews(data)
    } catch (e) {
      toast.error("Error loading reviews")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFilter, ratingFilter])

  const handleReply = async (review) => {
    const body = String(replyText || "").trim()
    if (!body) return
    setReplying(review._id)
    try {
      await replyToSellerReview(review._id, body)
      toast.success("Reply published")
      setReplying(null)
      setReplyText("")
      load()
    } catch (e) {
      toast.error("Failed to post reply")
    } finally {
      setReplying(null)
    }
  }

  const productIds = [...new Set(reviews.map((r) => r.product?._id).filter(Boolean))]
  const productTitles = {}
  reviews.forEach((r) => {
    if (r.product?._id) productTitles[r.product._id] = r.product.title
  })

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            Customer Feedback
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor your product ratings and engage with your customers.
          </Typography>
        </Box>

        {/* Sentiment Overview */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h2" fontWeight={900} color="primary.main">{averageRating}</Typography>
                <Rating value={Number(averageRating)} precision={0.1} readOnly sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                  Average Rating from {reviews.length} reviews
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} mb={2}>FEEDBACK SUMMARY</Typography>
                <Stack spacing={1.5}>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                    return (
                      <Stack direction="row" spacing={2} alignItems="center" key={star}>
                        <Typography variant="caption" fontWeight={700} sx={{ width: 40 }}>{star} Stars</Typography>
                        <Box sx={{ flex: 1, bgcolor: 'action.hover', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                          <Box sx={{ width: `${percentage}%`, bgcolor: star >= 4 ? 'success.main' : star >= 3 ? 'warning.main' : 'error.main', height: '100%', borderRadius: 4 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ width: 30 }}>{count}</Typography>
                      </Stack>
                    )
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2}>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel>All Products</InputLabel>
                <Select
                  value={productFilter}
                  label="All Products"
                  onChange={(e) => setProductFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Products</MenuItem>
                  {productIds.map((pid) => (
                    <MenuItem key={pid} value={pid}>
                      {productTitles[pid] || pid}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={ratingFilter}
                  label="Rating"
                  onChange={(e) => setRatingFilter(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">All Ratings</MenuItem>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <MenuItem key={r} value={r}>
                      {r} stars
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ borderRadius: 2, textTransform: 'none' }}>More Filters</Button>
            </Stack>
          </Box>

          <Divider />

          {loading ? (
            <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress size={30} /></Box>
          ) : reviews.length > 0 ? (
            <Stack divider={<Divider />}>
              {reviews.map((r) => (
                <Box key={r._id} sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', fontWeight: 800 }}>
                            {r.user?.name?.[0].toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={800}>{r.user?.name || "Verified Customer"}</Typography>
                            <Typography variant="caption" color="text.secondary">{new Date(r.createdAt).toLocaleDateString()}</Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', display: 'inline-flex', alignItems: 'center', width: 'fit-content' }}>
                          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                          <Typography variant="caption" fontWeight={700}>Verified Purchase</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="text.secondary" mb={0.5}>Product Reviewed</Typography>
                            <Typography variant="body1" fontWeight={800}>{r.product?.title || "Product"}</Typography>
                          </Box>
                          <Rating value={r.rating} readOnly size="small" />
                        </Stack>

                        <Typography variant="body1" sx={{ fontStyle: r.comment ? 'normal' : 'italic', color: r.comment ? 'text.primary' : 'text.secondary' }}>
                          {r.comment || "No written feedback provided."}
                        </Typography>

                        {r.sellerReply ? (
                          <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.1), position: 'relative' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: 12 }}>S</Avatar>
                              <Typography variant="caption" fontWeight={900} color="primary.main">STORE RESPONSE</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {r.sellerRepliedAt ? new Date(r.sellerRepliedAt).toLocaleDateString() : ""}
                              </Typography>
                            </Stack>
                            <Typography variant="body2">{r.sellerReply}</Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                              <TextField
                                fullWidth
                                multiline
                                rows={1}
                                placeholder="Acknowledge your customer's feedback..."
                                variant="outlined"
                                size="small"
                                disabled={replying === r._id}
                                onChange={(e) => {
                                  setReplying(r._id)
                                  setReplyText(e.target.value)
                                }}
                                value={replying === r._id ? replyText : ""}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: alpha('#000', 0.02) } }}
                              />
                              <LoadingButton
                                loading={replying === r._id && replyText.trim() !== ""}
                                variant="contained"
                                sx={{ borderRadius: 2, textTransform: 'none', px: 3, py: 1, fontWeight: 700 }}
                                onClick={() => handleReply(r)}
                                disabled={replying !== r._id || !replyText.trim()}
                              >
                                Post Reply
                              </LoadingButton>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Engagement increases customer trust by 40%.
                            </Typography>
                          </Box>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 10, textAlign: 'center' }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>No reviews yet</Typography>
              <Typography variant="body2" color="text.secondary">When customers review your products, they will appear here.</Typography>
            </Box>
          )}
        </Card>
      </Stack>
    </SellerLayout>
  )
}

