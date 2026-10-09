import axiosInstance from './axiosInstance';

export const reviewService = {
  getByPharmacy: (pharmacyId) => axiosInstance.get(`/pharmacies/${pharmacyId}/reviews`),
  submit: (pharmacyId, data) => axiosInstance.post(`/pharmacies/${pharmacyId}/reviews`, data),
};