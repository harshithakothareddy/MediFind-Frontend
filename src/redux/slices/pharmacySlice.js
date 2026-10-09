import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pharmacyService } from '../../api/pharmacyService';

export const fetchPharmacies = createAsyncThunk('pharmacy/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await pharmacyService.getAll(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchPharmacyById = createAsyncThunk('pharmacy/fetchById', async (id, { rejectWithValue }) => {
  try { const res = await pharmacyService.getById(id); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchNearbyPharmacies = createAsyncThunk('pharmacy/fetchNearby', async (params, { rejectWithValue }) => {
  try { const res = await pharmacyService.getNearby(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: { list: [], currentPharmacy: null, nearbyPharmacies: [], loading: false, error: null, filters: { verified: false, openNow: false, sortBy: 'distance' } },
  reducers: {
    setPharmacyFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPharmacies.pending, (state) => { state.loading = true; })
      .addCase(fetchPharmacies.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchPharmacies.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPharmacyById.pending, (state) => { state.loading = true; })
      .addCase(fetchPharmacyById.fulfilled, (state, action) => { state.loading = false; state.currentPharmacy = action.payload; })
      .addCase(fetchPharmacyById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchNearbyPharmacies.fulfilled, (state, action) => { state.nearbyPharmacies = action.payload; });
  },
});

export const { setPharmacyFilters } = pharmacySlice.actions;
export default pharmacySlice.reducer;
