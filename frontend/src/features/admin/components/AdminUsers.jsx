import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Box, Card, CardContent, Chip, FormControl, InputLabel, MenuItem,
  Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Typography, Paper, IconButton, Tooltip, Avatar,
  alpha, useTheme, InputBase, LinearProgress, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material"
import CheckIcon from "@mui/icons-material/Check"
import BlockIcon from "@mui/icons-material/Block"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"
import CampaignIcon from "@mui/icons-material/Campaign"
import StorefrontIcon from "@mui/icons-material/Storefront"
import PersonIcon from "@mui/icons-material/Person"
import RefreshIcon from "@mui/icons-material/Refresh"
import SearchIcon from "@mui/icons-material/Search"
import CloseIcon from "@mui/icons-material/Close"
import { toast } from "react-toastify"
import { fetchAdminUsers, updateAdminUser } from "../AdminApi"

const roleOptions = ["buyer", "seller", "admin", "support", "marketing"]

const ROLE_CONFIG = {
  admin: { color: '#ef4444', bg: '#fee2e2', icon: <AdminPanelSettingsIcon sx={{ fontSize: '0.85rem' }} /> },
  seller: { color: '#8b5cf6', bg: '#ede9fe', icon: <StorefrontIcon sx={{ fontSize: '0.85rem' }} /> },
  support: { color: '#3b82f6', bg: '#dbeafe', icon: <SupportAgentIcon sx={{ fontSize: '0.85rem' }} /> },
  marketing: { color: '#f59e0b', bg: '#fef3c7', icon: <CampaignIcon sx={{ fontSize: '0.85rem' }} /> },
  buyer: { color: '#6b7280', bg: '#f3f4f6', icon: <PersonIcon sx={{ fontSize: '0.85rem' }} /> },
}

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.buyer
  return (
    <Chip
      icon={React.cloneElement(cfg.icon, { style: { color: cfg.color } })}
      label={role}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.72rem', '.MuiChip-icon': { ml: 0.5 } }}
    />
  )
}

