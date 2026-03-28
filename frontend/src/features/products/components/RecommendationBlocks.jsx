import React, { useEffect, useState } from "react"
import { Stack, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { ProductCard } from "./ProductCard"
import { fetchProductsByIds, fetchSimilarProducts, fetchRecommendedProducts } from "../ProductApi"
import { getRecentlyViewedIds } from "../../../utils/recentlyViewed"

export const RecentlyViewedBlock = () => {
  const [products, setProducts] = useState([])
  const ids = getRecentlyViewedIds()
  const idsKey = ids.join(',')
  const { t } = useTranslation()

  useEffect(() => {
    if (!ids.length) {
      setProducts([])
      return
    }
    fetchProductsByIds(ids).then(setProducts)
  }, [idsKey])

  if (!products.length) return null

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        {t("home.recentlyViewed")}
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap" useFlexGap>
        {products.slice(0, 6).map((p) => (
          <ProductCard
            key={p._id}
            id={p._id}
            title={p.title}
            price={p.price}
            thumbnail={p.thumbnail}
            brand={p.brand?.name ?? ""}
            stockQuantity={p.stockQuantity ?? 0}
            flashSalePrice={p.flashSalePrice}
            flashSaleStartsAt={p.flashSaleStartsAt}
            flashSaleEndsAt={p.flashSaleEndsAt}
            handleAddRemoveFromWishlist={() => {}}
            isWishlistCard={false}
            isAdminCard={false}
          />
        ))}
      </Stack>
    </Stack>
  )
}

export const SimilarProductsBlock = ({ productId, excludeId }) => {
  const [products, setProducts] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    if (!productId) return
    fetchSimilarProducts(productId).then((list) => {
      const filtered = excludeId ? list.filter((p) => p._id !== excludeId) : list
      setProducts(filtered)
    })
  }, [productId, excludeId])

  if (!products.length) return null

  return (
    <Stack spacing={2} mt={4}>
      <Typography variant="h6" fontWeight={600}>
        {t("home.similarProducts")}
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap" useFlexGap>
        {products.slice(0, 6).map((p) => (
          <ProductCard
            key={p._id}
            id={p._id}
            title={p.title}
            price={p.price}
            thumbnail={p.thumbnail}
            brand={p.brand?.name ?? ""}
            stockQuantity={p.stockQuantity ?? 0}
            flashSalePrice={p.flashSalePrice}
            flashSaleStartsAt={p.flashSaleStartsAt}
            flashSaleEndsAt={p.flashSaleEndsAt}
            handleAddRemoveFromWishlist={() => {}}
            isWishlistCard={false}
            isAdminCard={false}
          />
        ))}
      </Stack>
    </Stack>
  )
}

export const RecommendedBlock = () => {
  const [products, setProducts] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    fetchRecommendedProducts(8).then(setProducts)
  }, [])

  if (!products.length) return null

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        {t("home.recommendedForYou")}
      </Typography>
      <Stack direction="row" gap={2} flexWrap="wrap" useFlexGap>
        {products.slice(0, 8).map((p) => (
          <ProductCard
            key={p._id}
            id={p._id}
            title={p.title}
            price={p.price}
            thumbnail={p.thumbnail}
            brand={p.brand?.name ?? ""}
            stockQuantity={p.stockQuantity ?? 0}
            flashSalePrice={p.flashSalePrice}
            flashSaleStartsAt={p.flashSaleStartsAt}
            flashSaleEndsAt={p.flashSaleEndsAt}
            handleAddRemoveFromWishlist={() => {}}
            isWishlistCard={false}
            isAdminCard={false}
          />
        ))}
      </Stack>
    </Stack>
  )
}
