import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { alertService } from '../../api/alertService';

export const fetchAlerts = createAsyncThunk('alert/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await alertService.getAll(); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createAlert = createAsyncThunk('alert/create', async (data, { rejectWithValue }) => {
  try { const res = await alertService.create(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const disableAlert = createAsyncThunk('alert/disable', async (id, { rejectWithValue }) => {
  try { const res = await alertService.disable(id); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteAlert = createAsyncThunk('alert/delete', async (id, { rejectWithValue }) => {
  try { await alertService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const alertSlice = createSlice({
  name: 'alert',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; })
      .addCase(fetchAlerts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchAlerts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createAlert.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(disableAlert.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAlert.fulfilled, (state, action) => { state.items = state.items.filter(i => i.id !== action.payload); });
  },
});

export default alertSlice.reducer;
