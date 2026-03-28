import React, { useEffect, useState } from "react"
import {
  Box,
  Chip,
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
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { axiosi } from "../../../config/axios"

export const AdminApprovals = () => {
  const [status, setStatus] = useState("pending")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const res = await axiosi.get("/admin/products", { params: { status, limit: 50, page: 1 } })
      setProducts(res.data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading approvals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const updateStatus = async (id, next) => {
    try {
      await axiosi.patch(`/products/${id}`, { status: next })
      setProducts((prev) => prev.map((p) => (p._id === id ? { ...p, status: next } : p)))
      toast.success(`Product ${next}`)
    } catch (e) {
      console.error(e)
      toast.error("Error updating product status")
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            Catalog approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review seller submissions and control what appears in the public catalog.
          </Typography>
        </Stack>
        <IconButton onClick={load} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 200, maxWidth: 320 }}>
        <InputLabel>Status</InputLabel>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Brand</TableCell>
              <TableCell>Seller</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell>{p.title}</TableCell>
                <TableCell>{p.brand?.name || "-"}</TableCell>
                <TableCell>{p.seller || "-"}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={p.status} variant="outlined" />
                </TableCell>
                <TableCell align="right">{Number(p.price || 0).toFixed(2)} CFA</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Approve">
                      <span>
                        <IconButton
                          size="small"
                          color="success"
                          disabled={p.status === "approved"}
                          onClick={() => updateStatus(p._id, "approved")}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Reject">
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={p.status === "rejected"}
                          onClick={() => updateStatus(p._id, "rejected")}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {!products.length && !loading && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No products found for this status.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}

