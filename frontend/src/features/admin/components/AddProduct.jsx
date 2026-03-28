import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { addProductAsync, resetProductAddStatus, selectProductAddStatus } from '../../products/ProductSlice'
import { Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useForm } from "react-hook-form"
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'

export const AddProduct = () => {
    const { t } = useTranslation()
    const { register, handleSubmit, reset, formState: { errors } } = useForm()

    const dispatch = useDispatch()
    const brands = useSelector(selectBrands)
    const categories = useSelector(selectCategories)
    const productAddStatus = useSelector(selectProductAddStatus)
    const navigate = useNavigate()
    const theme = useTheme()
    const is1100 = useMediaQuery(theme.breakpoints.down(1100))
    const is480 = useMediaQuery(theme.breakpoints.down(480))

    useEffect(() => {
        if (productAddStatus === 'fulfilled') {
            reset()
            toast.success(t('product.notifications.added'))
            navigate("/admin/dashboard")
        }
        else if (productAddStatus === 'rejected') {
            toast.error(t('product.notifications.errorAdding'))
        }
    }, [productAddStatus, navigate, reset, t])

    useEffect(() => {
        return () => {
            dispatch(resetProductAddStatus())
        }
    }, [dispatch])

    const handleAddProduct = (data) => {
        const newProduct = {
            ...data,
            images: [data.image0, data.image1, data.image2, data.image3],
            price: Number(data.price) || 0,
            regularPrice: Number(data.regularPrice || data.price) || 0,
            stockQuantity: Number(data.stockQuantity) || 0,
            discountPercentage: Number(data.discountPercentage) || 0
        }
        delete newProduct.image0
        delete newProduct.image1
        delete newProduct.image2
        delete newProduct.image3

        if (data.shortDescription && !data.fullDescription) {
            newProduct.fullDescription = `<p>${data.shortDescription}</p>`;
        }

        dispatch(addProductAsync(newProduct))
    }


    return (
        <Stack p={'0 16px'} justifyContent={'center'} alignItems={'center'} flexDirection={'row'} >


            <Stack width={is1100 ? "100%" : "60rem"} rowGap={4} mt={is480 ? 4 : 6} mb={6} component={'form'} noValidate onSubmit={handleSubmit(handleAddProduct)}>

                {/* feild area */}
                <Stack rowGap={3}>
                    <Stack>
                        <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.title')}</Typography>
                        <TextField {...register("title", { required: t('product.validation.titleRequired') })} error={!!errors.title} helperText={errors.title?.message} />
                    </Stack>

                    <Stack flexDirection={'row'} >

                        <FormControl fullWidth error={!!errors.brand}>
                            <InputLabel id="brand-selection">{t('product.labels.brand')}</InputLabel>
                            <Select {...register("brand", { required: t('product.validation.brandRequired') })} labelId="brand-selection" label={t('product.labels.brand')}>

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
                            <Select {...register("category", { required: t('product.validation.categoryRequired') })} labelId="category-selection" label={t('product.labels.category')}>

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
                        <TextField multiline rows={2} {...register("shortDescription", { required: t('product.validation.shortDescRequired') })} error={!!errors.shortDescription} helperText={errors.shortDescription?.message} />
                    </Stack>

                    <Stack>
                        <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.fullDescription')}</Typography>
                        <TextField multiline rows={4} {...register("fullDescription", { required: t('product.validation.fullDescRequired') })} error={!!errors.fullDescription} helperText={errors.fullDescription?.message} />
                    </Stack>

                    <Stack flexDirection={'row'}>
                        <Stack flex={1}>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.regularPrice')}</Typography>
                            <TextField type='number' {...register("regularPrice", { required: t('product.validation.regularPriceRequired'), min: { value: 1, message: t('product.validation.priceMin') } })} error={!!errors.regularPrice} helperText={errors.regularPrice?.message} />
                        </Stack>
                        <Stack flex={1}>
                            <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.salePrice')}</Typography>
                            <TextField type='number' {...register("price", { required: t('product.validation.priceRequired'), min: { value: 1, message: t('product.validation.priceMin') } })} error={!!errors.price} helperText={errors.price?.message} />
                        </Stack>
                    </Stack>

                    <Stack>
                        <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.stockQuantity')}</Typography>
                        <TextField type='number' {...register("stockQuantity", { required: t('product.validation.stockRequired'), min: { value: 0, message: t('product.validation.stockMin') } })} error={!!errors.stockQuantity} helperText={errors.stockQuantity?.message} />
                    </Stack>
                    <Stack>
                        <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.thumbnail')}</Typography>
                        <TextField {...register("thumbnail", { required: t('product.validation.thumbnailRequired') })} error={!!errors.thumbnail} helperText={errors.thumbnail?.message} />
                    </Stack>

                    <Stack>
                        <Typography variant='h6' fontWeight={400} gutterBottom>{t('product.labels.productImages')}</Typography>

                        <Stack rowGap={2}>

                            <TextField {...register("image0", { required: t('product.validation.imageRequired') })} error={!!errors.image0} helperText={errors.image0?.message} />
                            <TextField {...register("image1", { required: t('product.validation.imageRequired') })} error={!!errors.image1} helperText={errors.image1?.message} />
                            <TextField {...register("image2", { required: t('product.validation.imageRequired') })} error={!!errors.image2} helperText={errors.image2?.message} />
                            <TextField {...register("image3", { required: t('product.validation.imageRequired') })} error={!!errors.image3} helperText={errors.image3?.message} />

                        </Stack>

                    </Stack>

                </Stack>

                {/* action area */}
                <Stack flexDirection={'row'} alignSelf={'flex-end'} columnGap={is480 ? 1 : 2}>
                    <Button size={is480 ? 'medium' : 'large'} variant='contained' type='submit'>{t('product.actions.addProduct')}</Button>
                    <Button size={is480 ? 'medium' : 'large'} variant='outlined' color='error' component={Link} to={'/admin/dashboard'}>{t('common.actions.cancel')}</Button>
                </Stack>

            </Stack>

        </Stack>
    )
}
