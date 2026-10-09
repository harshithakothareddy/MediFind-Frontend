import axiosInstance from './axiosInstance';

export const notificationService = {
  getAll: (params) => axiosInstance.get('/notifications', { params }),
  getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch('/notifications/read-all'),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
  deleteAll: () => axiosInstance.delete('/notifications'),
};
