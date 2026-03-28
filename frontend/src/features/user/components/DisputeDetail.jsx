import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, Stack, TextField, Button,
    Divider, Chip, Avatar, IconButton, Grid, CircularProgress
} from '@mui/material';
import {
    Send as SendIcon,
    EscalateIcon, // Need to find a good icon or use a generic one
    Gavel as AdminIcon,
    Store as SellerIcon,
    Person as BuyerIcon,
    ArrowBack as BackIcon,
    AttachFile as FileIcon
} from '@mui/icons-material';
import EscalatorWarningIcon from '@mui/icons-material/EscalatorWarning';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosi } from '../../../config/axios';
import { addDisputeMessage, escalateDispute, updateAdminDispute } from '../../admin/AdminApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectLoggedInUser } from '../../auth/AuthSlice';

export const DisputeDetail = ({ isSeller = false, isAdmin = false }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectLoggedInUser);
    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    const fetchDispute = async () => {
        try {
            // Depending on role, the endpoint might differ or be same with auth check
            const res = await axiosi.get(`/disputes/admin/${id}`); // Generic admin-like view if authorized
            setDispute(res.data);
        } catch (error) {
            // If admin fetch fails, try user fetch
            try {
                const res = await axiosi.get(`/disputes/me`);
                const found = res.data.find(d => d._id === id);
                if (found) setDispute(found);
                else throw new Error("Not found");
            } catch (inner) {
                toast.error("Error fetching dispute details");
                navigate(-1);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDispute();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [dispute?.messages]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            const res = await addDisputeMessage(id, { body: message.trim() }, isSeller);
            setDispute(res);
            setMessage('');
        } catch (error) {
            toast.error("Error sending message");
        } finally {
            setSending(false);
        }
    };

    const handleEscalate = async () => {
        if (!window.confirm("Are you sure you want to escalate this to Admin?")) return;
        try {
            const res = await escalateDispute(id);
            setDispute(res);
            toast.success("Dispute escalated to Admin");
        } catch (error) {
            toast.error("Error escalating dispute");
        }
    };

    const handleAdminAction = async (action, resolution = null) => {
        try {
            const payload = { status: action };
            if (resolution) payload.resolution = resolution;
            const res = await updateAdminDispute(id, payload);
            setDispute(res);
            toast.success(`Dispute ${action === 'resolved' ? 'Resolved' : 'Updated'}`);
        } catch (error) {
            toast.error("Error performing admin action");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
    if (!dispute) return <Typography>Dispute not found</Typography>;

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
            <Button startIcon={<BackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

            <Grid container spacing={3}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ border: '1px solid #eee', borderRadius: 4, height: '70vh', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Dispute Case #{dispute._id.slice(-6).toUpperCase()}</Typography>
                                <Typography variant="caption" color="text.secondary">Order #{dispute.order?._id.slice(-8).toUpperCase()}</Typography>
                            </Box>
                            <Chip label={dispute.status.replace('_', ' ').toUpperCase()} color={getStatusColor(dispute.status)} size="small" sx={{ fontWeight: 'bold' }} />
                        </Box>

                        {/* Messages Area */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#fbfbfb' }}>
                            <Stack spacing={3}>
                                {dispute.messages.map((msg, i) => {
                                    const isMe = String(msg.sender?._id || msg.sender) === String(loggedInUser?._id);
                                    return (
                                        <Box key={i} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                            <Stack direction={isMe ? 'row-reverse' : 'row'} spacing={1} alignItems="flex-end">
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: msg.role === 'admin' ? 'error.main' : msg.role === 'seller' ? 'primary.main' : 'secondary.main' }}>
                                                    {msg.role === 'admin' ? <AdminIcon fontSize="small" /> : msg.role === 'seller' ? <SellerIcon fontSize="small" /> : <BuyerIcon fontSize="small" />}
                                                </Avatar>
                                                <Paper elevation={0} sx={{
                                                    p: 2,
                                                    borderRadius: 3,
                                                    border: '1px solid #eee',
                                                    bgcolor: isMe ? 'primary.main' : '#fff',
                                                    color: isMe ? '#fff' : 'inherit'
                                                }}>
                                                    <Typography variant="body2">{msg.body}</Typography>
                                                    {msg.attachments?.length > 0 && (
                                                        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                            {msg.attachments.map((url, j) => (
                                                                <Box key={j} component="img" src={url} sx={{ width: 100, height: 100, borderRadius: 1, objectFit: 'cover', cursor: 'pointer' }} />
                                                            ))}
                                                        </Stack>
                                                    )}
                                                </Paper>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: isMe ? 'right' : 'left' }}>
                                                {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </Stack>
                        </Box>

                        {/* Input Area */}
                        {dispute.status !== 'resolved' && dispute.status !== 'closed' && (
                            <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        fullWidth
                                        placeholder="Type your response..."
                                        size="small"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={sending}
                                    />
                                    <IconButton color="primary" onClick={() => {
                                        toast.info("Image attachment feature coming soon");
                                    }}>
                                        <FileIcon />
                                    </IconButton>
                                    <Button variant="contained" endIcon={<SendIcon />} onClick={handleSendMessage} disabled={sending || !message.trim()}>
                                        Send
                                    </Button>
                                </Stack>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Sidebar Info */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Dispute Info</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Reason</Typography>
                                    <Typography variant="body2" fontWeight={600}>{dispute.reason}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Created On</Typography>
                                    <Typography variant="body2">{format(new Date(dispute.createdAt), 'MMMM d, yyyy')}</Typography>
                                </Box>
                            </Stack>

                            {/* Actions */}
                            <Box sx={{ mt: 4 }}>
                                {!isSeller && !isAdmin && dispute.status === 'responded' && (
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        startIcon={<EscalatorWarningIcon />}
                                        onClick={handleEscalate}
                                        sx={{ mb: 1, borderRadius: 2 }}
                                    >
                                        Escalate to Admin
                                    </Button>
                                )}

                                {isAdmin && dispute.status !== 'resolved' && (
                                    <Stack spacing={1}>
                                        <Button fullWidth variant="contained" color="success" onClick={() => handleAdminAction('resolved', 'refund')}>Force Refund</Button>
                                        <Button fullWidth variant="outlined" color="primary" onClick={() => handleAdminAction('resolved', 'replacement')}>Force Return</Button>
                                        <Button fullWidth variant="contained" color="error" onClick={() => handleAdminAction('resolved', 'other')}>Reject Claim</Button>
                                    </Stack>
                                )}
                            </Box>
                        </Paper>

                        <Paper elevation={0} sx={{ p: 3, border: '1px solid #eee', borderRadius: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Participants</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}><BuyerIcon /></Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Buyer</Typography>
                                        <Typography variant="caption">{dispute.user?.name || 'Customer'}</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: 'primary.main' }}><SellerIcon /></Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Seller</Typography>
                                        <Typography variant="caption">{dispute.seller?.name || 'Merchant'}</Typography>
                                    </Box>
                                </Stack>
                                {dispute.status === 'escalated' || dispute.status === 'under_review' || isAdmin ? (
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ bgcolor: 'error.main' }}><AdminIcon /></Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Platform Admin</Typography>
                                            <Typography variant="caption">Reviewing Case</Typography>
                                        </Box>
                                    </Stack>
                                ) : null}
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};
