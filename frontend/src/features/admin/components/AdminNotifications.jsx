import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
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
import DeleteIcon from "@mui/icons-material/Delete"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import {
  fetchAdminNotifications,
  createAdminNotification,
  deleteAdminNotification,
} from "../AdminApi"

export const AdminNotifications = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [targets, setTargets] = useState("all")

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminNotifications()
      setItems(data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setTitle("")
    setBody("")
    setTargets("all")
    setOpen(true)
  }

  const handleClose = () => setOpen(false)

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    try {
      await createAdminNotification({ title: title.trim(), body: body.trim() || undefined, targets })
      toast.success("Notification created")
      handleClose()
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error creating notification")
    }
  }

  const handleDelete = async (n) => {
    if (!window.confirm("Delete this notification?")) return
    try {
      await deleteAdminNotification(n._id)
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
          <Typography variant="h5" fontWeight={600}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">
            Create in-app notifications. Integrate with push provider later.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <IconButton onClick={load} disabled={loading}><RefreshIcon /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Create notification</Button>
        </Stack>
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Body</TableCell>
              <TableCell>Targets</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((n) => (
              <TableRow key={n._id} hover>
                <TableCell>{n.title}</TableCell>
                <TableCell sx={{ maxWidth: 200 }}>{n.body || "-"}</TableCell>
                <TableCell>{n.targets || "all"}</TableCell>
                <TableCell>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "-"}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => handleDelete(n)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!items.length && !loading && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Box py={4} textAlign="center"><Typography color="text.secondary">No notifications yet.</Typography></Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create notification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Title" fullWidth value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextField label="Body" fullWidth multiline rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel>Targets</InputLabel>
              <Select label="Targets" value={targets} onChange={(e) => setTargets(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="buyers">Buyers</MenuItem>
                <MenuItem value="sellers">Sellers</MenuItem>
                <MenuItem value="admins">Admins</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
