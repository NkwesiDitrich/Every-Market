import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import {
  Box, Grid, Stack, Typography, Card, CardContent,
  alpha, useTheme, Avatar, IconButton, Button,
  LinearProgress
} from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import {
  fetchSellerAnalyticsSummaryAsync,
  fetchSellerOrdersAsync,
  fetchSellerProductsAsync,
  fetchSellerMarketingStatsAsync,
  selectSellerAnalytics,
  selectSellerAnalyticsStatus,
  selectSellerOrders,
  selectSellerProducts,
  selectSellerMarketingStats,
} from "../features/seller/SellerSlice"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import InventoryIcon from '@mui/icons-material/Inventory'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import GavelIcon from '@mui/icons-material/Gavel'

const NO_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjYuNjY2NyA2Ni42NjY3SDEzMy4zMzNWMTMzLjMzM0g2Ni42NjY3VjY2LjY2NjdaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02Ni42NjY3IDExNi42NjdMODMuMzMzMyAxMDBMMTAzLjMzMyAxMjBMMTE2LjY2NyAxMDYuNjY3TDEzMy4zMzMgMTIzLjMzMyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJybGUgY3g9IjgzLjMzMzIiIGN5PSI4My4zMzMzIiByPSI2LjY2NjY3IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+`

const KPICard = ({ title, value, icon, color, trend, subtitle }) => {
  return (
    <Card sx={{
      height: '100%',
      borderRadius: 4,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              {value}
            </Typography>
            {trend && (
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  {trend}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  than last month
                </Typography>
              </Stack>
            )}
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{
            bgcolor: alpha(color, 0.1),
            color: color,
            width: 48,
            height: 48,
            borderRadius: 2
          }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  )
}

export const SellerDashboardPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const theme = useTheme()
  const analytics = useSelector(selectSellerAnalytics)
  const products = useSelector(selectSellerProducts)
  const orders = useSelector(selectSellerOrders)
  const marketing = useSelector(selectSellerMarketingStats)

  useEffect(() => {
    dispatch(fetchSellerProductsAsync())
    dispatch(fetchSellerOrdersAsync())
    dispatch(fetchSellerAnalyticsSummaryAsync())
    dispatch(fetchSellerMarketingStatsAsync())
  }, [dispatch])

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = analytics?.totalRevenue || 0
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length
  const lowStockProducts = products.filter(p => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock').length

  // Mock data for charts - in real app this would come from analytics
  const salesData = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 2000, orders: 98 },
    { name: 'Thu', revenue: 2780, orders: 39 },
    { name: 'Fri', revenue: 1890, orders: 48 },
    { name: 'Sat', revenue: 2390, orders: 38 },
    { name: 'Sun', revenue: 3490, orders: 43 },
  ]

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            Business Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your store today.
          </Typography>
        </Box>

        {/* KPI Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Total Revenue"
              value={`${totalRevenue.toLocaleString()} CFA`}
              icon={<AttachMoneyIcon />}
              color={theme.palette.primary.main}
              trend="+12.5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Total Orders"
              value={totalOrders}
              icon={<ShoppingCartIcon />}
              color={theme.palette.success.main}
              trend="+5.2%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Active Products"
              value={totalProducts}
              icon={<InventoryIcon />}
              color={theme.palette.info.main}
              subtitle="All regions"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Pending Orders"
              value={pendingOrders}
              icon={<TrendingUpIcon />}
              color={theme.palette.warning.main}
              subtitle="Awaiting fulfillment"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <KPICard
              title="Low Stock"
              value={lowStockProducts}
              icon={<ErrorOutlineIcon />}
              color={theme.palette.error.main}
              subtitle="Immediate action needed"
            />
          </Grid>
        </Grid>

        {/* Marketing & Conversion Stats (Phase 3) */}
        <Grid container spacing={3}>
           <Grid item xs={12} md={4}>
              <KPICard 
                title="Conversion Rate"
                value={`${marketing?.conversionRate?.toFixed(2) || 0}%`}
                icon={<TrendingUpIcon />}
                color={theme.palette.secondary.main}
                subtitle={`${marketing?.views || 0} views vs ${marketing?.purchases || 0} sales`}
              />
           </Grid>
           <Grid item xs={12} md={4}>
              <KPICard 
                title="Abandoned in Carts"
                value={marketing?.abandonedItems || 0}
                icon={<ShoppingCartIcon />}
                color={theme.palette.warning.dark}
                subtitle="Items in active carts"
              />
           </Grid>
           <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, height: '100%', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Traffic Sources</Typography>
                  <Stack spacing={1} mt={1}>
                    {(marketing?.trafficSources || []).map((s, i) => (
                      <Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" fontWeight={600}>{s.source}</Typography>
                        <Box sx={{ flex: 1, mx: 2, height: 4, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                          <Box sx={{ 
                            width: `${(s.count / (marketing?.views || 1)) * 100}%`, 
                            height: '100%', 
                            borderRadius: 2, 
                            bgcolor: theme.palette.primary.main 
                          }} />
                        </Box>
                        <Typography variant="caption" fontWeight={700}>{s.count}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
           </Grid>
        </Grid>

        {/* Charts & Activity */}
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Revenue Performance</Typography>
                    <Typography variant="body2" color="text.secondary">Daily revenue and order volume</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Last 7 Days</Button>
                    <IconButton size="small"><MoreVertIcon /></IconButton>
                  </Stack>
                </Stack>
                <Box sx={{ width: '100%', height: 350 }}>
                  <ResponsiveContainer width="99%" height={350}>
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: theme.shadows[3],
                          backgroundColor: theme.palette.background.paper
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={700}>Top Products</Typography>
                  <Button endIcon={<ArrowForwardIcon />} size="small" sx={{ textTransform: 'none' }}>View All</Button>
                </Stack>

                <Stack spacing={3}>
                  {analytics?.topProducts?.length ? (
                    analytics.topProducts.map((tp, idx) => (
                      <Stack key={tp.product._id || idx} spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={tp.product.thumbnail}
                              variant="rounded"
                              sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider' }}
                              imgProps={{
                                  onError: (e) => { e.target.src = NO_IMAGE_BASE64 }
                              }}
                            >
                              {tp.product.title?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: 150 }}>
                                {tp.product.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {tp.quantity} sold
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography variant="body2" fontWeight={700}>
                            {tp.revenue.toFixed(2)} CFA
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, (tp.revenue / totalRevenue) * 500)} // Mock scaled progress
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            '& .MuiLinearProgress-bar': { borderRadius: 3 }
                          }}
                        />
                      </Stack>
                    ))
                  ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No sales data available yet.</Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Low Stock Alerts */}
        {lowStockProducts > 0 && (
          <Card sx={{
            borderRadius: 4,
            boxShadow: 'none',
            bgcolor: alpha(theme.palette.error.main, 0.02),
            border: '1px solid',
            borderColor: alpha(theme.palette.error.main, 0.1)
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.error.main, color: 'white' }}>
                  <ErrorOutlineIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} color="error.dark">Inventory Warning</Typography>
                  <Typography variant="body2" color="text.secondary">
                    You have {lowStockProducts} products that are low or out of stock. Restock soon to avoid losing sales.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                  onClick={() => navigate('/seller/products')}
                >
                  Manage Inventory
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </SellerLayout>
  )
}
