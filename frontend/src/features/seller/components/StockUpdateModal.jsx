import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, Typography, Box,
    FormControl, InputLabel, Select, MenuItem,
    ToggleButton, ToggleButtonGroup, Divider, Chip,
    Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Grid,
    IconButton, alpha, useTheme
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateInventoryAsync, fetchInventoryHistoryAsync, selectInventoryHistory, selectInventoryHistoryStatus } from '../SellerSlice';
import { toast } from 'react-toastify';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

export const StockUpdateModal = ({ open, onClose, product }) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const history = useSelector(selectInventoryHistory);
    const historyStatus = useSelector(selectInventoryHistoryStatus);

    const [mode, setMode] = useState('relative'); // 'relative' (+X) or 'absolute' (=Y)
    const [delta, setDelta] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState('restock');
    const [showHistory, setShowHistory] = useState(false);

    if (!product) return null;

    const handleUpdate = async () => {
        const val = Number(delta);
        if (isNaN(val)) {
            toast.error("Please enter a valid number");
            return;
        }

        const payload = {
            delta: val,
            isAbsolute: mode === 'absolute',
            type,
            note: note || (mode === 'relative' ? `Restocked by ${val}` : `Stock set to ${val}`)
        };

        try {
            await dispatch(updateInventoryAsync({ productId: product._id, payload })).unwrap();
            toast.success("Stock updated successfully");
            onClose();
            // Reset fields
            setDelta('');
            setNote('');
        } catch (error) {
            toast.error(error.message || "Failed to update stock");
        }
    };

    const toggleHistory = () => {
        if (!showHistory) {
            dispatch(fetchInventoryHistoryAsync(product._id));
        }
        setShowHistory(!showHistory);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={showHistory ? 'md' : 'sm'} PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" fontWeight={800}>Update Inventory</Typography>
                    <Typography variant="caption" color="text.secondary">{product.title}</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={showHistory ? 4 : 0}>
                    <Grid item xs={12} md={showHistory ? 5 : 12}>
                        <Stack spacing={3}>
                            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 3 }}>
                                <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>Current Stock</Typography>
                                <Typography variant="h4" fontWeight={900}>{product.stockQuantity} Units</Typography>
                                <Chip 
                                    label={product.stockStatus?.replace('_', ' ').toUpperCase() || 'IN STOCK'} 
                                    size="small" 
                                    color={product.stockQuantity <= 0 ? 'error' : product.stockQuantity <= (product.lowStockThreshold || 5) ? 'warning' : 'success'}
                                    sx={{ mt: 1, fontWeight: 700 }}
                                />
                            </Box>

                            <Box>
                                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 700 }}>Update Mode</Typography>
                                <ToggleButtonGroup
                                    value={mode}
                                    exclusive
                                    onChange={(e, next) => next && setMode(next)}
                                    fullWidth
                                    size="small"
                                >
                                    <ToggleButton value="relative" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                        <AddIcon sx={{ mr: 1, fontSize: 18 }} /> Add Quantity (+X)
                                    </ToggleButton>
                                    <ToggleButton value="absolute" sx={{ textTransform: 'none', fontWeight: 600 }}>
                                        <EditIcon sx={{ mr: 1, fontSize: 18 }} /> Set Absolute (=Y)
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <TextField
                                fullWidth
                                label={mode === 'relative' ? "Quantity to Add" : "New Total Quantity"}
                                type="number"
                                value={delta}
                                onChange={(e) => setDelta(e.target.value)}
                                placeholder={mode === 'relative' ? "e.g. 50" : "e.g. 100"}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Update Reason</InputLabel>
                                <Select value={type} label="Update Reason" onChange={(e) => setType(e.target.value)}>
                                    <MenuItem value="restock">Restock (receiving stock)</MenuItem>
                                    <MenuItem value="adjustment">Inventory Adjustment</MenuItem>
                                    <MenuItem value="return">Returned Items</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Note (Optional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Ship-001 received from supplier"
                            />

                            <Button 
                                startIcon={<HistoryIcon />} 
                                color="inherit" 
                                onClick={toggleHistory}
                                sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                            >
                                {showHistory ? "Hide History" : "View Inventory Log"}
                            </Button>
                        </Stack>
                    </Grid>

                    {showHistory && (
                        <Grid item xs={12} md={7}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>Inventory Log</Typography>
                            {historyStatus === 'pending' ? (
                                <Typography variant="body2" color="text.secondary">Loading log...</Typography>
                            ) : history.length > 0 ? (
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table size="small" stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Change</TableCell>
                                                <TableCell sx={{ fontWeight: 700 }}>Final</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {history.map((h) => (
                                                <TableRow key={h._id}>
                                                    <TableCell sx={{ fontSize: '0.75rem' }}>
                                                        {new Date(h.createdAt).toLocaleDateString()}<br/>
                                                        {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-numeric', minute: '2-numeric' })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={h.type.toUpperCase()} 
                                                            size="small" 
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.6rem', height: 20 }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, color: h.delta > 0 ? 'success.main' : 'error.main' }}>
                                                        {h.delta > 0 ? `+${h.delta}` : h.delta}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>{h.newStock}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                                    <Typography variant="body2" color="text.secondary">No history records found.</Typography>
                                </Box>
                            )}
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={handleUpdate} 
                    disabled={!delta}
                    sx={{ px: 4, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    Save Stock Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};
