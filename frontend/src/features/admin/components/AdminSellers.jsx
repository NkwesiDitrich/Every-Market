import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  Paper, IconButton, Tooltip, Card, CardContent, alpha, useTheme,
  Avatar, InputBase, LinearProgress, Divider
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import RefreshIcon from "@mui/icons-material/Refresh"
import VisibilityIcon from "@mui/icons-material/Visibility"
import SearchIcon from "@mui/icons-material/Search"
import StoreIcon from "@mui/icons-material/Store"
import CloseIcon from "@mui/icons-material/Close"
import { toast } from "react-toastify"
import { fetchAdminSellers, updateAdminSeller } from "../AdminApi"

const STATUS_CONFIG = {
  approved: { color: '#065f46', bg: '#d1fae5', label: 'Approved' },
  pending: { color: '#92400e', bg: '#fef3c7', label: 'Pending' },
  rejected: { color: '#991b1b', bg: '#fee2e2', label: 'Rejected' },
}

const StatusChip = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || { color: '#6b7280', bg: '#f3f4f6', label: status }
  return (
    <Chip label={cfg.label} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, border: 'none', fontSize: '0.72rem' }} />
  )
}

export const AdminSellers = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [commissionRate, setCommissionRate] = useState(10)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accentColor = isDark ? '#818cf8' : '#6366f1'
  const greenColor = isDark ? '#34d399' : '#10b981'

  const loadSellers = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminSellers()
      setSellers(data)
    } catch (err) {
      toast.error("Error loading sellers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSellers() }, [])

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateAdminSeller(id, { status })
      setSellers(prev => prev.map(s => s._id === id ? updated : s))
      if (selectedSeller?._id === id) setSelectedSeller(updated)
      toast.success(`Seller ${status}`)
      setDialogOpen(false)
    } catch {
      toast.error("Error updating seller status")
    }
  }

  const handleCommissionUpdate = async () => {
    if (!selectedSeller) return
    try {
      const updated = await updateAdminSeller(selectedSeller._id, { commissionRate })
      setSellers(prev => prev.map(s => s._id === selectedSeller._id ? updated : s))
      setSelectedSeller(updated)
      toast.success("Commission rate updated")
    } catch {
      toast.error("Error updating commission rate")
    }
  }

  const openDetails = (seller) => {
    setSelectedSeller(seller)
    setCommissionRate(seller.commissionRate || 10)
    setDialogOpen(true)
  }

  const filtered = sellers.filter(s => {
    const matchStatus = !statusFilter || s.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q || s.storeName?.toLowerCase().includes(q) || s.user?.email?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = {
    total: sellers.length,
    pending: sellers.filter(s => s.status === 'pending').length,
    approved: sellers.filter(s => s.status === 'approved').length,
    rejected: sellers.filter(s => s.status === 'rejected').length,
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>Sellers</Typography>
          <Typography variant="body2" color="text.secondary">
            Approve applications, manage commissions, and monitor seller health.
          </Typography>
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={loadSellers} disabled={loading} size="small"><RefreshIcon /></IconButton>
        </Tooltip>
      </Stack>

      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* Stats */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {[
          { label: 'Total Sellers', value: stats.total, color: accentColor },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b' },
          { label: 'Approved', value: stats.approved, color: greenColor },
          { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} style={{ flex: 1, minWidth: 130 }}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </Stack>

      {/* Pending alert */}
      {stats.pending > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{
            p: 1.5, px: 2, borderRadius: 2, bgcolor: '#fef3c7',
            border: '1px solid #f59e0b'
          }}>
            <Typography variant="body2" fontWeight={600} color="#92400e" flex={1}>
              ⚠️ {stats.pending} seller application{stats.pending > 1 ? 's' : ''} awaiting approval
            </Typography>
            <Button size="small" variant="contained" color="warning"
              onClick={() => setStatusFilter('pending')} sx={{ fontWeight: 600 }}>
              Show Pending
            </Button>
          </Stack>
        </motion.div>
      )}

      {/* Filters */}
      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1.5} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 0.5, minWidth: 240 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1rem' }} />
          <InputBase placeholder="Search by store or email..." value={search} onChange={e => setSearch(e.target.value)} sx={{ fontSize: '0.875rem', flex: 1 }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        {statusFilter && (
          <Button size="small" onClick={() => setStatusFilter('')} variant="outlined" color="inherit">
            Clear Filter
          </Button>
        )}
      </Stack>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: alpha(accentColor, 0.04), py: 1.25 } }}>
                <TableCell>Store</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Commission</TableCell>
                <TableCell align="center">Health</TableCell>
                <TableCell align="center">Performance</TableCell>
                <TableCell>Applied</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(seller => (
                <TableRow key={seller._id} hover sx={{ '& td': { py: 1 } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: alpha(accentColor, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StoreIcon sx={{ fontSize: '1rem', color: accentColor }} />
                      </Box>
                      <Stack>
                        <Typography variant="body2" fontWeight={600}>{seller.storeName}</Typography>
                        <Typography variant="caption" color="text.secondary">{seller.user?.email || '—'}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Typography variant="caption">{seller.contactEmail}</Typography>
                      {seller.contactPhone && <Typography variant="caption" color="text.secondary">{seller.contactPhone}</Typography>}
                    </Stack>
                  </TableCell>
                  <TableCell align="center"><StatusChip status={seller.status} /></TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600}>{seller.commissionRate || 10}%</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap" rowGap={0.5}>
                      <Chip size="small" label={`${seller.health?.disputes ?? 0} disputes`}
                        color={seller.health?.disputes > 0 ? "warning" : "default"} variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }} />
                      <Chip size="small" label={`${seller.health?.returns ?? 0} returns`}
                        color={seller.health?.returns > 0 ? "warning" : "default"} variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }} />
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{seller.health?.orders ?? 0} orders</Typography>
                      <Typography variant="caption" color={greenColor}>{Number(seller.health?.revenue ?? 0).toFixed(0)} CFA</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {seller.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => openDetails(seller)} color="primary">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {seller.status === "pending" && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleStatusChange(seller._id, "approved")}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => handleStatusChange(seller._id, "rejected")}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && !loading && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box py={5} textAlign="center">
                      <Typography color="text.secondary">No sellers match the current filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Seller Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Seller Details
          <IconButton onClick={() => setDialogOpen(false)} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedSeller && (
            <Stack spacing={2} mt={1}>
              {selectedSeller.health && (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" rowGap={1}>
                  <Chip label={`${selectedSeller.health.disputes ?? 0} disputes`} color="warning" size="small" />
                  <Chip label={`${selectedSeller.health.returns ?? 0} returns`} color="warning" size="small" />
                  <Chip label={`${selectedSeller.health.orders ?? 0} orders`} color="primary" size="small" variant="outlined" />
                  <Chip label={`${Number(selectedSeller.health.revenue ?? 0).toFixed(2)} CFA revenue`} color="success" size="small" variant="outlined" />
                </Stack>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Current Status</Typography>
                <StatusChip status={selectedSeller.status} />
              </Stack>
              <TextField label="Store Name" value={selectedSeller.storeName || ""} disabled fullWidth size="small" />
              <TextField label="User Email" value={selectedSeller.user?.email || ""} disabled fullWidth size="small" />
              <TextField label="Contact Email" value={selectedSeller.contactEmail || ""} disabled fullWidth size="small" />
              {selectedSeller.contactPhone && (
                <TextField label="Contact Phone" value={selectedSeller.contactPhone} disabled fullWidth size="small" />
              )}
              <TextField label="Description" value={selectedSeller.description || ""} disabled fullWidth multiline rows={3} size="small" />
              <FormControl fullWidth size="small">
                <InputLabel>Commission Rate (%)</InputLabel>
                <Select value={commissionRate} onChange={e => setCommissionRate(e.target.value)} label="Commission Rate (%)">
                  {[5, 10, 15, 20, 25, 30].map(rate => <MenuItem key={rate} value={rate}>{rate}%</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" color="inherit" size="small">Close</Button>
          {selectedSeller?.status === "pending" && (
            <>
              <Button variant="contained" color="error" size="small"
                onClick={() => handleStatusChange(selectedSeller._id, "rejected")}>
                Reject
              </Button>
              <Button variant="contained" color="success" size="small"
                onClick={() => handleStatusChange(selectedSeller._id, "approved")}>
                Approve
              </Button>
            </>
          )}
          <Button variant="contained" size="small" onClick={handleCommissionUpdate}>
            Update Commission
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
