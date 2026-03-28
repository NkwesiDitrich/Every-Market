import React, { useEffect, useState } from 'react'
import {
    Stack, Box, Typography, Card, CardContent, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    Chip, Button, alpha, useTheme, Grid, LinearProgress
} from '@mui/material'
import { AdminLayout } from '../layouts/AdminLayout'
import { fetchAdminReconciliation } from '../features/admin/AdminApi'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { toast } from 'react-toastify'

export const AdminReconciliationPage = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const theme = useTheme()

    const loadData = async () => {
        setLoading(true)
        try {
            const res = await fetchAdminReconciliation()
            setData(res)
        } catch (error) {
            toast.error('Error fetching reconciliation data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const overview = data?.overview || { totalRevenue: 0, totalCommission: 0, totalNetProfit: 0 }
    const sellerBreakdown = data?.sellerBreakdown || []

    const StatCard = ({ title, value, icon, color }) => (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, flex: 1 }}>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Box sx={{
                        p: 1.5, borderRadius: 2, bgcolor: alpha(color, 0.1),
                        color: color, display: 'flex'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase' }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" fontWeight={800}>
                            {Number(value || 0).toLocaleString()} CFA
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    )

    return (
        <AdminLayout>
            <Stack spacing={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
                        Financial Reconciliation
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Monitor platform revenue, commissions, and seller payouts.
                    </Typography>
                </Box>

                {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <StatCard 
                            title="Total Gross Revenue" 
                            value={overview.totalRevenue} 
                            icon={<ReceiptLongIcon />} 
                            color={theme.palette.primary.main} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard 
                            title="Total Commissions" 
                            value={overview.totalCommission} 
                            icon={<AccountBalanceWalletIcon />} 
                            color={theme.palette.success.main} 
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard 
                            title="Platform Net Profit" 
                            value={overview.totalNetProfit} 
                            icon={<TrendingUpIcon />} 
                            color={theme.palette.info.main} 
                        />
                    </Grid>
                </Grid>

                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" fontWeight={700}>Seller Payout Breakdown</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Aggregated earnings and commissions per store.
                        </Typography>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Store Name</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Gross Sales</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Commission Paid</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }} align="right">Net Payout</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sellerBreakdown.length > 0 ? sellerBreakdown.map((row, i) => (
                                    <TableRow key={i} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>{row.storeName}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {Number(row.revenue || 0).toLocaleString()} CFA
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography color="error.main" variant="body2" fontWeight={600}>
                                                -{Number(row.commissionSpent || 0).toLocaleString()} CFA
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip 
                                                label={`${Number(row.payout || 0).toLocaleString()} CFA`} 
                                                color="success" 
                                                size="small"
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No financial data available yet.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Stack>
        </AdminLayout>
    )
}
