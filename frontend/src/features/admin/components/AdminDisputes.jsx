import React, { useEffect, useState } from "react";
import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, InputLabel, MenuItem, Select,
  Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography, Paper,
  IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { toast } from "react-toastify";
import { fetchAdminDisputes, updateAdminDispute, fetchSellerDisputes } from "../AdminApi";
import { useNavigate } from "react-router-dom";

export const AdminDisputes = ({ isSeller = false }) => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [nextStatus, setNextStatus] = useState("open");
  const [resolution, setResolution] = useState(null);
  const [notes, setNotes] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (isSeller) {
        data = await fetchSellerDisputes();
      } else {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        data = await fetchAdminDisputes(params);
      }
      setItems(data);
    } catch (e) {
      console.error(e);
      toast.error("Error loading disputes");
    } finally {
      setLoading(false);
    }
  }, [isSeller, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const openAction = (d) => {
    // Sellers always go to detail view
    // Admins go to detail view if resolved/closed, otherwise open resolve dialog
    if (isSeller || d.status === 'resolved' || d.status === 'closed') {
      const path = isSeller ? `/seller/dispute-details/${d._id}` : `/admin/dispute-details/${d._id}`;
      navigate(path);
      return;
    }
    setSelected(d);
    setNextStatus(d.status || "open");
    setResolution(d.resolution ?? null);
    setNotes(d.notes || "");
    setOrderStatus("");
    setOpen(true);
  };

  const save = async () => {
    if (!selected) return;
    try {
      const payload = { status: nextStatus, resolution, notes };
      if (orderStatus) payload.orderStatus = orderStatus;
      const updated = await updateAdminDispute(selected._id, payload);
      setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
      toast.success("Dispute updated");
      setOpen(false);
      setSelected(null);
    } catch (e) {
      console.error(e);
      toast.error("Error updating dispute");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'primary';
      case 'responded': return 'info';
      case 'escalated': return 'error';
      case 'under_review': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={2}>
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={800}>
            {isSeller ? "Store Disputes" : "System Disputes Management"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSeller
              ? "Manage and respond to resolution cases for your product sales."
              : "Monitor and mediate disputes between buyers and sellers across the platform."}
          </Typography>
        </Stack>
        <IconButton onClick={load} disabled={loading} sx={{ bgcolor: 'background.paper', border: '1px solid #eee' }}>
          <RefreshIcon />
        </IconButton>
      </Stack>

      {!isSeller && (
        <FormControl size="small" sx={{ minWidth: 200, maxWidth: 320 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select label="Filter by Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="responded">Responded</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
            <MenuItem value="under_review">Under Review</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #eee', borderRadius: 4, overflow: 'hidden' }}>
        <Table size="medium">
          <TableHead sx={{ bgcolor: '#fbfbfb' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
              {!isSeller && <TableCell sx={{ fontWeight: 'bold' }}>Parties</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>Order & Reason</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((d) => (
              <TableRow key={d._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">#{d._id.slice(-6).toUpperCase()}</Typography>
                </TableCell>
                {!isSeller && (
                  <TableCell>
                    <Typography variant="caption" display="block"><b>Buyer:</b> {d.user?.name || d.user?.email || 'N/A'}</Typography>
                    <Typography variant="caption" display="block"><b>Seller:</b> {d.seller?.name || d.seller?.email || 'N/A'}</Typography>
                  </TableCell>
                )}
                <TableCell>
                  <Typography variant="body2">Order #{d.order?._id?.slice(-8).toUpperCase() || d.order?.slice(-8).toUpperCase()}</Typography>
                  <Typography variant="caption" color="text.secondary">{d.reason}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={d.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(d.status)}
                    sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "-"}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant={isSeller || d.status === 'resolved' || d.status === 'closed' ? "outlined" : "contained"}
                    onClick={() => openAction(d)}
                    sx={{ borderRadius: 2 }}
                  >
                    {isSeller || d.status === 'resolved' || d.status === 'closed' ? "View" : "Resolve"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No disputes found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Admin Resolution Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Resolve Case #{selected?._id.slice(-6).toUpperCase()}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Update Status</InputLabel>
              <Select label="Update Status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="responded">Responded</MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Resolution Type</InputLabel>
              <Select
                label="Resolution Type"
                value={resolution ?? ""}
                onChange={(e) => setResolution(e.target.value || null)}
              >
                <MenuItem value="">None / Pending</MenuItem>
                <MenuItem value="refund">Issue Full Refund</MenuItem>
                <MenuItem value="partial_refund">Issue Partial Refund</MenuItem>
                <MenuItem value="replacement">Request Item Return</MenuItem>
                <MenuItem value="other">Other / Rejected</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Official Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Explanation of the decision..." fullWidth multiline rows={4} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save} sx={{ px: 4, borderRadius: 1.5 }}>
            Apply Resolution
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
