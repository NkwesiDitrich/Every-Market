import React, { useEffect, useState } from "react"
import {
  Box, Card, CardContent, Grid, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
  alpha, useTheme, Avatar, Tooltip, LinearProgress, Divider,
  Chip, CircularProgress
} from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import { fetchSellerAnalyticsFunnel, fetchSellerAnalyticsCohorts } from "../features/seller/SellerApi"
import { toast } from "react-toastify"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  Cell, ComposedChart, Line
} from 'recharts'
import InsightsIcon from '@mui/icons-material/Insights'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import GroupsIcon from '@mui/icons-material/Groups'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'

export const SellerAnalyticsPage = () => {
  const theme = useTheme()
  const [funnel, setFunnel] = useState(null)
  const [cohorts, setCohorts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchSellerAnalyticsFunnel(), fetchSellerAnalyticsCohorts()])
      .then(([f, c]) => {
        setFunnel(f)
        setCohorts(c)
      })
      .catch(() => toast.error("Error syncronizing analytics data"))
      .finally(() => setLoading(false))
  }, [])

  // Process funnel data for chart
  const funnelChartData = funnel ? [
    { name: 'Views', value: funnel.views || 0, fill: theme.palette.primary.light },
    { name: 'Add to Cart', value: funnel.addToCart || 0, fill: theme.palette.primary.main },
    { name: 'Purchases', value: funnel.purchases || 0, fill: theme.palette.primary.dark },
  ] : []

  const conversionRate = funnel?.views > 0
    ? ((funnel.purchases / funnel.views) * 100).toFixed(1)
    : 0

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            Business Insights
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Analyze your store's performance and customer behavior.
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <CircularProgress size={40} />
            <Typography sx={{ mt: 2 }} color="text.secondary">Deep diving into your data...</Typography>
          </Box>
        ) : funnel ? (
          <Grid container spacing={3}>
            {/* Conversion Funnel */}
            <Grid item xs={12} lg={7}>
              <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={800}>Purchase Funnel</Typography>
                      <Typography variant="body2" color="text.secondary">Customer journey from discovery to order</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" fontWeight={900} color="primary.main">{conversionRate}%</Typography>
                      <Typography variant="caption" fontWeight={700}>CONVERSION RATE</Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={funnelChartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis
                          dataKey="name"
                          type="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 13, fontWeight: 600, fill: theme.palette.text.primary }}
                        />
                        <RechartsTooltip
                          cursor={{ fill: 'transparent' }}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                        />
                        <Bar
                          dataKey="value"
                          radius={[0, 8, 8, 0]}
                          barSize={40}
                        >
                          {funnelChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {funnelChartData.map((item, idx) => (
                      <Grid item xs={4} key={idx}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(item.fill, 0.05), border: '1px solid', borderColor: alpha(item.fill, 0.1) }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>{item.name.toUpperCase()}</Typography>
                          <Typography variant="h6" fontWeight={800}>{item.value.toLocaleString()}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} lg={5}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', flex: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main' }}>
                        <GroupsIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>Customer Engagement</Typography>
                        <Typography variant="caption" color="text.secondary">High intent browser sessions</Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack spacing={2.5}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight={600}>Add to Cart Rate</Typography>
                          <Typography variant="body2" fontWeight={800}>{funnel.views > 0 ? ((funnel.addToCart / funnel.views) * 100).toFixed(1) : 0}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={funnel.views > 0 ? (funnel.addToCart / funnel.views) * 100 : 0}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography variant="body2" fontWeight={600}>Checkout Completion</Typography>
                          <Typography variant="body2" fontWeight={800}>{funnel.addToCart > 0 ? ((funnel.purchases / funnel.addToCart) * 100).toFixed(1) : 0}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={funnel.addToCart > 0 ? (funnel.purchases / funnel.addToCart) * 100 : 0}
                          color="success"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700 }}>MONTHLY PERFORMANCE</Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ mt: 1 }}>Target: 120%</Typography>
                      </Box>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#fff', 0.2) }}>
                        <ArrowUpwardIcon />
                      </Box>
                    </Stack>
                    <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.7 }}>
                      You are currently performing 15% better than last month. Keep it up!
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Cohorts & Table */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={800} mb={3}>Customer Retention Cohorts</Typography>
                  <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Cohort Month</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>New Customers</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Repeat Buyers</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Repeat Rate</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Total Life Orders</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cohorts?.cohorts?.length > 0 ? (
                          cohorts.cohorts.map((c) => (
                            <TableRow key={c.month} hover>
                              <TableCell><Typography variant="body2" fontWeight={700}>{c.month}</Typography></TableCell>
                              <TableCell align="right"><Typography variant="body2">{c.newCustomers.toLocaleString()}</Typography></TableCell>
                              <TableCell align="right"><Typography variant="body2">{c.repeatCustomers.toLocaleString()}</Typography></TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${c.repeatRate}%`}
                                  size="small"
                                  color={c.repeatRate > 20 ? "success" : "default"}
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell align="right"><Typography variant="body2" fontWeight={700}>{c.totalOrders.toLocaleString()}</Typography></TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Typography variant="body2" color="text.secondary">Insufficient data for cohort analysis.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Product Level Insights */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={800}>Product Performance Deep-dive</Typography>
                  </Box>
                  <TableContainer>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Views</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Cart Adds</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Orders</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>Conv. Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(funnel.byProduct || []).map((row) => (
                          <TableRow key={row.product?._id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={row.product?.thumbnail} variant="rounded" sx={{ width: 40, height: 40 }} />
                                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 250 }}>{row.product?.title}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{row.views.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.addToCart.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.purchases.toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={800} color="primary.main">
                                {row.views > 0 ? ((row.purchases / row.views) * 100).toFixed(1) : 0}%
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <InsightsIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.2, mb: 2 }} />
            <Typography variant="h6" fontWeight={600}>Collecting Data...</Typography>
            <Typography variant="body2" color="text.secondary">Analytics details will appear once customers start interacting with your products.</Typography>
          </Box>
        )}
      </Stack>
    </SellerLayout>
  )
}

