import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  alpha,
  useTheme,
  Alert,
  Tooltip,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { toast } from "react-toastify"
import { AdminLayout } from "../layouts/AdminLayout"
import { fetchAdminStaleOrders } from "../features/admin/AdminApi"
import { useNavigate } from "react-router-dom"

export const AdminStaleOrdersPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminStaleOrders()
      setOrders(data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading stale orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const getDaysStale = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date))
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <AdminLayout>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              Stale Orders
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor orders that have been pending or confirmed for more than 3 days.
            </Typography>
          </Box>
          <IconButton onClick={load} disabled={loading} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        <Alert 
          icon={<ErrorOutlineIcon fontSize="inherit" />} 
          severity="warning" 
          sx={{ borderRadius: 3, fontWeight: 500 }}
        >
          These orders require attention. Sellers should be contacted if orders remain unfulfilled to maintain customer satisfaction.
        </Alert>

        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Days Stale</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{order.user?.name || "Customer"}</Typography>
                    <Typography variant="caption" color="text.secondary">{order.user?.email}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      size="small" 
                      label={order.status.toUpperCase()} 
                      color="warning"
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{new Date(order.createdAt).toLocaleDateString()}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography 
                      variant="body2" 
                      fontWeight={800} 
                      color={getDaysStale(order.createdAt) > 5 ? 'error.main' : 'warning.main'}
                    >
                      {getDaysStale(order.createdAt)} Days
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      variant="contained" 
                      onClick={() => navigate(`/admin/orders?orderId=${order._id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!orders.length && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={10}>
                      <Typography color="text.secondary" fontWeight={600}>Excellent! No stale orders found.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </AdminLayout>
  )
}
