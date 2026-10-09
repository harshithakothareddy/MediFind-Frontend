import axiosInstance from './axiosInstance';

export const favoriteService = {
  getMedicineFavorites: () => axiosInstance.get('/favorites/medicines'),
  getPharmacyFavorites: () => axiosInstance.get('/favorites/pharmacies'),
  addMedicineFavorite: (medicineId) => axiosInstance.post('/favorites/medicines', { medicineId }),
  removeMedicineFavorite: (medicineId) => axiosInstance.delete(`/favorites/medicines/${medicineId}`),
  addPharmacyFavorite: (pharmacyId) => axiosInstance.post('/favorites/pharmacies', { pharmacyId }),
  removePharmacyFavorite: (pharmacyId) => axiosInstance.delete(`/favorites/pharmacies/${pharmacyId}`),
};
