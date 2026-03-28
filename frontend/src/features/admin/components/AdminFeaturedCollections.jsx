import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { axiosi } from "../../../config/axios"
import {
  fetchAdminFeaturedCollections,
  createAdminFeaturedCollection,
  updateAdminFeaturedCollection,
  deleteAdminFeaturedCollection,
} from "../AdminApi"

export const AdminFeaturedCollections = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [priority, setPriority] = useState(0)
  const [active, setActive] = useState(true)
  const [productIds, setProductIds] = useState([])
  const [categoryIds, setCategoryIds] = useState([])

  const load = async () => {
    try {
      setLoading(true)
      const [cols] = await Promise.all([
        fetchAdminFeaturedCollections(),
        axiosi.get("/products", { params: { limit: 500, page: 1 } }).then((r) => r.data),
        axiosi.get("/categories").then((r) => r.data),
      ])
      setItems(cols)
    } catch (e) {
      console.error(e)
      toast.error("Error loading featured collections")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setSlug("")
    setPriority(0)
    setActive(true)
    setProductIds([])
    setCategoryIds([])
    setOpen(true)
  }

  const openEdit = (fc) => {
    setEditing(fc)
    setName(fc.name || "")
    setSlug(fc.slug || "")
    setPriority(fc.priority ?? 0)
    setActive(fc.active !== false)
    setProductIds((fc.productIds || []).map((p) => (typeof p === "object" ? p._id : p)))
    setCategoryIds((fc.categoryIds || []).map((c) => (typeof c === "object" ? c._id : c)))
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleSave = async () => {
    const trimmedName = String(name || "").trim()
    if (!trimmedName) {
      toast.error("Name is required")
      return
    }
    try {
      const payload = {
        name: trimmedName,
        slug: String(slug || "").trim() || undefined,
        priority: Number(priority) || 0,
        active,
        productIds: productIds.filter(Boolean),
        categoryIds: categoryIds.filter(Boolean),
      }
      if (editing) {
        await updateAdminFeaturedCollection(editing._id, payload)
        toast.success("Featured collection updated")
      } else {
        await createAdminFeaturedCollection(payload)
        toast.success("Featured collection created")
      }
      handleClose()
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error saving featured collection")
    }
  }

  const handleDelete = async (fc) => {
    if (!window.confirm(`Delete "${fc.name}"?`)) return
    try {
      await deleteAdminFeaturedCollection(fc._id)
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
            Featured collections
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Curate product lists and categories for homepage sections (e.g. &quot;Top in Electronics&quot;).
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add collection
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell align="center">Priority</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((fc) => (
              <TableRow key={fc._id} hover>
                <TableCell>{fc.name}</TableCell>
                <TableCell>{fc.slug || "-"}</TableCell>
                <TableCell align="center">{fc.priority ?? 0}</TableCell>
                <TableCell align="center">{fc.active !== false ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(fc)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(fc)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No featured collections yet.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit featured collection" : "Add featured collection"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField label="Slug" fullWidth value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. top-electronics" />
            <TextField type="number" label="Priority" fullWidth value={priority} onChange={(e) => setPriority(e.target.value)} />
            <FormControlLabel control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />} label="Active" />
            <Typography variant="body2" color="text.secondary">
              Product and category IDs can be set via API or future UI. This form saves name, slug, priority, and active.
            </Typography>
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
