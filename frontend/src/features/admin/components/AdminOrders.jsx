import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  getAllOrdersAsync, resetOrderUpdateStatus, selectOrderUpdateStatus,
  selectOrders, updateOrderByIdAsync
} from '../../order/OrderSlice'
import {
  Stack, Typography, Box, Card, CardContent, Chip, Avatar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip,
  FormControl, InputLabel, Select, MenuItem, Button, alpha,
  useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Divider,
  InputBase
} from '@mui/material'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import Lottie from 'lottie-react'
import { noOrdersAnimation } from '../../../assets/index'

const NO_IMAGE_BASE64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNNjYuNjY2NyA2Ni42NjY3SDEzMy4zMzNWMTMzLjMzM0g2Ni42NjY3VjY2LjY2NjdaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik02Ni42NjY3IDExNi42NjdMODMuMzMzMyAxMDBMMTAzLjMzMyAxMjBMMTE2LjY2NyAxMDYuNjY3TDEzMy4zMzMgMTIzLjMzMyIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJybGUgY3g9IjgzLjMzMzMiIGN5PSI4My4zMzMzIiByPSI2LjY2NjY3IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+`

const STATUS_CONFIG = {
  'Pending': { color: 'warning', bg: '#fef3c7', text: '#92400e' },
  'Dispatched': { color: 'info', bg: '#dbeafe', text: '#1e40af' },
  'Out for delivery': { color: 'primary', bg: '#ede9fe', text: '#5b21b6' },
  'Delivered': { color: 'success', bg: '#d1fae5', text: '#065f46' },
  'Cancelled': { color: 'error', bg: '#fee2e2', text: '#991b1b' },
}

const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || {}
  return (
    <Chip
      label={status || '—'}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.text, fontWeight: 600, border: 'none', fontSize: '0.75rem' }}
    />
  )
}

export const AdminOrders = () => {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const orderUpdateStatus = useSelector(selectOrderUpdateStatus)
  const [editIndex, setEditIndex] = useState(-1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const { register, handleSubmit } = useForm()

  useEffect(() => { dispatch(getAllOrdersAsync()) }, [dispatch])

  useEffect(() => {
    if (orderUpdateStatus === 'fulfilled') toast.success('Order status updated')
    else if (orderUpdateStatus === 'rejected') toast.error('Error updating order status')
  }, [orderUpdateStatus])

  useEffect(() => () => { dispatch(resetOrderUpdateStatus()) }, [dispatch])

  const canAdminIntervene = (order) => {
    if (!order) return { can: false, reason: "" }

    // 1. Order stuck too long (> 3 days)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const isStuck = new Date(order.createdAt) < threeDaysAgo && ['Pending', 'Dispatched'].includes(order.status)
    if (isStuck) return { can: true, reason: "Stale order" }

    // 2. Active Dispute (Checking if status or specific flags suggest dispute)
    // For now, checking if status is 'Pending' but older than 3 days handles the inactivity.
    // We'll also check for any explicit dispute markers if they exist in the model.
    if (order.disputeId || order.isDisputed) return { can: true, reason: "Active Dispute" }

    // 3. System Errors / Fraud (If flagged)
    if (order.paymentStatus === 'failed' || order.isFraudulent) return { can: true, reason: "System Error / Fraud" }

    return { can: false, reason: "Only sellers can update active fulfillment" }
  }

  const handleUpdateOrder = (data) => {
    const update = { ...data, _id: orders[editIndex]._id }
    setEditIndex(-1)
    dispatch(updateOrderByIdAsync(update))
  }

  const editOptions = ['Pending', 'Dispatched', 'Out for delivery', 'Delivered', 'Cancelled']

  const filtered = orders.filter(o => {
    const matchStatus = !statusFilter || o.status === statusFilter
    const matchSearch = !search || o._id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }

  const accentColor = isDark ? '#818cf8' : '#6366f1'

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>Orders</Typography>
          <Typography variant="body2" color="text.secondary">Manage and update fulfillment status for all platform orders.</Typography>
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={() => dispatch(getAllOrdersAsync())} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stats strip */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {[
          { label: 'Total Orders', value: stats.total, color: accentColor },
          { label: 'Pending', value: stats.pending, color: '#f59e0b' },
          { label: 'Delivered', value: stats.delivered, color: '#10b981' },
          { label: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ flex: 1, minWidth: 130 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, '&:hover': { boxShadow: 3 } }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>

      {/* Filters */}
      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1.5} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 0.5, minWidth: 220 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1rem' }} />
          <InputBase placeholder="Search by Order ID..." value={search} onChange={e => setSearch(e.target.value)} sx={{ fontSize: '0.875rem', flex: 1 }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            {editOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      {filtered.length > 0 ? (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <TableContainer component={Box} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: alpha(accentColor, 0.04), py: 1.25 } }}>
                  <TableCell>#</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Shipping</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((order, index) => (
                  <TableRow key={order._id} hover sx={{ '& td': { py: 1 }, cursor: 'pointer' }} onClick={() => setSelectedOrder(order)}>
                    <TableCell><Typography variant="caption" color="text.secondary" fontWeight={600}>{index + 1}</Typography></TableCell>
                    <TableCell><Typography variant="caption" fontFamily="monospace" color="text.secondary">{order._id?.slice(-8)}</Typography></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={-0.5}>
                        {order.item?.slice(0, 3).map((p, i) => (
                          <Avatar 
                            key={i} 
                            src={p.product?.thumbnail} 
                            sx={{ width: 28, height: 28, border: '2px solid white', fontSize: '0.75rem' }}
                            imgProps={{
                                onError: (e) => { e.target.src = NO_IMAGE_BASE64 }
                            }}
                          >
                            {p.product?.title?.[0]}
                          </Avatar>
                        ))}
                        {order.item?.length > 3 && <Avatar sx={{ width: 28, height: 28, bgcolor: 'action.selected', fontSize: '0.65rem', border: '2px solid white' }}>+{order.item.length - 3}</Avatar>}
                      </Stack>
                    </TableCell>
                    <TableCell align="right"><Typography variant="body2" fontWeight={600}>{order.total} CFA</Typography></TableCell>
                    <TableCell>
                      {order.address?.[0] && (
                        <Typography variant="caption" color="text.secondary">{order.address[0].city}, {order.address[0].country || order.address[0].state}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.25}>
                        <Typography variant="caption">{order.paymentMode}</Typography>
                        <Chip label={order.paymentStatus || 'N/A'} size="small" variant="outlined"
                          color={order.paymentStatus === 'paid' ? 'success' : 'default'} sx={{ fontSize: '0.65rem', height: 18 }} />
                      </Stack>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{new Date(order.createdAt).toLocaleDateString()}</Typography></TableCell>
                    <TableCell align="center" onClick={e => e.stopPropagation()}>
                      {editIndex === index ? (
                        <FormControl size="small" sx={{ minWidth: 160 }}>
                          <Select defaultValue={order.status} label="" {...register('status', { required: true })}>
                            {editOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                          </Select>
                        </FormControl>
                      ) : (
                        <StatusChip status={order.status} />
                      )}
                    </TableCell>
                    <TableCell align="center" onClick={e => e.stopPropagation()}>
                      {editIndex === index ? (
                        <Tooltip title="Save">
                          <IconButton onClick={handleSubmit(handleUpdateOrder)} size="small" color="success"><CheckCircleOutlinedIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={canAdminIntervene(order).can ? "Edit status (Intervention allowed)" : canAdminIntervene(order).reason}>
                          <span>
                            <IconButton 
                                size="small" 
                                onClick={() => setEditIndex(index)} 
                                disabled={!canAdminIntervene(order).can}
                            >
                                <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : (
        <Box display="flex" justifyContent="center" py={6}>
          <Stack alignItems="center" spacing={2} maxWidth={360}>
            <Lottie animationData={noOrdersAnimation} style={{ width: 220 }} />
            <Typography variant="h6" fontWeight={400} textAlign="center">No orders found</Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {search || statusFilter ? 'Try adjusting your filters.' : 'There are no orders in the system yet.'}
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Order Details
          <IconButton onClick={() => setSelectedOrder(null)} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedOrder && (
            <Stack spacing={2} mt={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Order ID</Typography>
                <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{selectedOrder._id}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <StatusChip status={selectedOrder.status} />
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Payment</Typography>
                <Typography variant="body2">{selectedOrder.paymentMode} · {selectedOrder.paymentStatus || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Total</Typography>
                <Typography variant="body2" fontWeight={700}>{selectedOrder.total} CFA</Typography>
              </Stack>
              <Divider />
              <Typography fontWeight={600} variant="body2">Items</Typography>
              {selectedOrder.item?.map((p, i) => (
                <Stack key={i} direction="row" alignItems="center" spacing={2}>
                  <Avatar 
                    src={p.product?.thumbnail} 
                    sx={{ width: 40, height: 40 }}
                    imgProps={{
                        onError: (e) => { e.target.src = NO_IMAGE_BASE64 }
                    }}
                  >
                    {p.product?.title?.[0]}
                  </Avatar>
                  <Stack flex={1}>
                    <Typography variant="body2" fontWeight={500}>{p.product?.title || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">Qty: {p.quantity || 1}</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={600}>{p.product?.price ? `${p.product.price} CFA` : '—'}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setSelectedOrder(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
