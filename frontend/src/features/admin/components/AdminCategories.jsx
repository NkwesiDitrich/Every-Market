import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
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
import {
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
} from "../AdminApi"

export const AdminCategories = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [name, setName] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminCategories()
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading categories")
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
    setOpen(true)
  }

  const openEdit = (cat) => {
    setEditing(cat)
    setName(cat.name || "")
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setEditing(null)
    setName("")
  }

  const handleSave = async () => {
    const trimmed = String(name || "").trim()
    if (!trimmed) {
      toast.error("Name is required")
      return
    }
    try {
      if (editing) {
        await updateAdminCategory(editing._id, { name: trimmed })
        toast.success("Category updated")
      } else {
        await createAdminCategory({ name: trimmed })
        toast.success("Category created")
      }
      handleClose()
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error saving category")
    }
  }

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return
    try {
      await deleteAdminCategory(cat._id)
      toast.success("Category deleted")
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error deleting category")
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage product categories for the catalog.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add category
          </Button>
        </Stack>
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((cat) => (
              <TableRow key={cat._id} hover>
                <TableCell>{cat.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(cat)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(cat)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No categories yet.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
