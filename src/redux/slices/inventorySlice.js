import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from '../../api/inventoryService';

export const fetchInventory = createAsyncThunk('inventory/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await inventoryService.getPharmacyInventory(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const addInventoryItem = createAsyncThunk('inventory/add', async (data, { rejectWithValue }) => {
  try { const res = await inventoryService.addMedicine(data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateInventoryItem = createAsyncThunk('inventory/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await inventoryService.updateMedicine(id, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateStock = createAsyncThunk('inventory/updateStock', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await inventoryService.updateStock(id, data); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteInventoryItem = createAsyncThunk('inventory/delete', async (id, { rejectWithValue }) => {
  try { await inventoryService.deleteMedicine(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: [], lowStock: [], outOfStock: [], loading: false, error: null, pagination: { page: 1, total: 0, limit: 20 } },
  reducers: {
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || action.payload;
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addInventoryItem.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
      });
  },
});

export const { setPagination } = inventorySlice.actions;
export default inventorySlice.reducer;
