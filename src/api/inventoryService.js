import axiosInstance from './axiosInstance';

export const inventoryService = {
  // Pharmacy portal
  getPharmacyInventory: (params) => axiosInstance.get('/inventory', { params }),
  getById: (id) => axiosInstance.get(`/inventory/${id}`),
  addMedicine: (data) => axiosInstance.post('/inventory', data),
  updateMedicine: (id, data) => axiosInstance.put(`/inventory/${id}`, data),
  updateStock: (id, data) => axiosInstance.patch(`/inventory/${id}/stock`, data),
  deleteMedicine: (id) => axiosInstance.delete(`/inventory/${id}`),
  getLowStock: () => axiosInstance.get('/inventory/low-stock'),
  getOutOfStock: () => axiosInstance.get('/inventory/out-of-stock'),
  getExpiryWatch: (days = 90) => axiosInstance.get('/inventory/expiry-watch', { params: { days } }),
  bulkUpdateStatus: (ids, status) => axiosInstance.put('/inventory/bulk-status', { ids, status }),
  searchAvailability: (medicine, verifiedOnly = false) => axiosInstance.get('/inventory/search', { params: { medicine, verifiedOnly } }),
  // Admin
  getAllInventory: (params) => axiosInstance.get('/admin/inventory', { params }),
};
