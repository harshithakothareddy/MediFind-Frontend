import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyticsService } from '../../api/analyticsService';

export const fetchPharmacyStats = createAsyncThunk('analytics/pharmacyStats', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getPharmacyStats(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchPlatformStats = createAsyncThunk('analytics/platformStats', async (_, { rejectWithValue }) => {
  try { const res = await analyticsService.getPlatformStats(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchInventoryAnalytics = createAsyncThunk('analytics/inventory', async (params, { rejectWithValue }) => {
  try { const res = await analyticsService.getInventoryAnalytics(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { pharmacyStats: null, platformStats: null, inventoryData: null, searchData: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacyStats.pending, (state) => { state.loading = true; })
      .addCase(fetchPharmacyStats.fulfilled, (state, action) => { state.loading = false; state.pharmacyStats = action.payload; })
      .addCase(fetchPharmacyStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPlatformStats.fulfilled, (state, action) => { state.platformStats = action.payload; })
      .addCase(fetchInventoryAnalytics.fulfilled, (state, action) => { state.inventoryData = action.payload; });
  },
});

export default analyticsSlice.reducer;
