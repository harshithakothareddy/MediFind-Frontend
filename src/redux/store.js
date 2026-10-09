import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import medicineReducer from './slices/medicineSlice';
import pharmacyReducer from './slices/pharmacySlice';
import inventoryReducer from './slices/inventorySlice';
import favoriteReducer from './slices/favoriteSlice';
import searchHistoryReducer from './slices/searchHistorySlice';
import alertReducer from './slices/alertSlice';
import notificationReducer from './slices/notificationSlice';
import adminReducer from './slices/adminSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    medicine: medicineReducer,
    pharmacy: pharmacyReducer,
    inventory: inventoryReducer,
    favorite: favoriteReducer,
    searchHistory: searchHistoryReducer,
    alert: alertReducer,
    notification: notificationReducer,
    admin: adminReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/loginSuccess'],
      },
    }),
});

export default store;
