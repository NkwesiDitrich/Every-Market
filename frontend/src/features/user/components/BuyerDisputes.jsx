import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Stack, Grid,
    Chip, Button, IconButton, CircularProgress, Divider
} from '@mui/material';
import {
    ArrowForwardIos as ArrowIcon,
    Refresh as RefreshIcon,
    Gavel as DisputeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { axiosi } from '../../../config/axios';
import { format } from 'date-fns';

export const BuyerDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const res = await axiosi.get("/disputes/me");
            setDisputes(res.data);
        } catch (error) {
            console.error("Error fetching disputes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

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
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DisputeIcon fontSize="large" color="primary" /> My Disputes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">Resolution cases for your orders</Typography>
                </Box>
                <IconButton onClick={fetchDisputes} disabled={loading}><RefreshIcon /></IconButton>
            </Stack>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>
            ) : disputes.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, bgcolor: '#fafafa' }}>
                    <Typography variant="h6" color="text.secondary">No disputes found</Typography>
                    <Typography variant="body2" color="text.secondary">If you have an issue with an order, go to your order history to report it.</Typography>
                </Paper>
            ) : (
                <Stack spacing={2}>
                    {disputes.map((dispute) => (
                        <Paper
                            key={dispute._id}
                            elevation={0}
                            sx={{
                                p: 3, borderRadius: 4, border: '1px solid #eee',
                                cursor: 'pointer', transition: '0.2s',
                                '&:hover': { bgcolor: '#fbfbfb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            }}
                            onClick={() => navigate(`/dispute-details/${dispute._id}`)}
                        >
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">#{dispute._id.slice(-6).toUpperCase()}</Typography>
                                            <Typography variant="body2" color="text.secondary">{dispute.reason}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Order #{dispute.order?._id.slice(-8).toUpperCase()} • {format(new Date(dispute.createdAt), 'MMM d, yyyy')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Stack direction="row" spacing={1} justifyContent={{ sm: 'flex-end' }} alignItems="center">
                                        <Chip
                                            label={dispute.status.replace('_', ' ').toUpperCase()}
                                            color={getStatusColor(dispute.status)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        <ArrowIcon fontSize="small" color="disabled" />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Paper>
                    ))}
                </Stack>
            )}
        </Box>
    );
};
