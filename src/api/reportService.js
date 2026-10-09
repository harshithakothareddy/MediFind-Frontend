import axiosInstance from './axiosInstance';

export const reportService = {
  // Availability reports (user)
  submitReport: (data) => axiosInstance.post('/reports/availability', data),
  getUserReports: () => axiosInstance.get('/reports/my-reports'),
  // Admin
  getAllReports: (params) => axiosInstance.get('/reports', { params }),
  getReportById: (id) => axiosInstance.get(`/reports/${id}`),
  updateReportStatus: (id, status, notes) => axiosInstance.put(`/reports/${id}/status`, { status, notes }),
  // Generated reports
  generateReport: (data) => axiosInstance.post('/reports/generate', data),
  downloadReport: (id, format) => axiosInstance.get(`/reports/${id}/download`, { params: { format }, responseType: 'blob' }),
  getReportTypes: () => axiosInstance.get('/reports/types'),
};
