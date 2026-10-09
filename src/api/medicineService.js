import axiosInstance from './axiosInstance';

export const medicineService = {
  search: (params) => axiosInstance.get('/medicines/search', { params }),
  getAll: (params) => axiosInstance.get('/medicines', { params }),
  getById: (id) => axiosInstance.get(`/medicines/${id}`),
  getAvailability: (id) => axiosInstance.get(`/medicines/${id}/availability`),
  getRelated: (id) => axiosInstance.get(`/medicines/${id}/related`),
  getAlternatives: (id) => axiosInstance.get(`/medicines/${id}/alternatives`),
  getPopular: () => axiosInstance.get('/medicines/popular'),
  getCategories: () => axiosInstance.get('/medicines/categories'),
  getSuggestions: (query) => axiosInstance.get('/medicines/suggestions', { params: { query } }),
  // Admin
  create: (data) => axiosInstance.post('/medicines', data),
  update: (id, data) => axiosInstance.put(`/medicines/${id}`, data),
  delete: (id) => axiosInstance.delete(`/medicines/${id}`),
};
