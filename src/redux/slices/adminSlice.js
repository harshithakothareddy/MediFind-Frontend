import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../../api/adminService';

export const fetchDashboardStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try { const res = await adminService.getDashboardStats(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try { const res = await adminService.getUsers(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchAdminPharmacies = createAsyncThunk('admin/fetchPharmacies', async (params, { rejectWithValue }) => {
  try { const res = await adminService.getPharmacies(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchAuditLogs = createAsyncThunk('admin/fetchAuditLogs', async (params, { rejectWithValue }) => {
  try { const res = await adminService.getAuditLogs(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    pharmacies: [],
    auditLogs: [],
    loading: false,
    error: null,
    pagination: { page: 1, total: 0, limit: 20 },
  },
  reducers: {
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload.items || action.payload; if (action.payload.pagination) state.pagination = action.payload.pagination; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAdminPharmacies.fulfilled, (state, action) => { state.pharmacies = action.payload.items || action.payload; })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => { state.auditLogs = action.payload.items || action.payload; });
  },
});

export const { setPagination } = adminSlice.actions;
export default adminSlice.reducer;
