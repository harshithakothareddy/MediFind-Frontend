import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoriteService } from '../../api/favoriteService';

export const fetchFavorites = createAsyncThunk('favorite/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const [meds, pharms] = await Promise.all([favoriteService.getMedicineFavorites(), favoriteService.getPharmacyFavorites()]);
    return { medicines: meds.data, pharmacies: pharms.data };
  } catch (err) { return rejectWithValue(err.message); }
});

export const toggleMedicineFavorite = createAsyncThunk('favorite/toggleMedicine', async ({ id, isFav }, { rejectWithValue }) => {
  try {
    if (isFav) await favoriteService.removeMedicineFavorite(id);
    else await favoriteService.addMedicineFavorite(id);
    return { id, isFav: !isFav };
  } catch (err) { return rejectWithValue(err.message); }
});

export const togglePharmacyFavorite = createAsyncThunk('favorite/togglePharmacy', async ({ id, isFav }, { rejectWithValue }) => {
  try {
    if (isFav) await favoriteService.removePharmacyFavorite(id);
    else await favoriteService.addPharmacyFavorite(id);
    return { id, isFav: !isFav };
  } catch (err) { return rejectWithValue(err.message); }
});

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState: { medicines: [], pharmacies: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => { state.loading = true; })
      .addCase(fetchFavorites.fulfilled, (state, action) => { state.loading = false; state.medicines = action.payload.medicines; state.pharmacies = action.payload.pharmacies; })
      .addCase(fetchFavorites.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default favoriteSlice.reducer;
