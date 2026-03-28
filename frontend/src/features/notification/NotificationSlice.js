import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchNotifications, markAllAsRead, markAsRead } from "./NotificationApi";

const initialState = {
    notifications: [],
    banner: null, // { message, type: 'info'|'warning'|'error', sticky: true }
    criticalModal: null, // { title, message, actionLabel, actionLink }
    status: 'idle',
    error: null,
};

export const fetchNotificationsAsync = createAsyncThunk('notification/fetchNotifications', async () => {
    const response = await fetchNotifications();
    return response;
});

export const markAsReadAsync = createAsyncThunk('notification/markAsRead', async (id) => {
    const response = await markAsRead(id);
    return response;
});

export const markAllAsReadAsync = createAsyncThunk('notification/markAllAsRead', async () => {
    const response = await markAllAsRead();
    return response;
});

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        resetNotificationStatus: (state) => {
            state.status = 'idle';
        },
        setBanner: (state, action) => {
            state.banner = action.payload;
        },
        clearBanner: (state) => {
            state.banner = null;
        },
        setCriticalModal: (state, action) => {
            state.criticalModal = action.payload;
        },
        clearCriticalModal: (state) => {
            state.criticalModal = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotificationsAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNotificationsAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.notifications = action.payload;
            })
            .addCase(markAsReadAsync.fulfilled, (state, action) => {
                const index = state.notifications.findIndex(n => n._id === action.payload._id);
                if (index !== -1) {
                    state.notifications[index] = action.payload;
                }
            })
            .addCase(markAllAsReadAsync.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
            });
    },
});

export const { resetNotificationStatus, setBanner, clearBanner, setCriticalModal, clearCriticalModal } = notificationSlice.actions;

export const selectNotifications = (state) => state.NotificationSlice.notifications;
export const selectUnreadCount = (state) => state.NotificationSlice.notifications.filter(n => !n.isRead).length;
export const selectNotificationStatus = (state) => state.NotificationSlice.status;
export const selectBanner = (state) => state.NotificationSlice.banner;
export const selectCriticalModal = (state) => state.NotificationSlice.criticalModal;

export default notificationSlice.reducer;
