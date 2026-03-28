import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Card, CardContent, FormControl, InputLabel, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Paper, Chip, Box, alpha, IconButton, Tooltip, LinearProgress,
  useTheme
} from "@mui/material"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts"
import RefreshIcon from "@mui/icons-material/Refresh"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { toast } from "react-toastify"
import {
  fetchAdminAnalyticsOverview, fetchAdminAnalyticsSales,
  fetchAdminAnalyticsTopProducts, fetchAdminAnalyticsTopSellers
} from "../AdminApi"

const MotionCard = motion(Card)

const SectionHeader = ({ title, subtitle }) => (
  <Stack spacing={0.25} mb={2}>
    <Typography fontWeight={700} variant="h6">{title}</Typography>
    {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
  </Stack>
)

const StatCard = ({ label, values, color, index }) => (
  <MotionCard
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    elevation={0}
    sx={{ flex: 1, minWidth: 160, border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { boxShadow: 4 } }}
  >
    <CardContent sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>{label}</Typography>
      {values.map((v, i) => (
        <Stack key={i} direction="row" justifyContent="space-between" alignItems="center" mt={i === 0 ? 0 : 0.5}>
          <Typography variant={i === 0 ? "h4" : "caption"} fontWeight={i === 0 ? 700 : 400}
            color={i === 0 ? "text.primary" : "text.secondary"}>
            {v.label}
          </Typography>
          {i === 0 && (
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(color, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUpIcon sx={{ color, fontSize: '1.1rem' }} />
            </Box>
          )}
          {i !== 0 && (
            <Typography variant="caption" fontWeight={600} color={color}>{v.value}</Typography>
          )}
        </Stack>
      ))}
    </CardContent>
  </MotionCard>
)

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Paper elevation={4} sx={{ p: 1.5, borderRadius: 2, minWidth: 140 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>{label}</Typography>
      {payload.map((p, i) => (
        <Stack key={i} direction="row" justifyContent="space-between" spacing={3}>
          <Typography variant="caption" color="text.secondary">{p.name}</Typography>
          <Typography variant="caption" fontWeight={700} color={p.color}>
            {p.name === 'Revenue' ? `${Number(p.value).toFixed(0)} CFA` : p.value}
          </Typography>
        </Stack>
      ))}
    </Paper>
  )
}

export const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null)
  const [sales, setSales] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [topSellers, setTopSellers] = useState([])
  const [range, setRange] = useState("week")
  const [loading, setLoading] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const accentColor = isDark ? '#818cf8' : '#6366f1'
  const greenColor = isDark ? '#34d399' : '#10b981'
  const amberColor = '#f59e0b'

  const load = useCallback(async (r) => {
    setLoading(true)
    try {
      const [ov, sl, tp, ts] = await Promise.all([
        fetchAdminAnalyticsOverview(),
        fetchAdminAnalyticsSales(r || range),
        fetchAdminAnalyticsTopProducts(10),
        fetchAdminAnalyticsTopSellers(10),
      ])
      setOverview(ov)
      setSales(sl)
      setTopProducts(tp.topProducts || [])
      setTopSellers(ts.topSellers || [])
    } catch (e) {
      toast.error("Error loading analytics")
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { load() }, [load])
  useEffect(() => { load(range) }, [range, load])

  const chartData = (sales?.timeseries || []).map(row => ({
    date: row.date, Revenue: Number(row.revenue || 0), Orders: row.orders || 0,
  }))

  // Pie data for product statuses
  const productPie = [
    { name: 'Approved', value: overview?.products?.approved ?? 0, color: greenColor },
    { name: 'Pending', value: overview?.products?.pending ?? 0, color: amberColor },
  ]

  const kpis = [
    {
      label: 'Revenue', color: accentColor, index: 0,
      values: [
        { label: `${Number(overview?.revenue?.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CFA` },
        { label: 'Today', value: `${Number(overview?.revenue?.today || 0).toFixed(0)} CFA` },
        { label: 'Week', value: `${Number(overview?.revenue?.week || 0).toFixed(0)} CFA` },
        { label: 'Month', value: `${Number(overview?.revenue?.month || 0).toFixed(0)} CFA` },
      ]
    },
    {
      label: 'Orders', color: amberColor, index: 1,
      values: [
        { label: overview?.orders?.total ?? 0 },
        { label: 'Today', value: overview?.orders?.today ?? 0 },
        { label: 'Week', value: overview?.orders?.week ?? 0 },
        { label: 'Month', value: overview?.orders?.month ?? 0 },
      ]
    },
    {
      label: 'Users', color: '#3b82f6', index: 2,
      values: [
        { label: overview?.users?.total ?? 0 },
        { label: 'New today', value: overview?.users?.newToday ?? 0 },
      ]
    },
    {
      label: 'Products', color: '#8b5cf6', index: 3,
      values: [
        { label: overview?.products?.total ?? 0 },
        { label: 'Approved', value: overview?.products?.approved ?? 0 },
        { label: 'Pending', value: overview?.products?.pending ?? 0 },
      ]
    },
    {
      label: 'Sellers', color: greenColor, index: 4,
      values: [
        { label: overview?.sellers?.approved ?? 0 },
        { label: 'Pending', value: overview?.sellers?.pending ?? 0 },
      ]
    },
  ]

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
        <Stack spacing={0.25}>
          <Typography variant="h5" fontWeight={700}>Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Platform-wide KPIs and performance metrics.</Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Range</InputLabel>
            <Select label="Range" value={range} onChange={e => setRange(e.target.value)}>
              <MenuItem value="week">Last 7 days</MenuItem>
              <MenuItem value="month">Last 30 days</MenuItem>
              <MenuItem value="year">Last 12 months</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh"><IconButton onClick={() => load()} size="small" disabled={loading}><RefreshIcon /></IconButton></Tooltip>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* KPI Strip */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {kpis.map(k => <StatCard key={k.label} {...k} />)}
      </Stack>

      {/* Revenue + Orders chart */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader title="Revenue & Orders Over Time" subtitle="Combined area chart of sales performance." />
          {chartData.length > 0 ? (
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={greenColor} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={greenColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="l" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v} CFA`} />
                  <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                  <Area yAxisId="l" type="monotone" dataKey="Revenue" stroke={accentColor} strokeWidth={2.5} fill="url(#revG)" />
                  <Area yAxisId="r" type="monotone" dataKey="Orders" stroke={greenColor} strokeWidth={2.5} fill="url(#ordG)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          ) : (
            <Box p={6} textAlign="center"><Typography color="text.secondary">No paid orders in this range yet.</Typography></Box>
          )}
        </CardContent>
      </Card>

      {/* Bar chart + Pie */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card elevation={0} sx={{ flex: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader title="Daily Orders Bar Chart" />
            {chartData.length > 0 ? (
              <Box sx={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar dataKey="Orders" fill={accentColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box p={4} textAlign="center"><Typography color="text.secondary">No data yet.</Typography></Box>
            )}
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <SectionHeader title="Product Status" subtitle="Approved vs pending catalog split." />
            <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={4} dataKey="value" stroke="none">
                    {productPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1} mt={1}>
              {productPie.map(p => (
                <Stack key={p.name} direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography variant="body2">{p.name}</Typography>
                  </Stack>
                  <Chip label={p.value} size="small" sx={{ fontWeight: 700, bgcolor: alpha(p.color, 0.1), color: p.color }} />
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Top Products & Sellers tables */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <SectionHeader title="Top Products by Revenue" />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((row, i) => (
                    <TableRow key={row.product?._id || i} hover>
                      <TableCell><Typography variant="caption" color="text.secondary" fontWeight={600}>#{i + 1}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{row.product?.title || '—'}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2">{row.quantity ?? 0}</Typography></TableCell>
                      <TableCell align="right">
                        <Chip label={`${Number(row.revenue || 0).toFixed(0)} CFA`} size="small"
                          sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!topProducts.length && (
                    <TableRow><TableCell colSpan={4} sx={{ py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No data yet.</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: 2.5 }}>
            <SectionHeader title="Top Sellers by Revenue" />
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary' } }}>
                    <TableCell>#</TableCell>
                    <TableCell>Store</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topSellers.map((row, i) => (
                    <TableRow key={row.sellerId || i} hover>
                      <TableCell><Typography variant="caption" color="text.secondary" fontWeight={600}>#{i + 1}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{row.storeName || row.userEmail || '—'}</Typography></TableCell>
                      <TableCell align="right"><Typography variant="body2">{row.orders ?? 0}</Typography></TableCell>
                      <TableCell align="right">
                        <Chip label={`${Number(row.revenue || 0).toFixed(0)} CFA`} size="small"
                          sx={{ bgcolor: alpha(greenColor, 0.1), color: greenColor, fontWeight: 700, fontSize: '0.75rem' }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {!topSellers.length && (
                    <TableRow><TableCell colSpan={4} sx={{ py: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">No data yet.</Typography>
                    </TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  )
}
