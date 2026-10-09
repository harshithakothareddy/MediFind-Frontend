import axiosInstance from './axiosInstance';

export const searchHistoryService = {
  getAll: (params) => axiosInstance.get('/search-history', { params }),
  delete: (id) => axiosInstance.delete(`/search-history/${id}`),
  clearAll: () => axiosInstance.delete('/search-history'),
  save: (data) => axiosInstance.post('/search-history', data),
};
