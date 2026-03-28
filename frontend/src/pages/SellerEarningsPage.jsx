import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { SellerLayout } from "../layouts/SellerLayout"
import { fetchSellerAnalyticsSummaryAsync, selectSellerAnalytics } from "../features/seller/SellerSlice"
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material"

export const SellerEarningsPage = () => {
  const dispatch = useDispatch()
  const analytics = useSelector(selectSellerAnalytics)

  useEffect(() => {
    dispatch(fetchSellerAnalyticsSummaryAsync())
  }, [dispatch])

  const totalRevenue = analytics?.totalRevenue || 0
  const totalOrders = analytics?.totalOrders || 0

  return (
    <SellerLayout>
      <Typography variant="h5" fontWeight={600}>
        Earnings
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total revenue
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalRevenue.toFixed(2)} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Completed orders
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          This section can be extended with payout history, upcoming payouts, and commission breakdowns.
        </Typography>
      </Stack>
    </SellerLayout>
  )
}

