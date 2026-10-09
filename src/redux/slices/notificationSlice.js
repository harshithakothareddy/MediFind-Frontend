import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../api/notificationService';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await notificationService.getAll(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchUnreadCount = createAsyncThunk('notification/fetchUnreadCount', async (_, { rejectWithValue }) => {
  try { const res = await notificationService.getUnreadCount(); return res.data.count; }
  catch (err) { return rejectWithValue(err.message); }
});

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
  try { await notificationService.markAsRead(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async (_, { rejectWithValue }) => {
  try { await notificationService.markAllAsRead(); return true; }
  catch (err) { return rejectWithValue(err.message); }
});

const notificationSlice = createSlice({
  name: 'notification',
  initialState: { items: [], unreadCount: 0, loading: false, error: null },
  reducers: {
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find(n => n.id === action.payload);
        if (item && !item.read) { item.read = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => { n.read = true; });
        state.unreadCount = 0;
      });
  },
});

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
