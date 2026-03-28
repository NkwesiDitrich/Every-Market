import React, { useEffect, useState, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Box, Button, Stack, Typography, Card,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, Avatar, InputBase, alpha, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, InputLabel, FormControl, Grid, Menu, MenuItem as MuiMenuItem,
  Divider, Stepper, Step, StepLabel,
  LinearProgress as MuiLinearProgress
} from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import {
  fetchSellerProductsAsync,
  selectSellerProducts,
  selectSellerProductsStatus,
} from "../features/seller/SellerSlice"
import { fetchAllCategoriesAsync, selectCategories } from "../features/categories/CategoriesSlice"
import { fetchAllBrandsAsync, selectBrands } from "../features/brands/BrandSlice"
import { useForm, Controller } from "react-hook-form"
import { createSellerProduct, deleteSellerProduct, updateSellerProduct } from "../features/seller/SellerApi"
import { StockUpdateModal } from "../features/seller/components/StockUpdateModal"
import { ProductImage } from "../features/products/components/ProductImage"
import { LoadingButton } from "@mui/lab"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useDropzone } from 'react-dropzone'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ImageIcon from '@mui/icons-material/Image'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { axiosi } from "../config/axios"

export const SellerProductsPage = () => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const products = useSelector(selectSellerProducts)
  const status = useSelector(selectSellerProductsStatus)
  const categories = useSelector(selectCategories)
  const brands = useSelector(selectBrands)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false)

  // Custom states for images and descriptions
  const [thumbnail, setThumbnail] = useState(null)
  const [gallery, setGallery] = useState([])
  const [uploading, setUploading] = useState(false)
  const { t } = useTranslation()

  const steps = ['Basic Info', 'Media', 'Pricing', 'Variants', 'SEO']

  const { register, handleSubmit, reset, control, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      productType: 'physical',
      status: 'approved',
      discountPercentage: 0,
      lowStockThreshold: 5
    }
  })

  useEffect(() => {
    dispatch(fetchSellerProductsAsync())
    dispatch(fetchAllCategoriesAsync())
    dispatch(fetchAllBrandsAsync())
  }, [dispatch])

  const handleOpenMenu = (event, product) => {
    setAnchorEl(event.currentTarget)
    setSelectedProduct(product)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
    // Don't clear selectedProduct here if we are opening a modal
    // It will be cleared when the menu opens again for another product
  }

  const handleOpenCreate = () => {
    setEditing(null)
    setThumbnail(null)
    setGallery([])
    setActiveStep(0)
    reset({
      productType: 'physical',
      status: 'approved',
      discountPercentage: 0,
      lowStockThreshold: 5,
      shortDescription: '',
      fullDescription: '',
      sku: '',
      price: '',
      regularPrice: '',
      stockQuantity: '',
      seo: { title: '', description: '', keywords: [] }
    })
    setOpen(true)
  }

  const handleOpenEdit = (product) => {
    setEditing(product)
    setThumbnail(product.thumbnail)
    setGallery(product.images || [])
    setActiveStep(0)
    reset({
      title: product.title,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      productType: product.productType || 'physical',
      sku: product.sku || '',
      price: product.price,
      regularPrice: product.regularPrice || product.price,
      discountPercentage: product.discountPercentage || 0,
      category: product.category?._id || product.category,
      brand: product.brand?._id || product.brand,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold || 5,
      productVideo: product.productVideo || '',
      shippingInfo: product.shippingInfo || { weight: 0, dimensions: { length: 0, width: 0, height: 0 } },
      seo: product.seo || { title: '', description: '', keywords: [] },
      flashSalePrice: product.flashSalePrice || "",
      flashSaleStartsAt: product.flashSaleStartsAt ? product.flashSaleStartsAt.slice(0, 16) : "",
      flashSaleEndsAt: product.flashSaleEndsAt ? product.flashSaleEndsAt.slice(0, 16) : "",
    })
    setOpen(true)
    handleCloseMenu()
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleNext = async () => {
    let isValid = false
    if (activeStep === 0) {
      isValid = await trigger(["title", "shortDescription", "category"])
    } else if (activeStep === 1) {
      if (!thumbnail) {
        toast.error('Thumbnail image is required')
        return
      }
      if (!gallery || gallery.length === 0) {
        toast.error('At least one gallery image is required')
        return
      }
      isValid = true
    } else if (activeStep === 2) {
      isValid = await trigger(["regularPrice", "price", "stockQuantity"])
    } else {
      isValid = true
    }

    if (isValid) {
      setActiveStep((prev) => prev + 1)
    } else {
      toast.warning('Please fill all required fields')
    }
  }

  const handleBack = () => setActiveStep((prev) => prev - 1)

  const onThumbnailDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    try {
      const res = await axiosi.post('/upload/single', formData)
      setThumbnail(res.data.url)
      setValue('thumbnail', res.data.url)
    } catch (e) {
      toast.error("Thumbnail upload failed")
    } finally {
      setUploading(false)
    }
  }, [setValue])

  const onGalleryDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    const formData = new FormData()
    acceptedFiles.forEach(file => formData.append('images', file))
    setUploading(true)
    try {
      const res = await axiosi.post('/upload/multiple', formData)
      const newUrls = [...gallery, ...res.data.urls]
      setGallery(newUrls)
      setValue('images', newUrls)
    } catch (e) {
      toast.error("Gallery upload failed")
    } finally {
      setUploading(false)
    }
  }, [gallery, setValue])

  const onSubmit = async (data) => {
    if (!thumbnail) {
      toast.error("Thumbnail is required")
      setActiveStep(1)
      return
    }
    try {
      const payload = {
        ...data,
        thumbnail,
        images: gallery,
        price: Number(data.price) || 0,
        regularPrice: data.regularPrice ? Number(data.regularPrice) : (Number(data.price) || 0),
        stockQuantity: Number(data.stockQuantity) || 0,
        lowStockThreshold: Number(data.lowStockThreshold) || 5,
        sku: data.sku && data.sku.trim() !== "" ? data.sku.trim() : undefined
      }

      if (editing) {
        if (payload.flashSalePrice === "" || payload.flashSaleStartsAt === "" || payload.flashSaleEndsAt === "") {
          payload.flashSalePrice = undefined
          payload.flashSaleStartsAt = undefined
          payload.flashSaleEndsAt = undefined
        } else {
          payload.flashSaleStartsAt = new Date(payload.flashSaleStartsAt).toISOString()
          payload.flashSaleEndsAt = new Date(payload.flashSaleEndsAt).toISOString()
        }
        await updateSellerProduct({ ...editing, ...payload })
        toast.success('Product updated successfully')
      } else {
        await createSellerProduct(payload)
        toast.success('Product added successfully')
      }
      setOpen(false)
      dispatch(fetchSellerProductsAsync())
    } catch (e) {
      console.error(e)
      const errorMsg = e.response?.data?.message || 'Error saving product'
      toast.error(errorMsg)
    }
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.title}"?`)) return
    try {
      await deleteSellerProduct(product._id)
      toast.success('Product deleted')
      dispatch(fetchSellerProductsAsync())
      handleCloseMenu()
    } catch (e) {
      toast.error('Error deleting product')
    }
  }

  const filteredProducts = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStockStatus = (product) => {
    const qty = product.stockQuantity;
    const status = product.stockStatus; // From backend auto-sync

    if (status === 'out_of_stock' || qty <= 0) return { label: 'Out of Stock', color: 'error' }
    if (status === 'low_stock') return { label: 'Low Stock', color: 'warning' }
    return { label: 'In Stock', color: 'success' }
  }

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header Section */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              {t('Inventory Management')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {products.length} {t('Total Products')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 700 }}
          >
            {t('Add Product')}
          </Button>
        </Stack>

        {/* Filters & Search */}
        <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Box sx={{
                flex: 1, display: 'flex', alignItems: 'center',
                bgcolor: 'action.hover', borderRadius: 3, px: 2, py: 1,
                width: '100%'
              }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder={t('Search products...')}
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ fontSize: '0.9rem' }}
                />
              </Box>
              <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  sx={{ borderRadius: 3, textTransform: 'none', px: 2 }}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  sx={{ borderRadius: 3, textTransform: 'none', px: 2 }}
                >
                  {t('Export CSV')}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('Product')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('Price')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('Inventory')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t('Status')}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="right">{t('Actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {status === "pending" ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography color="text.secondary">{t('Loading catalog...')}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const stock = getStockStatus(product)
                    return (
                      <TableRow key={product._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <ProductImage
                              src={product.thumbnail}
                              alt={product.title}
                              sx={{ width: 48, height: 48 }}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={700} sx={{ lineClamp: 1 }}>
                                {product.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {product._id.slice(-8).toUpperCase()}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {product.price.toFixed(2)} CFA
                          </Typography>
                          {product.flashSalePrice && (
                            <Chip
                              label={`Sale: ${product.flashSalePrice} CFA`}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {product.stockQuantity} units
                          </Typography>
                          <Box sx={{ width: 100, mt: 0.5 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, (product.stockQuantity / (product.lowStockThreshold * 5 || 50)) * 100)}
                              color={stock.color}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={stock.label}
                            size="small"
                            color={stock.color}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleOpenMenu(e, product)}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography variant="body1" fontWeight={600}>No products found</Typography>
                      <Typography variant="body2" color="text.secondary">Try adjusting your filters or add a new product.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl) && !!selectedProduct}
          onClose={handleCloseMenu}
          disableAutoFocusItem
          sx={{ '& .MuiPaper-root': { borderRadius: 3, boxShadow: theme.shadows[3], minWidth: 160 } }}
        >
          <MuiMenuItem onClick={() => handleOpenEdit(selectedProduct)}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Edit Product" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </MuiMenuItem>
          <MuiMenuItem onClick={() => window.open(`/product-details/${selectedProduct?._id}`, '_blank')}>
            <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="View in Shop" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </MuiMenuItem>
          <Divider sx={{ my: 1 }} />
          <MuiMenuItem onClick={() => { handleCloseMenu(); setTimeout(() => setInventoryModalOpen(true), 0); }} sx={{ color: 'primary.main' }}>
            <ListItemIcon><AddIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Update Stock / Log" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 700 }} />
          </MuiMenuItem>
          <MuiMenuItem onClick={() => handleDelete(selectedProduct)} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText primary={t('Delete Product')} primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </MuiMenuItem>
        </Menu>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, height: '90vh', display: 'flex', flexDirection: 'column' } }}>
          <DialogTitle sx={{ fontWeight: 800, px: 3, pt: 3, pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight={900}>{editing ? t('Edit Product') : t('New Listing')}</Typography>
              <Chip label={`Step ${activeStep + 1} of ${steps.length}`} color="primary" variant="soft" size="small" sx={{ fontWeight: 700 }} />
            </Stack>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 3, '& .MuiStepLabel-label': { fontSize: '0.7rem', fontWeight: 700 } }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </DialogTitle>

          <DialogContent sx={{ px: 3, py: 2, flex: 1, overflowY: 'auto' }}>
            {activeStep === 0 && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField label={t('Product Name')} fullWidth variant="outlined" {...register("title", { required: 'Product name is required' })} error={!!errors.title} helperText={errors.title?.message} />
                <TextField label={t('Short Description')} fullWidth multiline rows={2} placeholder="Brief summary of your product" {...register("shortDescription", { required: 'Short description is required' })} error={!!errors.shortDescription} helperText={errors.shortDescription?.message} />
                <Box>
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>{t('Full Description')}</Typography>
                  <Controller
                    name="fullDescription"
                    control={control}
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <ReactQuill theme="snow" value={field.value} onChange={field.onChange} style={{ height: 200, marginBottom: 50 }} />
                    )}
                  />
                  {errors.fullDescription && <Typography variant="caption" color="error">{errors.fullDescription.message}</Typography>}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>Category</InputLabel>
                      <Select {...register("category", { required: "Category is required" })} label="Category">
                        {categories.map((c) => (
                          <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                        ))}
                      </Select>
                      {errors.category && <Typography variant="caption" color="error" sx={{ ml: 2 }}>{errors.category.message}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!errors.brand}>
                      <InputLabel>Brand</InputLabel>
                      <Select {...register("brand", { required: "Brand is required" })} label="Brand">
                        <MenuItem value="">None</MenuItem>
                        {brands.map((b) => (
                          <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
                        ))}
                      </Select>
                      {errors.brand && <Typography variant="caption" color="error" sx={{ ml: 2 }}>{errors.brand.message}</Typography>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Product Type</InputLabel>
                      <Select {...register("productType", { required: "Product type is required" })} label="Product Type">
                        <MenuItem value="physical">Physical Product</MenuItem>
                        <MenuItem value="digital">Digital Content</MenuItem>
                        <MenuItem value="service">Service</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={4} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Main Thumbnail (Required)</Typography>
                  <UploadBox onDrop={onThumbnailDrop} uploading={uploading} preview={thumbnail} label="Click or drag main image" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>Product Gallery (Multiple)</Typography>
                  <UploadBox onDrop={onGalleryDrop} uploading={uploading} multi label="Click or drag gallery images" />
                  <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    {gallery.map((url, i) => (
                      <Avatar key={i} src={url} variant="rounded" sx={{ width: 80, height: 80, border: '1px solid', borderColor: 'divider' }} />
                    ))}
                  </Stack>
                </Box>
                <TextField label="Product Video URL (Optional)" fullWidth placeholder="Youtube or direct link" {...register("productVideo")} />
              </Stack>
            )}

            {activeStep === 2 && (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <TextField type="number" label="Regular Price (CFA)" fullWidth {...register("regularPrice", { required: "Regular price is required", valueAsNumber: true, min: { value: 1, message: "Price must be greater than 0" } })} error={!!errors.regularPrice} helperText={errors.regularPrice?.message} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField type="number" label="Sale Price (CFA)" fullWidth {...register("price", { required: "Sale price is required", valueAsNumber: true, min: { value: 1, message: "Price must be greater than 0" } })} error={!!errors.price} helperText={errors.price?.message} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="SKU" fullWidth placeholder="e.g. SHP-PRD-001" {...register("sku")} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField type="number" label="Stock Quantity" fullWidth {...register("stockQuantity", { required: "Stock quantity is required", valueAsNumber: true, min: { value: 0, message: "Stock cannot be negative" } })} error={!!errors.stockQuantity} helperText={errors.stockQuantity?.message} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField type="number" label="Low Stock Alert Threshold" fullWidth {...register("lowStockThreshold")} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Product Status</InputLabel>
                    <Select {...register("status")} label="Product Status">
                      <MenuItem value="draft">Save as Draft</MenuItem>
                      <MenuItem value="approved">Published</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {activeStep === 3 && (
              <Stack spacing={4} sx={{ mt: 1 }}>
                <Box sx={{ p: 4, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 4 }}>
                  <Typography variant="h6" fontWeight={700} color="text.secondary">Variants Configuration</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage sizes, colors, and specific stock per variant.</Typography>
                  <Button variant="outlined" startIcon={<AddIcon />}>Add Variant Attribute</Button>
                </Box>
                <Typography variant="subtitle1" fontWeight={800}>Shipping Info (Physical)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <TextField label="Weight (kg)" fullWidth {...register("shippingInfo.weight")} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField label="Length (cm)" fullWidth {...register("shippingInfo.dimensions.length")} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField label="Width (cm)" fullWidth {...register("shippingInfo.dimensions.width")} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField label="Height (cm)" fullWidth {...register("shippingInfo.dimensions.height")} />
                  </Grid>
                </Grid>
              </Stack>
            )}

            {activeStep === 4 && (
              <Stack spacing={3} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" fontWeight={800}>Search Optimization (SEO)</Typography>
                <TextField label="SEO Title" fullWidth {...register("seo.title")} />
                <TextField label="Meta Description" fullWidth multiline rows={3} {...register("seo.description")} />
                <TextField label="URL Slug" fullWidth placeholder="product-name-slug" {...register("seo.slug")} />
                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                  * Friendly slugs improve search ranking.
                </Typography>
                <Divider />
                <Typography variant="subtitle1" fontWeight={800}>Action Policy</Typography>
                <FormControl component="fieldset">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2">I agree to the platform's multi-vendor listing policies.</Typography>
                  </Stack>
                </FormControl>
              </Stack>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={handleClose} sx={{ px: 3, borderRadius: 2, textTransform: 'none' }}>Cancel</Button>
            <Box sx={{ flex: 1 }} />
            {activeStep > 0 && (
              <Button startIcon={<NavigateBeforeIcon />} onClick={handleBack} sx={{ mr: 1, px: 3, borderRadius: 2, textTransform: 'none' }}>
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={handleNext} sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                Next Step
              </Button>
            ) : (
              <LoadingButton onClick={handleSubmit(onSubmit)} variant="contained" loading={uploading} sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                {editing ? "Save Changes" : "Create Listing"}
              </LoadingButton>
            )}
          </DialogActions>
        </Dialog>

        <StockUpdateModal 
            open={inventoryModalOpen} 
            onClose={() => setInventoryModalOpen(false)} 
            product={selectedProduct}
        />
      </Stack>
    </SellerLayout>
  )
}

const ListItemIcon = ({ children }) => <Box sx={{ mr: 1, display: 'flex' }}>{children}</Box>
const ListItemText = ({ primary, primaryTypographyProps }) => (
  <Typography variant="body2" sx={primaryTypographyProps}>{primary}</Typography>
)
const LinearProgress = ({ value, color, sx }) => (
  <Box sx={{ width: '100%', bgcolor: 'divider', borderRadius: 1, overflow: 'hidden', ...sx }}>
    <Box
      sx={{
        width: `${value}%`,
        height: '100%',
        bgcolor: `${color}.main`,
        transition: 'width 0.3s ease'
      }}
    />
  </Box>
)

const UploadBox = ({ onDrop, uploading, preview, label, multi }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: multi })
  const theme = useTheme()

  return (
    <Box
      {...getRootProps()}
      sx={{
        p: 3,
        borderRadius: 4,
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'divider',
        bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'action.hover',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) },
        position: 'relative',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <MuiLinearProgress sx={{ width: '100%', position: 'absolute', top: 0, left: 0 }} />
      ) : null}

      {preview ? (
        <Box sx={{ position: 'relative', width: '100%', height: '100%', minHeight: 100 }}>
          <img src={preview} alt="preview" style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 8 }} />
          <Typography variant="caption" display="block" color="primary" sx={{ mt: 1, fontWeight: 700 }}>Click to change</Typography>
        </Box>
      ) : (
        <>
          <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">PNG, JPG, WEBP (Max 5MB)</Typography>
        </>
      )}
    </Box>
  )
}
