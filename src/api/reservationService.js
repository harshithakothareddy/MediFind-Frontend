import axiosInstance from './axiosInstance';

export const reservationService = {
  create: (data) => axiosInstance.post('/reservations', data),
  getMine: () => axiosInstance.get('/reservations/mine'),
  getPharmacyQueue: () => axiosInstance.get('/reservations/pharmacy'),
  cancel: (id) => axiosInstance.patch(`/reservations/${id}/cancel`),
  updateStatus: (id, status) => axiosInstance.patch(`/reservations/${id}/status`, { status }),
  getByCode: (code) => axiosInstance.get(`/reservations/code/${code}`),
  verifyPickup: (code) => axiosInstance.post(`/reservations/code/${code}/verify-pickup`),
};

export const prescriptionService = {
  scan: (data) => axiosInstance.post('/prescriptions/scan', data),
  upload: (pharmacyId, file) => {
    const form = new FormData();
    form.append('pharmacyId', pharmacyId);
    form.append('file', file);
    return axiosInstance.post('/prescriptions', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getMine: () => axiosInstance.get('/prescriptions/mine'),
  getPharmacy: () => axiosInstance.get('/prescriptions/pharmacy'),
  review: (id, status, notes) => axiosInstance.patch(`/prescriptions/${id}/review`, { status, notes }),
  delete: (id) => axiosInstance.delete(`/prescriptions/${id}`),
};