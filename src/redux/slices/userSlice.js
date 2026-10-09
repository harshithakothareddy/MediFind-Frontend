import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../api/userService';

export const fetchUserProfile = createAsyncThunk('user/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await userService.getProfile();
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchDashboard = createAsyncThunk('user/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await userService.getDashboardData();
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null, dashboard: null, loading: false, error: null },
  reducers: {
    updateProfile: (state, action) => { state.profile = { ...state.profile, ...action.payload }; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchUserProfile.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchUserProfile.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.loading = false; state.dashboard = action.payload; })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { updateProfile } = userSlice.actions;
export default userSlice.reducer;
