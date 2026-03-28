import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Typography, Box,
    Stack, IconButton, Alert
} from '@mui/material';
import { CloudUpload as UploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { createDispute } from '../../admin/AdminApi';
import { toast } from 'react-toastify';

const DISPUTE_REASONS = [
    "Item not received",
    "Wrong item",
    "Damaged product",
    "Seller unresponsive",
    "Refund issue",
    "Other"
];

export const DisputeForm = ({ open, onClose, orderId, itemIndex, itemTitle }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [evidenceUrls, setEvidenceUrls] = useState([]); // In a real app, this would be file uploads

    const handleSubmit = async () => {
        if (!reason || !description.trim()) {
            toast.error("Please provide a reason and description");
            return;
        }

        setLoading(true);
        try {
            await createDispute({
                orderId,
                itemIndex,
                reason,
                description: description.trim(),
                evidence: evidenceUrls
            });
            toast.success("Dispute opened successfully");
            onClose(true); // pass true to indicate success
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error opening dispute");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => !loading && onClose()} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Open Dispute
                <IconButton onClick={() => onClose()} disabled={loading}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                            Item
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>{itemTitle}</Typography>
                    </Box>

                    <TextField
                        select
                        label="Reason for dispute"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth
                    >
                        {DISPUTE_REASONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Detailed Description"
                        multiline
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Explain exactly what happened..."
                        fullWidth
                        helperText="Provide as much detail as possible to help the seller and admin understand the issue."
                    />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">Evidence (Optional)</Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Uploading images or videos of the item significantly speeds up the resolution.
                        </Alert>
                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<UploadIcon />}
                            sx={{ borderRadius: 2 }}
                        >
                            Upload Evidence
                            <input
                                type="file"
                                hidden
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => {
                                    // Simulated upload
                                    toast.info("File upload simulated. In a real app, files would be sent to S3/Cloudinary.");
                                    setEvidenceUrls([...evidenceUrls, "https://via.placeholder.com/150"]);
                                }}
                            />
                        </Button>

                        {evidenceUrls.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
                                {evidenceUrls.map((url, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: 60, height: 60, borderRadius: 1,
                                            bgcolor: '#eee', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            position: 'relative'
                                        }}
                                    >
                                        <Box component="img" src={url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2, px: 3 }}>
                <Button onClick={() => onClose()} color="inherit" disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    loading={loading}
                    disabled={loading}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    Submit Dispute
                </Button>
            </DialogActions>
        </Dialog>
    );
};
