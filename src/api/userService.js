import axiosInstance from './axiosInstance';

export const userService = {
  getProfile: () => axiosInstance.get('/users/me'),
  updateProfile: (data) => axiosInstance.put('/users/me', data),
  uploadAvatar: (formData) => axiosInstance.post('/users/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateNotificationPreferences: (data) => axiosInstance.put('/users/notification-preferences', data),
  getDashboardData: () => axiosInstance.get('/users/dashboard'),
};
