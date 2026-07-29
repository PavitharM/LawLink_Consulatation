import api from './api';

export const getNotifications = async () => {
  return api.get('/notifications');
};

export const markNotificationRead = async (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  return api.put('/notifications/read-all');
};

export const dismissNotification = async (id) => {
  return api.delete(`/notifications/${id}`);
};

export const createNotification = async (data) => {
  return api.post('/notifications', data);
};

export const triggerEmergencyAlert = async () => {
  return api.post('/notifications/emergency');
};

