import api from './api';

export const login = async (credentials) => {
  return api.post('/auth/login', credentials);
};

export const register = async (userData) => {
  return api.post('/auth/register', userData);
};

export const logout = async () => {
  return api.post('/auth/logout');
};
