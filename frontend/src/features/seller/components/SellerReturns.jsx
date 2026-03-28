import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  IconButton,
  alpha,
  useTheme
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { fetchSellerReturns, updateSellerReturn } from "../SellerApi"

export const SellerReturns = () => {
  const theme = useTheme()
  const [items, setItems] = useState([])
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [nextStatus, setNextStatus] = useState("pending")
  const [resolution, setResolution] = useState(null)
  const [notes, setNotes] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      const data = await fetchSellerReturns(params)
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading returns")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const openDialog = (rr) => {
    setSelected(rr)
    setNextStatus(rr.status || "pending")
    setResolution(rr.resolution ?? null)
    setNotes(rr.notes || "")
    setOpen(true)
  }

  const save = async () => {
    if (!selected) return
    try {
      const updated = await updateSellerReturn(selected._id, { status: nextStatus, resolution, notes })
      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)))
      toast.success("Return updated")
      setOpen(false)
      setSelected(null)
    } catch (e) {
      console.error(e)
      toast.error("Error updating return")
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
            Return Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage returns for your products and issue resolutions.
          </Typography>
        </Stack>
        <IconButton onClick={load} disabled={loading} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
          <RefreshIcon color="primary" />
        </IconButton>
      </Stack>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select 
            label="Filter by Status" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Item Idx</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Resolution</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Requested On</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((rr) => (
              <TableRow key={rr._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{rr.user?.name || "Customer"}</Typography>
                  <Typography variant="caption" color="text.secondary">{rr.user?.email}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    #{rr.order?._id?.slice(-8).toUpperCase() || rr.order?.slice(-8).toUpperCase()}
                  </Typography>
                </TableCell>
                <TableCell align="center">{rr.itemIndex + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rr.reason}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip 
                    size="small" 
                    label={rr.status.toUpperCase()} 
                    color={rr.status === 'approved' ? 'success' : rr.status === 'rejected' ? 'error' : 'warning'}
                    sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                  />
                </TableCell>
                <TableCell align="center">
                  {rr.resolution ? (
                    <Chip size="small" label={rr.resolution.replace('_', ' ').toUpperCase()} variant="outlined" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {rr.createdAt ? new Date(rr.createdAt).toLocaleDateString() : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Button 
                    size="small" 
                    variant="contained" 
                    onClick={() => openDialog(rr)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box py={10} textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="text.secondary">No return requests found</Typography>
                    <Typography variant="body2" color="text.secondary">When customers request returns for your products, they will appear here.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Review Return Request</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={1}>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
              <Typography variant="caption" fontWeight={800} color="primary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>Customer Reason</Typography>
              <Typography variant="body2" fontWeight={500}>{selected?.reason}</Typography>
            </Box>

            <FormControl fullWidth>
              <InputLabel>Action / Status</InputLabel>
              <Select 
                label="Action / Status" 
                value={nextStatus} 
                onChange={(e) => setNextStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="pending">Keep Pending</MenuItem>
                <MenuItem value="approved">Approve Return</MenuItem>
                <MenuItem value="rejected">Reject Return</MenuItem>
              </Select>
            </FormControl>

            {nextStatus === 'approved' && (
              <FormControl fullWidth>
                <InputLabel>Resolution Strategy</InputLabel>
                <Select
                  label="Resolution Strategy"
                  value={resolution ?? ""}
                  onChange={(e) => setResolution(e.target.value || null)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Select Resolution</MenuItem>
                  <MenuItem value="refund">Full Refund</MenuItem>
                  <MenuItem value="replacement">Send Replacement</MenuItem>
                  <MenuItem value="store_credit">Issue Store Credit</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField 
              label="Seller Notes" 
              placeholder="Explain your decision to the customer..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              fullWidth 
              multiline 
              rows={4} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={save} sx={{ borderRadius: 2, px: 4, fontWeight: 700 }}>
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
