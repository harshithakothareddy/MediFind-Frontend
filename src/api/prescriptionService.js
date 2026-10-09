import axiosInstance from './axiosInstance';

export const prescriptionService = {
  scan: (data) => axiosInstance.post('/prescriptions/scan', data),
  getMine: () => axiosInstance.get('/prescriptions/mine'),
  getPharmacyQueue: () => axiosInstance.get('/prescriptions/pharmacy'),
  upload: (pharmacyId, formData) => axiosInstance.post('/prescriptions', formData, {
    params: { pharmacyId },
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  review: (id, status, notes) => axiosInstance.patch(`/prescriptions/${id}/review`, { status, notes }),
  download: (id) => axiosInstance.get(`/prescriptions/${id}/file`, { responseType: 'blob' }),
  delete: (id) => axiosInstance.delete(`/prescriptions/${id}`),
};