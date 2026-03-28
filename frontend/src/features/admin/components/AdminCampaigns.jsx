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
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { axiosi } from "../../../config/axios"
import {
  fetchAdminCampaigns,
  fetchAdminFeaturedCollections,
  createAdminCampaign,
  updateAdminCampaign,
  deleteAdminCampaign,
} from "../AdminApi"

const defaultForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderValue: 0,
  maxDiscount: "",
  targetAudience: "all",
  bannerId: "",
  featuredCollectionId: "",
  active: true,
}

export const AdminCampaigns = () => {
  const [items, setItems] = useState([])
  const [banners, setBanners] = useState([])
  const [featuredCollections, setFeaturedCollections] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const load = async () => {
    try {
      setLoading(true)
      const [data, bannersRes, featuredRes] = await Promise.all([
        fetchAdminCampaigns(),
        axiosi.get("/banners/admin").then((r) => r.data),
        fetchAdminFeaturedCollections(),
      ])
      setItems(data)
      setBanners(bannersRes || [])
      setFeaturedCollections(featuredRes || [])
    } catch (e) {
      console.error(e)
      toast.error("Error loading campaigns")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(defaultForm)
    setOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({
      name: c.name || "",
      description: c.description || "",
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue ?? 10,
      minOrderValue: c.minOrderValue ?? 0,
      maxDiscount: c.maxDiscount ?? "",
      targetAudience: c.targetAudience || "all",
      bannerId: c.bannerId?._id || c.bannerId || "",
      featuredCollectionId: c.featuredCollectionId?._id || c.featuredCollectionId || "",
      active: c.active !== false,
    })
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Start and end dates are required")
      return
    }
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        bannerId: form.bannerId || null,
        featuredCollectionId: form.featuredCollectionId || null,
      }
      if (editing) {
        await updateAdminCampaign(editing._id, payload)
        toast.success("Campaign updated")
      } else {
        await createAdminCampaign(payload)
        toast.success("Campaign created")
      }
      handleClose()
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error saving campaign")
    }
  }

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete campaign "${c.name}"?`)) return
    try {
      await deleteAdminCampaign(c._id)
      toast.success("Deleted")
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error deleting")
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage promotional campaigns (discounts, date range, target audience).
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add campaign
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Banner</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((c) => (
              <TableRow key={c._id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  {c.discountType === "percentage" ? `${c.discountValue}%` : `${c.discountValue} CFA`}
                </TableCell>
                <TableCell>{c.bannerId?.title || c.bannerId ? "Yes" : "-"}</TableCell>
                <TableCell>{c.featuredCollectionId?.name || c.featuredCollectionId ? "Yes" : "-"}</TableCell>
                <TableCell>{c.startDate ? new Date(c.startDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell>{c.endDate ? new Date(c.endDate).toLocaleDateString() : "-"}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={c.active ? "Yes" : "No"} color={c.active ? "success" : "default"} />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No campaigns yet.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit campaign" : "Add campaign"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <TextField label="Description" fullWidth multiline value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <TextField type="date" label="Start date" fullWidth InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <TextField type="date" label="End date" fullWidth InputLabelProps={{ shrink: true }} value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Discount type</InputLabel>
              <Select label="Discount type" value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}>
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="fixed">Fixed amount</MenuItem>
              </Select>
            </FormControl>
            <TextField type="number" label="Discount value" fullWidth value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} />
            <TextField type="number" label="Min order value" fullWidth value={form.minOrderValue} onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))} />
            <TextField type="number" label="Max discount (optional)" fullWidth value={form.maxDiscount} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value }))} />
            <FormControl fullWidth>
              <InputLabel>Target audience</InputLabel>
              <Select label="Target audience" value={form.targetAudience} onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="new">New users</MenuItem>
                <MenuItem value="returning">Returning</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Attach to banner (optional)</InputLabel>
              <Select
                label="Attach to banner (optional)"
                value={form.bannerId || ""}
                onChange={(e) => setForm((f) => ({ ...f, bannerId: e.target.value || "" }))}
              >
                <MenuItem value="">None</MenuItem>
                {banners.map((b) => (
                  <MenuItem key={b._id} value={b._id}>{b.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Attach to featured collection (optional)</InputLabel>
              <Select
                label="Attach to featured collection (optional)"
                value={form.featuredCollectionId || ""}
                onChange={(e) => setForm((f) => ({ ...f, featuredCollectionId: e.target.value || "" }))}
              >
                <MenuItem value="">None</MenuItem>
                {featuredCollections.map((fc) => (
                  <MenuItem key={fc._id} value={fc._id}>{fc.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => setForm((f) => ({ ...f, active: !f.active }))}>
              {form.active ? "Active" : "Inactive"}
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
