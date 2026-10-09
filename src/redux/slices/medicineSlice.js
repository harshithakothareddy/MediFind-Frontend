import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicineService } from '../../api/medicineService';

export const searchMedicines = createAsyncThunk('medicine/search', async (params, { rejectWithValue }) => {
  try {
    const res = await medicineService.search(params);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchMedicineById = createAsyncThunk('medicine/fetchById', async (id, { rejectWithValue }) => {
  try {
    const res = await medicineService.getById(id);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchPopularMedicines = createAsyncThunk('medicine/fetchPopular', async (_, { rejectWithValue }) => {
  try {
    const res = await medicineService.getPopular();
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

const medicineSlice = createSlice({
  name: 'medicine',
  initialState: {
    searchResults: [],
    searchMeta: null,
    currentMedicine: null,
    popularMedicines: [],
    suggestions: [],
    loading: false,
    searchLoading: false,
    error: null,
    filters: {
      availability: [],
      category: '',
      openNow: false,
      verified: false,
      sortBy: 'nearest',
    },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    resetFilters: (state) => { state.filters = { availability: [], category: '', openNow: false, verified: false, sortBy: 'nearest' }; },
    setSuggestions: (state, action) => { state.suggestions = action.payload; },
    clearSearch: (state) => { state.searchResults = []; state.searchMeta = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMedicines.pending, (state) => { state.searchLoading = true; state.error = null; })
      .addCase(searchMedicines.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results || action.payload;
        state.searchMeta = action.payload.meta || null;
      })
      .addCase(searchMedicines.rejected, (state, action) => { state.searchLoading = false; state.error = action.payload; })
      .addCase(fetchMedicineById.pending, (state) => { state.loading = true; })
      .addCase(fetchMedicineById.fulfilled, (state, action) => { state.loading = false; state.currentMedicine = action.payload; })
      .addCase(fetchMedicineById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchPopularMedicines.fulfilled, (state, action) => { state.popularMedicines = action.payload; });
  },
});

export const { setFilters, resetFilters, setSuggestions, clearSearch } = medicineSlice.actions;
export default medicineSlice.reducer;
