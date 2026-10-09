import axiosInstance from './axiosInstance';

export const pharmacyService = {
  getAll: (params) => axiosInstance.get('/pharmacies', { params }),
  getById: (id) => axiosInstance.get(`/pharmacies/${id}`),
  getNearby: (params) => axiosInstance.get('/pharmacies/nearby', { params }),
  getInventory: (id, params) => axiosInstance.get(`/pharmacies/${id}/inventory`, { params }),
  getOperatingHours: (id) => axiosInstance.get(`/pharmacies/${id}/hours`),
  // Pharmacy portal
  updateProfile: (data) => axiosInstance.put('/pharmacies/profile', data),
  updateOperatingHours: (data) => axiosInstance.put('/pharmacies/hours', data),
  uploadLogo: (formData) => axiosInstance.post('/pharmacies/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Admin
  verify: (id, status, reason) => axiosInstance.put(`/pharmacies/${id}/verify`, { status, reason }),
  suspend: (id) => axiosInstance.put(`/pharmacies/${id}/suspend`),
  delete: (id) => axiosInstance.delete(`/pharmacies/${id}`),
};
