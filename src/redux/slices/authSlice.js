import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../api/authService';

// Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('medifind_token', token);
    return { token, user };
  } catch (error) {
    return rejectWithValue(error.message || error.error || 'Login failed');
  }
});

export const restoreSession = createAsyncThunk('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser();
    return response.data.user;
  } catch (error) {
    return rejectWithValue(error.message || error.error || 'Session expired');
  }
}, {
  condition: (_, { getState }) => Boolean(getState().auth.token),
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (_) { /* ignore */ }
  localStorage.removeItem('medifind_token');
});

const storedToken = localStorage.getItem('medifind_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: storedToken,
    isAuthenticated: false,
    checkingSession: Boolean(storedToken),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('medifind_token');
      state.checkingSession = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreSession.pending, (state) => { state.checkingSession = true; })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.checkingSession = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.checkingSession = false;
        localStorage.removeItem('medifind_token');
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
