import React, { useEffect, useState } from "react"
import {
  Box,
  Card,
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
  Pagination,
  alpha,
  useTheme,
  Tooltip
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { toast } from "react-toastify"
import { AdminLayout } from "../layouts/AdminLayout"
import { fetchAdminAuditLogs } from "../features/admin/AdminApi"

export const AdminAuditLogsPage = () => {
  const theme = useTheme()
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [loading, setLoading] = useState(false)
  
  const [targetTypeFilter, setTargetTypeFilter] = useState("")
  const [actionFilter, setActionFilter] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        targetType: targetTypeFilter || undefined,
        action: actionFilter || undefined
      }
      const data = await fetchAdminAuditLogs(params)
      setLogs(data.logs)
      setTotal(data.total)
    } catch (e) {
      console.error(e)
      toast.error("Error loading audit logs")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, targetTypeFilter, actionFilter])

  const getActionColor = (action) => {
    if (action.includes("DELETE")) return "error"
    if (action.includes("UPDATE")) return "info"
    if (action.includes("CREATE")) return "success"
    return "default"
  }

  return (
    <AdminLayout>
      <Stack spacing={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
              Audit Logs
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track system-wide actions for accountability and security.
            </Typography>
          </Box>
          <IconButton onClick={load} disabled={loading} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <RefreshIcon />
          </IconButton>
        </Stack>

        <Card sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderRadius: 3, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Type</InputLabel>
            <Select label="Type" value={targetTypeFilter} onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="Order">Order</MenuItem>
              <MenuItem value="Inventory">Inventory</MenuItem>
              <MenuItem value="Product">Product</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Seller">Seller</MenuItem>
              <MenuItem value="System">System</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Action</InputLabel>
            <Select label="Action" value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="UPDATE_ORDER">Order Update</MenuItem>
              <MenuItem value="UPDATE_INVENTORY">Inventory Update</MenuItem>
              <MenuItem value="CREATE_PRODUCT">Product Creation</MenuItem>
              <MenuItem value="DELETE_PRODUCT">Product Deletion</MenuItem>
            </Select>
          </FormControl>
        </Card>

        <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Typography variant="body2">{new Date(log.createdAt).toLocaleDateString()}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(log.createdAt).toLocaleTimeString()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{log.user?.name || "System"}</Typography>
                    <Chip size="tiny" label={log.user?.role?.toUpperCase()} sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={log.action} 
                      color={getActionColor(log.action)} 
                      variant="outlined" 
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{log.targetType}</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>#{String(log.targetId).slice(-8).toUpperCase()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 300 }}>
                      {log.description}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {log.details ? (
                      <Tooltip title={JSON.stringify(log.details, null, 2)} arrow>
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {!logs.length && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Box py={10}>
                      <Typography color="text.secondary" fontWeight={600}>No logs found matching filters.</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={Math.ceil(total / limit)} 
            page={page} 
            onChange={(e, v) => setPage(v)} 
            color="primary" 
            shape="rounded"
          />
        </Box>
      </Stack>
    </AdminLayout>
  )
}
