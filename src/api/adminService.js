import axiosInstance from './axiosInstance';

export const adminService = {
  // Users
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUserById: (id) => axiosInstance.get(`/admin/users/${id}`),
  updateUser: (id, data) => axiosInstance.put(`/admin/users/${id}`, data),
  activateUser: (id) => axiosInstance.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id) => axiosInstance.patch(`/admin/users/${id}/deactivate`),
  deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  // Pharmacies
  getPharmacies: (params) => axiosInstance.get('/admin/pharmacies', { params }),
  getPendingVerification: () => axiosInstance.get('/admin/pharmacies/pending'),
  verifyPharmacy: (id, data) => axiosInstance.put(`/admin/pharmacies/${id}/verify`, data),
  // Medicines
  getMedicines: (params) => axiosInstance.get('/admin/medicines', { params }),
  createMedicine: (data) => axiosInstance.post('/medicines', data),
  updateMedicine: (id, data) => axiosInstance.put(`/medicines/${id}`, data),
  deleteMedicine: (id) => axiosInstance.delete(`/medicines/${id}`),
  // Inventory
  getInventory: (params) => axiosInstance.get('/admin/inventory', { params }),
  // Reports
  getReports: (params) => axiosInstance.get('/admin/reports', { params }),
  // Audit logs
  getAuditLogs: (params) => axiosInstance.get('/admin/audit-logs', { params }),
  // Analytics
  getDashboardStats: () => axiosInstance.get('/admin/dashboard/stats'),
  // Notifications
  getNotifications: (params) => axiosInstance.get('/admin/notifications', { params }),
  sendNotification: (data) => axiosInstance.post('/admin/notifications', data),
};
