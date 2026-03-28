import React, { useEffect, useState } from "react"
import {
  Box,
  Button,
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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import { toast } from "react-toastify"
import { axiosi } from "../../../config/axios"
import { fetchAdminLoyalty, adminAdjustLoyalty } from "../AdminApi"

export const AdminLoyalty = () => {
  const [history, setHistory] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [delta, setDelta] = useState("")
  const [reason, setReason] = useState("admin_adjust")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      const data = await fetchAdminLoyalty()
      setHistory(data)
    } catch (e) {
      console.error(e)
      toast.error("Error loading loyalty history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    axiosi.get("/admin/users").then((r) => setUsers(Array.isArray(r.data) ? r.data : [])).catch(() => setUsers([]))
  }, [])

  const handleAdjust = async () => {
    const uid = userId
    const d = Number(delta)
    if (!uid || isNaN(d)) {
      toast.error("Select a user and enter a valid delta (e.g. 100 or -50)")
      return
    }
    try {
      setSaving(true)
      await adminAdjustLoyalty({ userId: uid, delta: d, reason })
      toast.success("Loyalty points adjusted")
      setDelta("")
      load()
    } catch (e) {
      console.error(e)
      toast.error("Error adjusting loyalty")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={600}>
            Loyalty points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View history and manually adjust user loyalty points (earn on orders, redeem as discount later).
          </Typography>
        </Stack>
        <Button startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
          Refresh
        </Button>
      </Stack>

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Adjust points
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>User</InputLabel>
            <Select label="User" value={userId} onChange={(e) => setUserId(e.target.value)}>
              <MenuItem value="">Select user</MenuItem>
              {(users || []).map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.email} {u.name ? `(${u.name})` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField size="small" label="Delta" type="number" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="e.g. 100 or -50" sx={{ width: 120 }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Reason</InputLabel>
            <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <MenuItem value="admin_adjust">Admin adjust</MenuItem>
              <MenuItem value="signup_bonus">Signup bonus</MenuItem>
              <MenuItem value="referral">Referral</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleAdjust} disabled={saving}>
            {saving ? "Saving…" : "Apply"}
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell align="right">Delta</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((h) => (
              <TableRow key={h._id} hover>
                <TableCell>{h.user?.email || h.user || "-"}</TableCell>
                <TableCell align="right">{h.delta != null ? h.delta : "-"}</TableCell>
                <TableCell>{h.reason || "-"}</TableCell>
                <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
            {!history.length && !loading && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Box py={4} textAlign="center">
                    <Typography color="text.secondary">No loyalty history yet.</Typography>
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
