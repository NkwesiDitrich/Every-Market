import React, { useEffect, useState, useRef } from 'react';
import {
    Box, Grid, Paper, Typography, List, ListItem, ListItemAvatar,
    Avatar, ListItemText, Divider, TextField, IconButton,
    Stack, Chip, Badge, useTheme, useMediaQuery, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Send as SendIcon,
    MoreVert as MoreIcon,
    ArrowBack as BackIcon,
    Person as PersonIcon,
    Store as StoreIcon,
    Inventory as ProductIcon,
    ShoppingCart as OrderIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchConversationsAsync,
    fetchMessagesAsync,
    sendMessageAsync,
    selectConversations,
    selectMessages,
    selectMessagingStatus,
    clearMessages
} from '../MessagingSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { formatDistanceToNow } from 'date-fns';

export const Inbox = ({ role = 'buyer' }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const loggedInUser = useSelector(selectLoggedInUser);
    const conversations = useSelector(selectConversations);
    const messages = useSelector(selectMessages);
    const status = useSelector(selectMessagingStatus);

    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isListView, setIsListView] = useState(true);

    const scrollRef = useRef(null);

    useEffect(() => {
        dispatch(fetchConversationsAsync(role));
    }, [dispatch, role]);

    useEffect(() => {
        if (selectedConvId) {
            dispatch(fetchMessagesAsync({ conversationId: selectedConvId, role }));
        }
        return () => dispatch(clearMessages());
    }, [dispatch, selectedConvId, role]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!messageInput.trim() || !selectedConvId) return;
        dispatch(sendMessageAsync({ conversationId: selectedConvId, body: messageInput, role }));
        setMessageInput('');
    };

    const handleSelectConv = (id) => {
        setSelectedConvId(id);
        if (isMobile) setIsListView(false);
    };

    const selectedConv = conversations.find(c => c._id === selectedConvId);
    const otherParty = role === 'seller' ? selectedConv?.buyer : selectedConv?.seller;

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', bgcolor: 'background.default', borderRadius: 4, overflow: 'hidden', boxShadow: 3 }}>
            <Grid container sx={{ height: '100%' }}>
                {/* Conversations List */}
                {(isListView || !isMobile) && (
                    <Grid item xs={12} md={4} sx={{ height: '100%', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="h6" fontWeight="bold">Messages</Typography>
                        </Box>
                        <List sx={{ overflowY: 'auto', height: 'calc(100% - 65px)' }}>
                            {conversations.length === 0 ? (
                                <Box sx={{ p: 3, textAlign: 'center', opacity: 0.5 }}>
                                    <Typography variant="body2">No conversations yet.</Typography>
                                </Box>
                            ) : (
                                conversations.map((conv) => {
                                    const party = role === 'seller' ? conv.buyer : conv.seller;
                                    return (
                                        <ListItem
                                            button
                                            key={conv._id}
                                            selected={selectedConvId === conv._id}
                                            onClick={() => handleSelectConv(conv._id)}
                                            sx={{ borderRadius: 0 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    {role === 'seller' ? <PersonIcon /> : <StoreIcon />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={<Typography variant="body2" fontWeight="bold">{party?.name}</Typography>}
                                                secondary={
                                                    <Typography variant="caption" noWrap sx={{ display: 'block' }}>
                                                        {conv.lastMessage?.body || 'Start a conversation'}
                                                    </Typography>
                                                }
                                            />
                                            {conv.updatedAt && (
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: false })}
                                                </Typography>
                                            )}
                                        </ListItem>
                                    );
                                })
                            )}
                        </List>
                    </Grid>
                )}

                {/* Chat Window */}
                {(!isListView || !isMobile) && (
                    <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {!selectedConvId ? (
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
                                <Typography color="text.secondary">Select a conversation to start messaging</Typography>
                            </Box>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                                    {isMobile && (
                                        <IconButton onClick={() => setIsListView(true)} sx={{ mr: 1 }}>
                                            <BackIcon />
                                        </IconButton>
                                    )}
                                    <Avatar sx={{ mr: 2 }}>{role === 'seller' ? <PersonIcon /> : <StoreIcon />}</Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body1" fontWeight="bold">{otherParty?.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{otherParty?.email}</Typography>
                                    </Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        {selectedConv?.product && (
                                            <Chip
                                                avatar={<Avatar src={selectedConv.product.thumbnail} />}
                                                label={selectedConv.product.title}
                                                size="small"
                                                variant="outlined"
                                                onClick={() => navigate(`/product-details/${selectedConv.product._id}`)}
                                                sx={{ maxWidth: 150 }}
                                            />
                                        )}
                                        {selectedConv?.order && (
                                            <Chip
                                                icon={<OrderIcon fontSize="small" />}
                                                label={`Order #${selectedConv.order._id?.toString().slice(-6).toUpperCase()}`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                onClick={() => navigate(role === 'seller' ? '/seller/orders' : '/orders')}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                {/* Messages Area */}
                                <Box
                                    ref={scrollRef}
                                    sx={{ flex: 1, overflowY: 'auto', p: 3, bgcolor: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: 2 }}
                                >
                                    {messages.map((msg) => {
                                        const isMe = String(msg.sender?._id || msg.sender) === String(loggedInUser?._id);
                                        return (
                                            <Box key={msg._id} sx={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                                <Paper sx={{
                                                    p: 1.5,
                                                    bgcolor: isMe ? 'primary.main' : 'background.paper',
                                                    color: isMe ? 'white' : 'text.primary',
                                                    borderRadius: isMe ? '20px 20px 0 20px' : '20px 20px 20px 0'
                                                }}>
                                                    <Typography variant="body2">{msg.body}</Typography>
                                                </Paper>
                                                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', textAlign: isMe ? 'right' : 'left' }}>
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Input Area */}
                                <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            fullWidth
                                            placeholder="Type a message..."
                                            size="small"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 10 } }}
                                        />
                                        <IconButton color="primary" onClick={handleSend} disabled={!messageInput.trim()}>
                                            <SendIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            </>
                        )}
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};
