import React, { useEffect, useState } from "react"
import { SellerLayout } from "../layouts/SellerLayout"
import {
  Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, Stack,
  TextField, Typography, IconButton, alpha, useTheme, Avatar, Divider,
  Tooltip, Badge, Box
} from "@mui/material"
import { useForm } from "react-hook-form"
import {
  fetchSellerCoupons,
  createSellerCoupon,
  updateSellerCoupon,
  deleteSellerCoupon,
  fetchSellerBundles,
  createSellerBundle,
  updateSellerBundle,
  deleteSellerBundle,
  fetchSellerProducts
} from "../features/seller/SellerApi"
import { LoadingButton } from "@mui/lab"
import { toast } from "react-toastify"
import AddIcon from '@mui/icons-material/Add'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import InventoryIcon from '@mui/icons-material/Inventory'
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditIcon from '@mui/icons-material/Edit'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LayersIcon from '@mui/icons-material/Layers'

export const SellerPromotionsPage = () => {
  const theme = useTheme()
  const [coupons, setCoupons] = useState([])
  const [bundles, setBundles] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [couponOpen, setCouponOpen] = useState(false)
  const [bundleOpen, setBundleOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [editingBundle, setEditingBundle] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

  const couponForm = useForm()
  const bundleForm = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [c, b, p] = await Promise.all([
        fetchSellerCoupons(),
        fetchSellerBundles(),
        fetchSellerProducts(),
      ])
      setCoupons(c)
      setBundles(b)
      setProducts(p)
    } catch (e) {
      toast.error("Error loading promotion data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleOpenCoupon = (coupon = null) => {
    setEditingCoupon(coupon)
    if (coupon) {
      couponForm.reset({
        code: coupon.code,
        description: coupon.description || "",
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscount: coupon.maxDiscount || "",
        usageLimit: coupon.usageLimit ?? "",
        active: coupon.active,
      })
    } else {
      couponForm.reset({
        code: "",
        description: "",
        type: "percentage",
        value: 10,
        minOrderValue: 0,
        maxDiscount: "",
        usageLimit: "",
        active: true,
      })
    }
    setCouponOpen(true)
  }

  const handleSaveCoupon = async (data) => {
    setSaveLoading(true)
    try {
      const payload = {
        code: String(data.code || "").toUpperCase().trim(),
        description: data.description,
        type: data.type,
        value: Number(data.value),
        minOrderValue: Number(data.minOrderValue) || 0,
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
        active: Boolean(data.active),
      }
      if (editingCoupon) {
        await updateSellerCoupon({ ...editingCoupon, ...payload })
        toast.success("Coupon updated successfully")
      } else {
        await createSellerCoupon(payload)
        toast.success("New coupon created")
      }
      setCouponOpen(false)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error saving coupon")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${c.code}"?`)) return
    try {
      await deleteSellerCoupon(c._id)
      toast.success("Coupon removed")
      load()
    } catch (e) {
      toast.error("Error deleting coupon")
    }
  }

  const handleOpenBundle = (bundle = null) => {
    setEditingBundle(bundle)
    if (bundle) {
      bundleForm.reset({
        name: bundle.name,
        productIds: bundle.productIds?.map((p) => p._id || p) || [],
        bundlePrice: bundle.bundlePrice,
      })
    } else {
      bundleForm.reset({ name: "", productIds: [], bundlePrice: 0 })
    }
    setBundleOpen(true)
  }

  const handleSaveBundle = async (data) => {
    setSaveLoading(true)
    try {
      const payload = {
        name: data.name,
        productIds: Array.isArray(data.productIds) ? data.productIds : [],
        bundlePrice: Number(data.bundlePrice),
      }
      if (payload.productIds.length < 2) {
        toast.error("A bundle must contain at least 2 products")
        setSaveLoading(false)
        return
      }
      if (editingBundle) {
        await updateSellerBundle({ ...editingBundle, ...payload })
        toast.success("Bundle updated successfully")
      } else {
        await createSellerBundle(payload)
        toast.success("New product bundle created")
      }
      setBundleOpen(false)
      load()
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error saving bundle")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleDeleteBundle = async (b) => {
    if (!window.confirm(`Are you sure you want to delete bundle "${b.name}"?`)) return
    try {
      await deleteSellerBundle(b._id)
      toast.success("Bundle removed")
      load()
    } catch (e) {
      toast.error("Error deleting bundle")
    }
  }

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              Promotions & Growth
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Boost your store visibility and sales with coupons and bundles.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ConfirmationNumberIcon />}
              onClick={() => handleOpenCoupon()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              New Coupon
            </Button>
            <Button
              variant="contained"
              startIcon={<LayersIcon />}
              onClick={() => handleOpenBundle()}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              New Bundle
            </Button>
          </Stack>
        </Stack>

        {/* Section: Coupons */}
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', width: 40, height: 40 }}>
              <ConfirmationNumberIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={800}>Store Coupons</Typography>
          </Stack>

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3].map(i => (
                <Grid item xs={12} md={6} lg={4} key={i}>
                  <Card sx={{ height: 160, borderRadius: 4, bgcolor: 'action.hover' }} />
                </Grid>
              ))}
            </Grid>
          ) : coupons.length > 0 ? (
            <Grid container spacing={3}>
              {coupons.map((c) => (
                <Grid item xs={12} md={6} lg={4} key={c._id}>
                  <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.01) } }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ letterSpacing: 0.5 }}>{c.code}</Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
                            {c.type === "percentage" ? `${c.value}% OFF` : `${c.value} CFA OFF`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            Min order: {c.minOrderValue || 0} CFA {c.maxDiscount ? `· Max: ${c.maxDiscount} CFA` : ""}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleOpenCoupon(c)} sx={{ bgcolor: 'action.hover' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteCoupon(c)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                      <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption" fontWeight={700} color="success.main">
                            {c.usageCount ?? 0} Used
                          </Typography>
                        </Stack>
                        <Chip
                          label={c.usageLimit != null ? `Limit: ${c.usageLimit}` : "Unlimited"}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'action.hover', textAlign: 'center' }}>
              <ConfirmationNumberIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" fontWeight={700}>No active coupons</Typography>
              <Typography variant="body2" color="text.secondary">Incentivize buyers with custom discount codes.</Typography>
            </Box>
          )}
        </Box>

        {/* Section: Bundles */}
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: 'secondary.main', width: 40, height: 40 }}>
              <LayersIcon />
            </Avatar>
            <Typography variant="h6" fontWeight={800}>Product Bundles</Typography>
          </Stack>

          {bundles.length > 0 ? (
            <Grid container spacing={3}>
              {bundles.map((b) => (
                <Grid item xs={12} md={6} lg={4} key={b._id}>
                  <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={800} noWrap sx={{ maxWidth: 200 }}>{b.name}</Typography>
                          <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>{b.bundlePrice.toFixed(0)} CFA</Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton size="small" onClick={() => handleOpenBundle(b)} sx={{ bgcolor: 'action.hover' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteBundle(b)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), color: 'error.main' }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>

                      <Stack spacing={1} mb={2}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>INCLUDED PRODUCTS</Typography>
                        <Stack direction="row" spacing={-1} sx={{ pl: 0.5 }}>
                          {b.productIds?.slice(0, 4).map((p, idx) => (
                            <Tooltip key={idx} title={p?.title || "Product"}>
                              <Avatar
                                src={p?.thumbnail}
                                sx={{ width: 32, height: 32, border: '2px solid white', bgcolor: 'action.hover' }}
                              >
                                {p?.title?.[0]}
                              </Avatar>
                            </Tooltip>
                          ))}
                          {(b.productIds?.length || 0) > 4 && (
                            <Avatar sx={{ width: 32, height: 32, border: '2px solid white', bgcolor: 'secondary.main', fontSize: 10 }}>
                              +{b.productIds.length - 4}
                            </Avatar>
                          )}
                        </Stack>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {b.productIds?.length || 0} items combined for a special price.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : !loading && (
            <Box sx={{ p: 4, borderRadius: 4, bgcolor: 'action.hover', textAlign: 'center' }}>
              <LayersIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="body1" fontWeight={700}>No active bundles</Typography>
              <Typography variant="body2" color="text.secondary">Combine products to increase average order value.</Typography>
            </Box>
          )}
        </Box>

        {/* Coupon Dialog */}
        <Dialog open={couponOpen} onClose={() => setCouponOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
            {editingCoupon ? "Edit Coupon Details" : "Create Store Coupon"}
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Stack spacing={2.5} mt={1} component="form">
              <TextField
                label="Promo Code"
                placeholder="E.g. SUMMER25"
                fullWidth required
                {...couponForm.register("code", { required: true })}
                inputProps={{ style: { textTransform: 'uppercase', fontWeight: 700 } }}
              />
              <TextField label="Description" placeholder="What is this discount for?" fullWidth {...couponForm.register("description")} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select label="Discount Type" {...couponForm.register("type")} defaultValue="percentage">
                      <MenuItem value="percentage">Percentage (%)</MenuItem>
                      <MenuItem value="fixed">Fixed Amount (CFA)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField type="number" label="Discount Value" fullWidth required {...couponForm.register("value", { valueAsNumber: true })} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField type="number" label="Min Order Value (CFA)" fullWidth {...couponForm.register("minOrderValue", { valueAsNumber: true })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField type="number" label="Max Discount (CFA)" placeholder="Optional" fullWidth {...couponForm.register("maxDiscount")} />
                </Grid>
              </Grid>
              <TextField type="number" label="Total Usage Limit" placeholder="How many times can this be used? (Optional)" fullWidth {...couponForm.register("usageLimit")} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setCouponOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
            <LoadingButton loading={saveLoading} onClick={couponForm.handleSubmit(handleSaveCoupon)} variant="contained" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}>
              {editingCoupon ? "Save Changes" : "Create Coupon"}
            </LoadingButton>
          </DialogActions>
        </Dialog>

        {/* Bundle Dialog */}
        <Dialog open={bundleOpen} onClose={() => setBundleOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3 }}>
            {editingBundle ? "Edit Product Bundle" : "Create Product Bundle"}
          </DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Stack spacing={2.5} mt={1} component="form">
              <TextField label="Bundle Name" placeholder="E.g. Photography Essentials Kit" fullWidth required {...bundleForm.register("name", { required: true })} />
              <FormControl fullWidth>
                <InputLabel>Select Products (2+ items)</InputLabel>
                <Select
                  multiple
                  label="Select Products (2+ items)"
                  {...bundleForm.register("productIds")}
                  value={bundleForm.watch("productIds") || []}
                  onChange={(e) => bundleForm.setValue("productIds", e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.length} items selected
                    </Box>
                  )}
                >
                  {products.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar src={p.thumbnail} sx={{ width: 24, height: 24 }} />
                        <Typography variant="body2">{p.title} · {p.price} CFA</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="number"
                label="Bundle Sale Price (CFA)"
                fullWidth required
                {...bundleForm.register("bundlePrice", { required: true, valueAsNumber: true })}
                helperText="Set a price lower than the total of individual products."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setBundleOpen(false)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
            <LoadingButton loading={saveLoading} onClick={bundleForm.handleSubmit(handleSaveBundle)} variant="contained" sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}>
              {editingBundle ? "Save Changes" : "Create Bundle"}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Stack>
    </SellerLayout>
  )
}
