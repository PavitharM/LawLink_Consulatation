import api from './api';

export const getMe = async () => {
  return api.get('/users/me');
};

export const updateMe = async (data) => {
  return api.put('/users/me', data);
};

export const getUsers = async () => {
  return api.get('/users');
};

export const toggleUserStatus = async (id, status) => {
  return api.patch(`/users/${id}/status`, { status });
};

// Lawyers
export const getLawyers = async () => {
  return api.get('/lawyers');
};

export const getLawyerById = async (id) => {
  return api.get(`/lawyers/${id}`);
};

export const updateLawyerProfile = async (data) => {
  return api.put('/lawyers/me/profile', data);
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyLawyer = async (id, isVerified) => {
  return api.patch(`/lawyers/${id}/verify`, { isVerified });
};
