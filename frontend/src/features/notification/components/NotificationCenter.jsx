import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
    selectNotifications, 
    markAsReadAsync, 
    markAllAsReadAsync 
} from '../NotificationSlice';
import {
    Drawer, Box, Typography, List, ListItem, ListItemText,
    IconButton, Divider, Badge, Tabs, Tab, Stack, Button,
    Tooltip, Chip, Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Notifications as BellIcon,
    ShoppingBag as OrderIcon,
    Payment as PaymentIcon,
    Info as SystemIcon,
    Gavel as DisputeIcon,
    DoneAll as MarkReadIcon,
    Message as MessageIcon,
    Security as SecurityIcon,
    Campaign as MarketingIcon,
    AccountBalance as FinanceIcon,
    Inventory as ProductIcon
} from '@mui/icons-material';

const typeIcons = {
    order: <OrderIcon color="primary" />,
    payment: <PaymentIcon color="success" />,
    system: <SystemIcon color="info" />,
    dispute: <DisputeIcon color="error" />,
    product: <ProductIcon color="secondary" />,
    communication: <MessageIcon color="primary" />,
    security: <SecurityIcon color="warning" />,
    finance: <FinanceIcon color="success" />,
    marketing: <MarketingIcon color="info" />
};

export const NotificationCenter = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notifications = useSelector(selectNotifications);
    const [tab, setTab] = useState(0);

    const filteredNotifications = notifications.filter(n => {
        if (tab === 0) return true; // All
        if (tab === 1) return n.type === 'order';
        if (tab === 2) return n.type === 'communication';
        if (tab === 3) return n.type === 'marketing';
        if (tab === 4) return ['system', 'dispute', 'security', 'finance', 'payment', 'product'].includes(n.type);
        return true;
    });

    const handleNotificationClick = (noti) => {
        if (!noti.isRead) {
            dispatch(markAsReadAsync(noti._id));
        }
        if (noti.link) {
            navigate(noti.link);
            onClose();
        }
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsReadAsync());
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, borderRadius: { xs: 0, sm: '20px 0 0 20px' } }
            }}
        >
            <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">Notifications</Typography>
                    <IconButton onClick={onClose}><CloseIcon /></IconButton>
                </Stack>

                <Tabs
                    value={tab}
                    onChange={(e, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}
                >
                    <Tab label="All" />
                    <Tab label="Orders" />
                    <Tab label="Messages" />
                    <Tab label="Promo" />
                    <Tab label="Other" />
                </Tabs>

                {notifications.some(n => !n.isRead) && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, mb: 1 }}>
                        <Button
                            size="small"
                            startIcon={<MarkReadIcon />}
                            onClick={handleMarkAllRead}
                            sx={{ textTransform: 'none' }}
                        >
                            Mark all read
                        </Button>
                    </Box>
                )}

                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {filteredNotifications.length === 0 ? (
                        <Box sx={{ p: 5, textAlign: 'center', opacity: 0.5 }}>
                            <BellIcon sx={{ fontSize: 60, mb: 2 }} />
                            <Typography>You're all caught up!</Typography>
                        </Box>
                    ) : (
                        filteredNotifications.map((noti) => (
                            <React.Fragment key={noti._id}>
                                <ListItem
                                    button
                                    onClick={() => handleNotificationClick(noti)}
                                    sx={{
                                        bgcolor: noti.isRead ? 'transparent' : 'action.hover',
                                        borderRadius: 2,
                                        mb: 1,
                                        borderLeft: noti.isRead ? '4px solid transparent' : '4px solid #1976d2'
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: 'background.paper', mr: 2 }}>
                                        {typeIcons[noti.type] || <SystemIcon />}
                                    </Avatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight={noti.isRead ? 'normal' : 'bold'}>
                                                {noti.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Stack spacing={0.5}>
                                                <Typography variant="caption" color="text.secondary">
                                                    {noti.body}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled">
                                                    {formatDistanceToNow(new Date(noti.createdAt), { addSuffix: true })}
                                                </Typography>
                                            </Stack>
                                        }
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Box>
        </Drawer>
    );
};
