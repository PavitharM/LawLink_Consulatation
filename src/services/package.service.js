import api from './api';

export const getPackages = async () => {
  return api.get('/packages');
};

export const getAllPackagesAdmin = async () => {
  return api.get('/packages/all');
};

export const createPackage = async (data) => {
  return api.post('/packages', data);
};

export const updatePackage = async (id, data) => {
  return api.put(`/packages/${id}`, data);
};

export const deletePackage = async (id) => {
  return api.delete(`/packages/${id}`);
};
