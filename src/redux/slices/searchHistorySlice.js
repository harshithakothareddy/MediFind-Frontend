import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchHistoryService } from '../../api/searchHistoryService';

export const fetchSearchHistory = createAsyncThunk('searchHistory/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await searchHistoryService.getAll(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteHistoryItem = createAsyncThunk('searchHistory/delete', async (id, { rejectWithValue }) => {
  try { await searchHistoryService.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const clearHistory = createAsyncThunk('searchHistory/clearAll', async (_, { rejectWithValue }) => {
  try { await searchHistoryService.clearAll(); return true; }
  catch (err) { return rejectWithValue(err.message); }
});

const searchHistorySlice = createSlice({
  name: 'searchHistory',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    addLocalHistory: (state, action) => {
      const exists = state.items.find(i => i.query === action.payload.query);
      if (!exists) state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchHistory.pending, (state) => { state.loading = true; })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchSearchHistory.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(deleteHistoryItem.fulfilled, (state, action) => { state.items = state.items.filter(i => i.id !== action.payload); })
      .addCase(clearHistory.fulfilled, (state) => { state.items = []; });
  },
});

export const { addLocalHistory } = searchHistorySlice.actions;
export default searchHistorySlice.reducer;
