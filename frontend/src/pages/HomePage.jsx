import React, { useEffect, useState } from 'react'
import { ProductList } from '../features/products/components/ProductList'
import { RecentlyViewedBlock, RecommendedBlock } from '../features/products/components/RecommendationBlocks'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Stack, Box } from '@mui/material'
import { ProductBanner } from '../features/products/components/ProductBanner'
import { fetchPublicBannersAsync, selectPublicBanners } from '../features/banner/BannerSlice'
import { banner1, banner2, banner3, banner4 } from '../assets'

export const HomePage = () => {
  const dispatch = useDispatch()
  const addressStatus = useSelector(selectAddressStatus)
  const banners = useSelector(selectPublicBanners)

  useEffect(() => {
    if (addressStatus === 'fulfilled') {
      dispatch(resetAddressStatus())
    }
  }, [addressStatus, dispatch])

  useEffect(() => {
    dispatch(fetchPublicBannersAsync())
  }, [dispatch])

  return (
    <>
      {/* hero banners */}
      <Box sx={{ width: "100%", margin: "0 auto", mb: 0 }}>
        <ProductBanner images={banners?.length > 0 ? banners.map((b) => b.imageUrl) : [banner1, banner2, banner3, banner4]} />
      </Box>
      <ProductList />
      <Stack sx={{ maxWidth: 1200, mx: 'auto', px: 2, py: 6 }} spacing={6}>
        <RecentlyViewedBlock />
        <RecommendedBlock />
      </Stack>
    </>
  )
}
