import axiosInstance from './axiosInstance';

export const alertService = {
  getAll: () => axiosInstance.get('/alerts'),
  create: (data) => axiosInstance.post('/alerts', data),
  update: (id, data) => axiosInstance.put(`/alerts/${id}`, data),
  disable: (id) => axiosInstance.patch(`/alerts/${id}/disable`),
  delete: (id) => axiosInstance.delete(`/alerts/${id}`),
};
