import axiosInstance from './axiosInstance';

export const analyticsService = {
  // Pharmacy
  getPharmacyStats: () => axiosInstance.get('/analytics/pharmacy/stats'),
  getPharmacySearchAnalytics: (params) => axiosInstance.get('/analytics/pharmacy/searches', { params }),
  getInventoryAnalytics: (params) => axiosInstance.get('/analytics/pharmacy/inventory', { params }),
  getStockTrend: (params) => axiosInstance.get('/analytics/pharmacy/stock-trend', { params }),
  getRecentActivity: () => axiosInstance.get('/analytics/pharmacy/activity'),
  // Admin
  getPlatformStats: () => axiosInstance.get('/analytics/platform/stats'),
  getUserGrowth: (params) => axiosInstance.get('/analytics/platform/user-growth', { params }),
  getPharmacyGrowth: (params) => axiosInstance.get('/analytics/platform/pharmacy-growth', { params }),
  getMedicineSearches: (params) => axiosInstance.get('/analytics/platform/searches', { params }),
  getAvailabilityOverview: () => axiosInstance.get('/analytics/platform/availability'),
  getAlertActivity: (params) => axiosInstance.get('/analytics/platform/alerts', { params }),
};
