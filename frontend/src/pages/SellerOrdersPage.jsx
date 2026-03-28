import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from "react-i18next"
import {
  IconButton, Chip, Avatar, Tooltip, InputBase, alpha, useTheme,
  Button, Grid, Menu, MenuItem as MuiMenuItem, Divider, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Stack, Box, Typography, Card, CardContent, TableContainer,
  Table, TableHead, TableRow, TableCell, TableBody
} from "@mui/material"
import { SellerLayout } from "../layouts/SellerLayout"
import { fetchSellerOrdersAsync, selectSellerOrders, selectSellerOrdersStatus, updateSellerOrderAsync } from "../features/seller/SellerSlice"
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export const SellerOrdersPage = () => {
  const dispatch = useDispatch()
  const theme = useTheme()
  const orders = useSelector(selectSellerOrders)
  const status = useSelector(selectSellerOrdersStatus)
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState({ trackingNumber: "", carrierName: "" })

  useEffect(() => {
    dispatch(fetchSellerOrdersAsync())
  }, [dispatch])

  const handleOpenMenu = (event, order) => {
    setAnchorEl(event.currentTarget)
    setSelectedOrder(order)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleUpdateStatus = (status) => {
    if (status === "Shipped") {
      setTrackingDialogOpen(true)
    } else {
      dispatch(updateSellerOrderAsync({ orderId: selectedOrder._id, status }))
      handleCloseMenu()
    }
  }

  const handleSaveTracking = () => {
    dispatch(updateSellerOrderAsync({
      orderId: selectedOrder._id,
      status: "Shipped",
      trackingNumber: trackingInfo.trackingNumber,
      carrierName: trackingInfo.carrierName
    }))
    setTrackingDialogOpen(false)
    setTrackingInfo({ trackingNumber: "", carrierName: "" })
    handleCloseMenu()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return { color: "warning", label: "Pending" }
      case "Dispatched": return { color: "info", label: "Dispatched" }
      case "Out for delivery": return { color: "primary", label: "Out for Delivery" }
      case "Delivered": return { color: "success", label: "Delivered" }
      case "Cancelled": return { color: "error", label: "Cancelled" }
      default: return { color: "default", label: status }
    }
  }

  const filteredOrders = orders.filter(o =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.item.some(i => i.product?.title?.toLowerCase().includes(searchQuery.toLowerCase())))
  )

  const orderStats = [
    { label: t("All Orders"), count: orders.length, key: "All" },
    { label: t("Pending"), count: orders.filter(o => o.status === "Pending").length, key: "Pending" },
    { label: t("Fulfilling"), count: orders.filter(o => ["Dispatched", "Out for delivery"].includes(o.status)).length, key: "Fulfilling" },
    { label: t("Delivered"), count: orders.filter(o => o.status === "Delivered").length, key: "Delivered" },
  ]

  return (
    <SellerLayout>
      <Stack spacing={4}>
        {/* Header Section */}
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            {t('Order Fulfillment')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('Manage your incoming orders and track fulfillment progress.')}
          </Typography>
        </Box>

        {/* Stats Strip */}
        <Grid container spacing={2}>
          {orderStats.map((stat) => (
            <Grid item xs={6} md={3} key={stat.key}>
              <Card
                onClick={() => setStatusFilter(stat.key)}
                sx={{
                  borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: 'none', border: '1px solid',
                  borderColor: statusFilter === stat.key ? 'primary.main' : 'divider',
                  bgcolor: statusFilter === stat.key ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                  '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.02) }
                }}
              >
                <CardContent sx={{ py: 2, px: 2.5, '&:last-child': { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>{stat.label}</Typography>
                  <Typography variant="h5" fontWeight={800} color={statusFilter === stat.key ? 'primary.main' : 'text.primary'}>
                    {stat.count}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters & Search */}
        <Card sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <Box sx={{
                flex: 1, display: 'flex', alignItems: 'center',
                bgcolor: 'action.hover', borderRadius: 3, px: 2, py: 1,
                width: '100%'
              }}>
                <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                  placeholder="Search by order ID or product name..."
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ fontSize: '0.9rem' }}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ borderRadius: 3, textTransform: 'none', px: 2, width: { xs: '100%', md: 'auto' } }}
              >
                Advanced Filter
              </Button>
            </Stack>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t("Order Details")}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t("Items")}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t("Amount")}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{t("Status")}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }} align="right">{t("Actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {status === "pending" ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Typography color="text.secondary">{t("Syncing orders with server...")}</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusColor(order.status)
                    return (
                      <TableRow key={order._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" fontWeight={800}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <EventIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(order.createdAt).toLocaleDateString()} · {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={-1}>
                            {order.item.slice(0, 3).map((item, idx) => (
                              <Tooltip key={idx} title={item.product?.title || t('Product')}>
                                <Avatar
                                  src={item.product?.thumbnail}
                                  sx={{
                                    width: 32, height: 32, border: '2px solid white',
                                    bgcolor: 'action.hover', fontSize: 12
                                  }}
                                >
                                  {(item.product?.title || "P")[0]}
                                </Avatar>
                              </Tooltip>
                            ))}
                            {order.item.length > 3 && (
                              <Avatar sx={{ width: 32, height: 32, border: '2px solid white', bgcolor: 'primary.main', fontSize: 12 }}>
                                +{order.item.length - 3}
                              </Avatar>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {order.total.toFixed(2)} CFA
                          </Typography>
                          <Chip
                            label={order.paymentStatus || 'Pending'}
                            size="small"
                            variant="outlined"
                            sx={{ height: 16, fontSize: '0.6rem', mt: 0.5, fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            color={statusInfo.color}
                            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Details">
                              <IconButton size="small" onClick={(e) => handleOpenMenu(e, order)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                      <Box sx={{ opacity: 0.5, mb: 2 }}>
                        <ReceiptIcon sx={{ fontSize: 48 }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700}>No orders matching filters</Typography>
                      <Typography variant="body2" color="text.secondary">Try clearing your filters or search query.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          sx={{ '& .MuiPaper-root': { borderRadius: 3, boxShadow: theme.shadows[3], minWidth: 200 } }}
        >
          <MuiMenuItem onClick={handleCloseMenu}>
            <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="View Fulfillment Details" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
          </MuiMenuItem>
          <Divider sx={{ my: 1 }} />
          
          <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 700 }}>
            Quick Status Update
          </Typography>
          
          {['Pending', 'Confirmed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'].map((status) => (
            <MuiMenuItem 
              key={status} 
              onClick={() => handleUpdateStatus(status)}
              disabled={selectedOrder?.status === status}
            >
              <ListItemText primary={status} primaryTypographyProps={{ fontSize: '0.85rem' }} />
            </MuiMenuItem>
          ))}

          <Divider sx={{ my: 1 }} />
          <MuiMenuItem onClick={handleCloseMenu}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="Contact Customer" primaryTypographyProps={{ fontSize: '0.85rem' }} />
          </MuiMenuItem>
        </Menu>

        {/* Tracking Information Dialog */}
        <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800 }}>Shipping Information</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the tracking details to notify the customer that their order has been shipped.
            </Typography>
            <Stack spacing={2.5}>
              <TextField 
                fullWidth 
                label="Carrier Name" 
                placeholder="e.g. FedEx, DHL, USPS"
                value={trackingInfo.carrierName}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, carrierName: e.target.value })}
              />
              <TextField 
                fullWidth 
                label="Tracking Number" 
                placeholder="Enter numbers or link"
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo({ ...trackingInfo, trackingNumber: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setTrackingDialogOpen(false)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleSaveTracking} 
              variant="contained" 
              disabled={!trackingInfo.carrierName || !trackingInfo.trackingNumber}
            >
              Update to Shipped
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </SellerLayout>
  )
}

const ListItemIcon = ({ children }) => <Box sx={{ mr: 1, display: 'flex' }}>{children}</Box>
const ListItemText = ({ primary, primaryTypographyProps }) => (
  <Typography variant="body2" sx={primaryTypographyProps}>{primary}</Typography>
)
