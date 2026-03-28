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
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { fetchAdminReturns, updateAdminReturn } from "../AdminApi"

export const AdminReturns = () => {
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
      const data = await fetchAdminReturns(params)
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
      const updated = await updateAdminReturn(selected._id, { status: nextStatus, resolution, notes })
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
          <Typography variant="h5" fontWeight={600}>
            Returns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and resolve buyer return requests.
          </Typography>
        </Stack>
        <IconButton onClick={load} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 200, maxWidth: 320 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Order</TableCell>
              <TableCell align="center">Item</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Resolution</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((rr) => (
              <TableRow key={rr._id} hover>
                <TableCell>{rr.user?.email || "-"}</TableCell>
                <TableCell>{rr.order?._id || rr.order}</TableCell>
                <TableCell align="center">{rr.itemIndex}</TableCell>
                <TableCell>{rr.reason}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={rr.status} variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip size="small" label={rr.resolution || "-"} variant="outlined" />
                </TableCell>
                <TableCell>{rr.createdAt ? new Date(rr.createdAt).toLocaleDateString() : "-"}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="outlined" onClick={() => openDialog(rr)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No returns found.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve return</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Resolution</InputLabel>
              <Select
                label="Resolution"
                value={resolution ?? ""}
                onChange={(e) => setResolution(e.target.value || null)}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="refund">Refund</MenuItem>
                <MenuItem value="replacement">Replacement</MenuItem>
                <MenuItem value="store_credit">Store credit</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

