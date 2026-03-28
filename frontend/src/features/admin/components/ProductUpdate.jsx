import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductUpdateStatus, selectProductUpdateStatus, selectSelectedProduct, updateProductByIdAsync } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

export const ProductUpdate = () => {
    const { t } = useTranslation()
    const { register, handleSubmit, watch, formState: { errors } } = useForm()

    const { id } = useParams()
    const dispatch = useDispatch()
    const selectedProduct = useSelector(selectSelectedProduct)
    const brands = useSelector(selectBrands)
    const categories = useSelector(selectCategories)
    const productUpdateStatus = useSelector(selectProductUpdateStatus)
    const navigate = useNavigate()
    const theme = useTheme()
    const is1100 = useMediaQuery(theme.breakpoints.down(1100))
    const is480 = useMediaQuery(theme.breakpoints.down(480))


    useEffect(() => {
        if (id) {
            dispatch(fetchProductByIdAsync(id))
        }
    }, [id])

    useEffect(() => {
        if (productUpdateStatus === 'fulfilled') {
            toast.success(t('product.notifications.updated'))
            navigate("/admin/dashboard")
        }
        else if (productUpdateStatus === 'rejected') {
            toast.error(t('product.notifications.errorUpdating'))
        }
    }, [productUpdateStatus])

    useEffect(() => {
        return () => {
            dispatch(clearSelectedProduct())
            dispatch(resetProductUpdateStatus())
        }
    }, [])

    const handleProductUpdate = (data) => {
        const productUpdate = {
            ...data,
            _id: selectedProduct._id,
            images: [data?.image0, data?.image1, data?.image2, data?.image3],
            price: Number(data.price) || 0,
            regularPrice: Number(data.regularPrice || data.price) || 0,
            stockQuantity: Number(data.stockQuantity) || 0,
            discountPercentage: Number(data.discountPercentage) || 0
        }
        delete productUpdate?.image0
        delete productUpdate?.image1
        delete productUpdate?.image2
        delete productUpdate?.image3

        // Ensure both description fields are present for compatibility
        if (data.shortDescription) {
            productUpdate.fullDescription = productUpdate.fullDescription || `<p>${data.shortDescription}</p>`;
        }

        dispatch(updateProductByIdAsync(productUpdate))
    }


    return (
        <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >

            {
                selectedProduct &&

                <Stack width={is1100 ? "100%" : "60rem"} rowGap={4} mt={is480 ? 4 : 6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleProductUpdate)}>

                    {/* feild area */}
                    <Stack rowGap={3}>
                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.title')}</Typography>
                            <TextField {...register("title", { required: t('product.validation.titleRequired') })} defaultValue={selectedProduct.title} error={!!errors.title} helperText={errors.title?.message} />
                        </Stack>

                        <Stack flexDirection={'row'} >

                        <FormControl fullWidth error={!!errors.brand}>
                            <InputLabel id="brand-selection">{t('product.labels.brand')}</InputLabel>
                            <Select defaultValue={selectedProduct.brand?._id || selectedProduct.brand} {...register("brand", { required: t('product.validation.brandRequired') })} labelId="brand-selection" label={t('product.labels.brand')}>

                                {
                                    brands.map((brand) => (
                                        <MenuItem key={brand._id} value={brand._id}>{brand.name}</MenuItem>
                                    ))
                                }

                            </Select>
                            {errors.brand && <Typography variant='caption' color='error' sx={{ ml: 2 }}>{errors.brand.message}</Typography>}
                        </FormControl>


                        <FormControl fullWidth error={!!errors.category}>
                            <InputLabel id="category-selection">{t('product.labels.category')}</InputLabel>
                            <Select defaultValue={selectedProduct.category?._id || selectedProduct.category} {...register("category", { required: t('product.validation.categoryRequired') })} labelId="category-selection" label={t('product.labels.category')}>

                                {
                                    categories.map((category) => (
                                        <MenuItem key={category._id} value={category._id}>{category.name}</MenuItem>
                                    ))
                                }

                            </Select>
                            {errors.category && <Typography variant='caption' color='error' sx={{ ml: 2 }}>{errors.category.message}</Typography>}
                        </FormControl>

                        </Stack>


                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.shortDescription')}</Typography>
                            <TextField multiline rows={2} {...register("shortDescription", { required: t('product.validation.shortDescRequired') })} defaultValue={selectedProduct.shortDescription} error={!!errors.shortDescription} helperText={errors.shortDescription?.message} />
                        </Stack>

                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.fullDescription')}</Typography>
                            <TextField multiline rows={4} {...register("fullDescription", { required: t('product.validation.fullDescRequired') })} defaultValue={selectedProduct.fullDescription} error={!!errors.fullDescription} helperText={errors.fullDescription?.message} />
                        </Stack>

                        <Stack flexDirection={'row'}>
                            <Stack flex={1}>
                                <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.regularPrice')}</Typography>
                                <TextField type='number' {...register("regularPrice", { required: t('product.validation.regularPriceRequired'), min: { value: 1, message: t('product.validation.priceMin') } })} defaultValue={selectedProduct.regularPrice || selectedProduct.price} error={!!errors.regularPrice} helperText={errors.regularPrice?.message} />
                            </Stack>
                            <Stack flex={1}>
                                <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.salePrice')}</Typography>
                                <TextField type='number' {...register("price", { required: t('product.validation.priceRequired'), min: { value: 1, message: t('product.validation.priceMin') } })} defaultValue={selectedProduct.price} error={!!errors.price} helperText={errors.price?.message} />
                            </Stack>
                        </Stack>

                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.stockQuantity')}</Typography>
                            <TextField type='number' {...register("stockQuantity", { required: t('product.validation.stockRequired'), min: { value: 0, message: t('product.validation.stockMin') } })} defaultValue={selectedProduct.stockQuantity} error={!!errors.stockQuantity} helperText={errors.stockQuantity?.message} />
                        </Stack>
                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.thumbnail')}</Typography>
                            <TextField {...register("thumbnail", { required: t('product.validation.thumbnailRequired') })} defaultValue={selectedProduct.thumbnail} error={!!errors.thumbnail} helperText={errors.thumbnail?.message} />
                        </Stack>

                        <Stack>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.productImages')}</Typography>

                            <Stack rowGap={2}>
                                {
                                    selectedProduct.images.map((image, index) => (
                                        <TextField key={index} {...register(`image${index}`, { required: t('product.validation.imageRequired') })} defaultValue={image} error={!!errors[`image${index}`]} helperText={errors[`image${index}`]?.message} />
                                    ))
                                }
                            </Stack>

                        </Stack>

                    </Stack>


                    {/* action area */}
                    <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480 ? 1 : 2}>
                        <Button size={is480 ? 'medium' : 'large'} variant='contained' type='submit'>{t('common.actions.update')}</Button>
                        <Button size={is480 ? 'medium' : 'large'} variant='outlined' color='error' component={Link} to={'/admin/dashboard'}>{t('common.actions.cancel')}</Button>
                    </Stack>


                </Stack>
            }

        </Stack>
    )
}
