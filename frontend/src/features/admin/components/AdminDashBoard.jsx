import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
    Stack, Box, Typography, Card, CardContent, Chip, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Tooltip, Button, alpha, useTheme,
    FormControl, InputLabel, Select, MenuItem, LinearProgress
} from '@mui/material'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip,
    ResponsiveContainer, Legend
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import PeopleIcon from '@mui/icons-material/People'
import StoreIcon from '@mui/icons-material/Store'
import InventoryIcon from '@mui/icons-material/Inventory'
import RefreshIcon from '@mui/icons-material/Refresh'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import {
    fetchAdminAnalyticsOverview, fetchAdminAnalyticsSales,
    fetchAdminAnalyticsTopProducts, fetchAdminAnalyticsTopSellers, fetchAdminSellers,
    fetchAdminAdvancedStats
} from '../AdminApi'
import { getAllOrdersAsync } from '../../order/OrderSlice'
import { fetchProductsAsync } from '../../products/ProductSlice'
import { toast } from 'react-toastify'
import { ProductImage } from '../../products/components/ProductImage'

const MotionCard = motion(Card)

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } })
}

const KpiCard = ({ icon, label, value, sub, color, trend, trendVal, index }) => {
    return (
        <MotionCard
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            elevation={0}
            sx={{
                flex: 1, minWidth: 180,
                border: '1px solid', borderColor: 'divider',
                borderRadius: 3,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 6 }
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                            {label}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} lineHeight={1}>
                            {value}
                        </Typography>
                        {sub && (
                            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                                {sub}
                            </Typography>
                        )}
                    </Box>
                    <Box sx={{
                        width: 46, height: 46, borderRadius: 2.5,
                        bgcolor: alpha(color, 0.12),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        {React.cloneElement(icon, { sx: { color, fontSize: '1.4rem' } })}
                    </Box>
                </Stack>
                {trendVal !== undefined && (
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={1.5}>
                        {trend === 'up'
                            ? <TrendingUpIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                            : <TrendingDownIcon sx={{ color: 'error.main', fontSize: '1rem' }} />
                        }
                        <Typography variant="caption" color={trend === 'up' ? 'success.main' : 'error.main'} fontWeight={600}>
                            {trendVal}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">vs yesterday</Typography>
                    </Stack>
                )}
            </CardContent>
        </MotionCard>
    )
}

const AlertBanner = ({ count, label, to, color = 'warning' }) => (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <Stack
            direction="row" justifyContent="space-between" alignItems="center"
            sx={{
                p: 1.5, px: 2,
                bgcolor: color === 'error' ? 'error.light' : 'warning.light',
                color: color === 'error' ? 'error.contrastText' : 'warning.contrastText',
                borderRadius: 2, border: '1px solid',
                borderColor: color === 'error' ? 'error.main' : 'warning.main',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon fontSize="small" />
                <Typography fontWeight={600} variant="body2">
                    {count} {label} waiting for review
                </Typography>
            </Stack>
            <Button component={Link} to={to} size="small" variant="contained"
                color={color === 'error' ? 'error' : 'warning'} sx={{ fontWeight: 600 }}>
                Review Now →
            </Button>
        </Stack>
    </motion.div>
)

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={4} sx={{ p: 1.5, borderRadius: 2, minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
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
    return null
}

export const AdminDashBoard = () => {
    const [overview, setOverview] = useState(null)
    const [sales, setSales] = useState(null)
    const [topProducts, setTopProducts] = useState([])
    const [topSellers, setTopSellers] = useState([])
    const [pendingSellers, setPendingSellers] = useState(0)
    const [staleOrders, setStaleOrders] = useState(0)
    const [lowStockCount, setLowStockCount] = useState(0)
    const [advancedStats, setAdvancedStats] = useState(null)
    const [range, setRange] = useState('week')
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [lastRefresh, setLastRefresh] = useState(new Date())
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const loadAll = useCallback(async (r = range) => {
        setLoading(true)
        try {
            const [ov, sl, tp, ts, sellers, adv] = await Promise.all([
                fetchAdminAnalyticsOverview(),
                fetchAdminAnalyticsSales(r),
                fetchAdminAnalyticsTopProducts(5),
                fetchAdminAnalyticsTopSellers(5),
                fetchAdminSellers(),
                fetchAdminAdvancedStats()
            ])
            
            // Re-fetching orders and products using thunks to get the data into the store and local state
            const [ordersAction, productsAction] = await Promise.all([
                dispatch(getAllOrdersAsync()).unwrap(),
                dispatch(fetchProductsAsync({ limit: 100 })).unwrap()
            ])

            setOverview(ov)
            setSales(sl)
            setTopProducts(tp.topProducts || [])
            setTopSellers(ts.topSellers || [])
            setPendingSellers((sellers || []).filter(s => s.status === 'pending').length)
            setAdvancedStats(adv)
            
            // Calculate stale orders
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
            const stale = (ordersAction || []).filter(o => 
                ['Pending', 'Dispatched'].includes(o.status) && new Date(o.createdAt) < threeDaysAgo
            ).length
            setStaleOrders(stale)

            // Calculate low stock (threshold of 5)
            const lowStock = (productsAction?.data || []).filter(p => (p.stockQuantity ?? 0) <= 5).length
            setLowStockCount(lowStock)

            setLastRefresh(new Date())
        } catch (e) {
            console.error(e)
            toast.error('Error loading dashboard data')
        } finally {
            setLoading(false)
        }
    }, [range, dispatch])

    useEffect(() => { loadAll() }, [loadAll])
    useEffect(() => { loadAll(range) }, [range, loadAll])

    // Auto-refresh every 60s
    useEffect(() => {
        const timer = setInterval(() => loadAll(range), 60000)
        return () => clearInterval(timer)
    }, [range, loadAll])

    const chartData = (sales?.timeseries || []).map(row => ({
        date: row.date,
        Revenue: Number(row.revenue || 0),
        Orders: row.orders || 0,
    }))

    const accentColor = isDark ? '#818cf8' : '#6366f1'
    const secondColor = isDark ? '#34d399' : '#10b981'

    const kpis = [
        {
            icon: <AttachMoneyIcon />, label: 'Total Revenue', color: accentColor,
            value: `${Number(overview?.revenue?.total || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CFA`,
            sub: `Today: ${Number(overview?.revenue?.today || 0).toFixed(0)} CFA · Week: ${Number(overview?.revenue?.week || 0).toFixed(0)} CFA`,
        },
        {
            icon: <ShoppingBagIcon />, label: 'Total Orders', color: '#f59e0b',
            value: overview?.orders?.total ?? 0,
            sub: `Today: ${overview?.orders?.today ?? 0} · This week: ${overview?.orders?.week ?? 0}`,
        },
        {
            icon: <PeopleIcon />, label: 'Users', color: '#3b82f6',
            value: overview?.users?.total ?? 0,
            sub: `New today: ${overview?.users?.newToday ?? 0}`,
        },
        {
            icon: <StoreIcon />, label: 'Active Sellers', color: secondColor,
            value: overview?.sellers?.approved ?? 0,
            sub: `${overview?.sellers?.pending ?? 0} pending approval`,
        },
        {
            icon: <InventoryIcon />, label: 'Products', color: '#8b5cf6',
            value: overview?.products?.total ?? 0,
            sub: `Approved: ${overview?.products?.approved ?? 0} · Pending: ${overview?.products?.pending ?? 0}`,
        },
        {
            icon: <TrendingDownIcon />, label: 'Churn Rate', color: '#ef4444',
            value: `${advancedStats?.churn?.rate?.toFixed(1) || 0}%`,
            sub: `${advancedStats?.churn?.churnedCount || 0} inactive buyers`,
        },
        {
            icon: <WarningAmberIcon />, label: 'Abandoned', color: '#f97316',
            value: advancedStats?.abandonedCarts?.count || 0,
            sub: 'Carts > 24 hours old',
        },
    ]

    return (
        <Stack spacing={3}>
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                <Stack>
                    <Typography variant="h5" fontWeight={700}>Platform Overview</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Live data · Last updated {lastRefresh.toLocaleTimeString()}
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Chart Range</InputLabel>
                        <Select label="Chart Range" value={range} onChange={e => setRange(e.target.value)}>
                            <MenuItem value="week">Last 7 days</MenuItem>
                            <MenuItem value="month">Last 30 days</MenuItem>
                            <MenuItem value="year">Last 12 months</MenuItem>
                        </Select>
                    </FormControl>
                    <Tooltip title="Refresh data">
                        <IconButton onClick={() => loadAll(range)} size="small" disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>

            {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

            {/* Alerts */}
            {pendingSellers > 0 && (
                <AlertBanner count={pendingSellers} label="seller applications" to="/admin/sellers" />
            )}
            {(overview?.products?.pending ?? 0) > 0 && (
                <AlertBanner count={overview.products.pending} label="product approvals" to="/admin/approvals" color="error" />
            )}
            {staleOrders > 0 && (
                <AlertBanner count={staleOrders} label="stale orders (>3 days)" to="/admin/orders" color="error" />
            )}
            {lowStockCount > 0 && (
                <AlertBanner count={lowStockCount} label="products with low stock" to="/admin/products" color="warning" />
            )}

            {/* KPI Cards */}
            <Stack direction="row" flexWrap="wrap" gap={2}>
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.label} index={i} {...kpi} />
                ))}
            </Stack>

            {/* Revenue / Orders Chart */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                        <Box>
                            <Typography fontWeight={700} variant="h6">Revenue & Orders</Typography>
                            <Typography variant="body2" color="text.secondary">Performance over selected period</Typography>
                        </Box>
                    </Stack>
                    {chartData.length > 0 ? (
                        <Box sx={{ height: 280 }}>
                            <ResponsiveContainer width="99%" height={280}>
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={accentColor} stopOpacity={0.25} />
                                            <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={secondColor} stopOpacity={0.2} />
                                            <stop offset="95%" stopColor={secondColor} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v} CFA`} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                    <ChartTooltip content={<CustomTooltip />} />
                                    <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="Revenue" stroke={accentColor} strokeWidth={2.5} fill="url(#revGrad)" />
                                    <Area yAxisId="right" type="monotone" dataKey="Orders" stroke={secondColor} strokeWidth={2.5} fill="url(#ordGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    ) : (
                        <Box p={6} textAlign="center">
                            <Typography color="text.secondary">No data available for this period yet.</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Top Products & Top Sellers */}
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                {/* Top Products */}
                <Card elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography fontWeight={700}>Top Products</Typography>
                            <Tooltip title="Go to Approvals">
                                <IconButton size="small" component={Link} to="/admin/approvals">
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 0.75 } }}>
                                        <TableCell>#</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Qty</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topProducts.length > 0 ? topProducts.map((row, i) => (
                                        <TableRow key={row.product?._id || i} hover sx={{ '& td': { py: 0.75 } }}>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>#{i + 1}</Typography>
                                            </TableCell>
                                             <TableCell>
                                                 <Stack direction="row" alignItems="center" spacing={1.5}>
                                                     <ProductImage
                                                         src={row.product?.thumbnail}
                                                         alt={row.product?.title}
                                                         width={32}
                                                         height={32}
                                                     />
                                                     <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 160 }}>
                                                         {row.product?.title || '—'}
                                                     </Typography>
                                                 </Stack>
                                             </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">{row.quantity ?? 0}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label={`${Number(row.revenue || 0).toFixed(0)} CFA`} size="small"
                                                    sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, fontSize: '0.75rem' }} />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Box py={3} textAlign="center">
                                                    <Typography variant="body2" color="text.secondary">No product data yet.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                {/* Top Sellers */}
                <Card elevation={0} sx={{ flex: 1, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography fontWeight={700}>Top Sellers</Typography>
                            <Tooltip title="Manage Sellers">
                                <IconButton size="small" component={Link} to="/admin/sellers">
                                    <OpenInFullIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', py: 0.75 } }}>
                                        <TableCell>#</TableCell>
                                        <TableCell>Store</TableCell>
                                        <TableCell align="right">Orders</TableCell>
                                        <TableCell align="right">Revenue</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {topSellers.length > 0 ? topSellers.map((row, i) => (
                                        <TableRow key={row.sellerId || i} hover sx={{ '& td': { py: 0.75 } }}>
                                            <TableCell>
                                                <Typography variant="caption" color="text.secondary" fontWeight={600}>#{i + 1}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Avatar sx={{ width: 26, height: 26, bgcolor: secondColor, fontSize: '0.75rem' }}>
                                                        {(row.storeName || row.userEmail || '?')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 130 }}>
                                                        {row.storeName || row.userEmail || '—'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">{row.orders ?? 0}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label={`${Number(row.revenue || 0).toFixed(0)} CFA`} size="small"
                                                    sx={{ bgcolor: alpha(secondColor, 0.1), color: secondColor, fontWeight: 700, fontSize: '0.75rem' }} />
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>
                                                <Box py={3} textAlign="center">
                                                    <Typography variant="body2" color="text.secondary">No seller data yet.</Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
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
