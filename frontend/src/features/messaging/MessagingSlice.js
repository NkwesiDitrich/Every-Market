import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchConversations, fetchMessages, sendMessage, createConversation } from "./MessagingApi";

const initialState = {
    conversations: [],
    messages: [],
    status: 'idle',
    error: null,
};

export const fetchConversationsAsync = createAsyncThunk('messaging/fetchConversations', async (role, { rejectWithValue }) => {
    try {
        const response = await fetchConversations(role);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const fetchMessagesAsync = createAsyncThunk('messaging/fetchMessages', async ({ conversationId, role }, { rejectWithValue }) => {
    try {
        const response = await fetchMessages(conversationId, role);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const sendMessageAsync = createAsyncThunk('messaging/sendMessage', async ({ conversationId, body, role }, { rejectWithValue }) => {
    try {
        const response = await sendMessage(conversationId, body, role);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const createConversationAsync = createAsyncThunk('messaging/createConversation', async ({ sellerId, orderId, productId, body }, { rejectWithValue }) => {
    try {
        const response = await createConversation(sellerId, orderId, productId, body);
        return response;
    } catch (error) {
        return rejectWithValue(error);
    }
});

const messagingSlice = createSlice({
    name: 'messaging',
    initialState,
    reducers: {
        resetMessagingStatus: (state) => {
            state.status = 'idle';
        },
        clearMessages: (state) => {
            state.messages = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversationsAsync.fulfilled, (state, action) => {
                state.conversations = action.payload;
            })
            .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
                state.messages = action.payload;
            })
            .addCase(sendMessageAsync.fulfilled, (state, action) => {
                state.messages.push(action.payload);
                const conv = state.conversations.find(c => c._id === action.payload.conversation);
                if (conv) {
                    conv.lastMessage = action.payload;
                    conv.updatedAt = new Date().toISOString();
                }
            })
            .addCase(createConversationAsync.fulfilled, (state, action) => {
                state.status = 'fulfilled';
                state.conversations.unshift(action.payload.conversation);
            })
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.status = 'pending';
                    state.error = null;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.status = 'rejected';
                    state.error = action.payload?.message || action.error?.message || "Operation failed";
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/fulfilled') && !action.type.includes('createConversation'),
                (state) => {
                    state.status = 'idle';
                }
            );
    },
});

export const { resetMessagingStatus, clearMessages } = messagingSlice.actions;

export const selectConversations = (state) => state.MessagingSlice.conversations;
export const selectMessages = (state) => state.MessagingSlice.messages;
export const selectMessagingStatus = (state) => state.MessagingSlice.status;
export const selectMessagingError = (state) => state.MessagingSlice.error;

export default messagingSlice.reducer;