export const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [roleFilter, setRoleFilter] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("")
  const [bannedFilter, setBannedFilter] = useState("")
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const accentColor = isDark ? '#818cf8' : '#6366f1'

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = {}
      if (roleFilter) params.role = roleFilter
      if (verifiedFilter) params.isVerified = verifiedFilter === "true"
      if (bannedFilter) params.isBanned = bannedFilter === "true"
      const data = await fetchAdminUsers(params)
      setUsers(data)
    } catch (err) {
      toast.error("Error loading users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  const handleRoleChange = async (id, role) => {
    try {
      const updated = await updateAdminUser(id, { role })
      setUsers(prev => prev.map(u => u._id === id ? updated : u))
      if (selectedUser?._id === id) setSelectedUser(updated)
      toast.success("Role updated")
    } catch { toast.error("Error updating role") }
  }

  const handleToggleBan = async (id, current) => {
    try {
      const updated = await updateAdminUser(id, { isBanned: !current })
      setUsers(prev => prev.map(u => u._id === id ? updated : u))
      if (selectedUser?._id === id) setSelectedUser(updated)
      toast.success(!current ? "User banned" : "User unbanned")
    } catch { toast.error("Error updating ban state") }
  }

  const handleToggleVerified = async (id, current) => {
    try {
      const updated = await updateAdminUser(id, { isVerified: !current })
      setUsers(prev => prev.map(u => u._id === id ? updated : u))
      if (selectedUser?._id === id) setSelectedUser(updated)
      toast.success(!current ? "User verified" : "User unverified")
    } catch { toast.error("Error updating verification") }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.email?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
  })

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isVerified).length,
    banned: users.filter(u => u.isBanned).length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Stack>
          <Typography variant="h5" fontWeight={700}>Users</Typography>
          <Typography variant="body2" color="text.secondary">Manage roles, verification, and bans across the platform.</Typography>
        </Stack>
        <Tooltip title="Refresh">
          <IconButton onClick={loadUsers} disabled={loading} size="small"><RefreshIcon /></IconButton>
        </Tooltip>
      </Stack>

      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}

      {/* Stats */}
      <Stack direction="row" flexWrap="wrap" gap={2}>
        {[
          { label: 'Total Users', value: stats.total, color: accentColor },
          { label: 'Verified', value: stats.verified, color: '#10b981' },
          { label: 'Banned', value: stats.banned, color: '#ef4444' },
          { label: 'Admins', value: stats.admins, color: '#f59e0b' },
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

      {/* Filters */}
      <Stack direction="row" spacing={2} flexWrap="wrap" rowGap={1.5} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'action.hover', borderRadius: 2, px: 2, py: 0.5, minWidth: 220 }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1rem' }} />
          <InputBase placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} sx={{ fontSize: '0.875rem', flex: 1 }} />
        </Box>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} onClose={loadUsers}>
            <MenuItem value="">All Roles</MenuItem>
            {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Verified</InputLabel>
          <Select label="Verified" value={verifiedFilter} onChange={e => setVerifiedFilter(e.target.value)} onClose={loadUsers}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="true">Verified</MenuItem>
            <MenuItem value="false">Unverified</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={bannedFilter} onChange={e => setBannedFilter(e.target.value)} onClose={loadUsers}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="false">Active</MenuItem>
            <MenuItem value="true">Banned</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Table */}
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', bgcolor: alpha(accentColor, 0.04), py: 1.25 } }}>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="center">Verified</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(user => (
                <TableRow key={user._id} hover sx={{ '& td': { py: 0.9 }, cursor: 'pointer' }} onClick={() => setSelectedUser(user)}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(accentColor, 0.15), color: accentColor, fontSize: '0.8rem' }}>
                        {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Stack>
                        <Typography variant="body2" fontWeight={500}>{user.name || '—'}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                      <Select value={user.role || "buyer"} onChange={e => handleRoleChange(user._id, e.target.value)}
                        disableUnderline sx={{ fontSize: '0.875rem' }}>
                        {roleOptions.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={user.isVerified ? "Verified" : "Unverified"}
                      color={user.isVerified ? "success" : "default"}
                      variant={user.isVerified ? "filled" : "outlined"}
                      sx={{ fontSize: '0.72rem', fontWeight: 600 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip size="small" label={user.isBanned ? "Banned" : "Active"}
                      sx={{
                        bgcolor: user.isBanned ? '#fee2e2' : '#d1fae5',
                        color: user.isBanned ? '#991b1b' : '#065f46',
                        fontWeight: 600, fontSize: '0.72rem'
                      }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" onClick={e => e.stopPropagation()}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title={user.isVerified ? "Revoke verification" : "Mark verified"}>
                        <IconButton size="small" color={user.isVerified ? "success" : "default"}
                          onClick={() => handleToggleVerified(user._id, user.isVerified)}>
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isBanned ? "Unban user" : "Ban user"}>
                        <IconButton size="small" color={user.isBanned ? "success" : "error"}
                          onClick={() => handleToggleBan(user._id, user.isBanned)}>
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && !loading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box py={4} textAlign="center">
                      <Typography color="text.secondary">No users match the current filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          User Profile
          <IconButton onClick={() => setSelectedUser(null)} size="small" sx={{ position: 'absolute', right: 12, top: 12 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} mt={1} alignItems="center">
              <Avatar sx={{ width: 64, height: 64, bgcolor: alpha(accentColor, 0.15), color: accentColor, fontSize: '1.5rem' }}>
                {selectedUser.name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Stack alignItems="center" spacing={0.25}>
                <Typography fontWeight={700}>{selectedUser.name || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">{selectedUser.email}</Typography>
                <RoleBadge role={selectedUser.role || 'buyer'} />
              </Stack>
              <Divider sx={{ width: '100%' }} />
              <Stack width="100%" spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Verified</Typography>
                  <Chip label={selectedUser.isVerified ? 'Yes' : 'No'} size="small" color={selectedUser.isVerified ? 'success' : 'default'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Banned</Typography>
                  <Chip label={selectedUser.isBanned ? 'Yes' : 'No'} size="small" color={selectedUser.isBanned ? 'error' : 'success'} />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Joined</Typography>
                  <Typography variant="body2">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}</Typography>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1} width="100%" pt={1}>
                <Button fullWidth variant={selectedUser.isVerified ? 'outlined' : 'contained'} color="success" size="small"
                  onClick={() => handleToggleVerified(selectedUser._id, selectedUser.isVerified)}>
                  {selectedUser.isVerified ? 'Revoke Verification' : 'Verify'}
                </Button>
                <Button fullWidth variant={selectedUser.isBanned ? 'outlined' : 'contained'} color="error" size="small"
                  onClick={() => handleToggleBan(selectedUser._id, selectedUser.isBanned)}>
                  {selectedUser.isBanned ? 'Unban' : 'Ban'}
                </Button>
              </Stack>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  )
}
