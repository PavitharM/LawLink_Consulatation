import api from './api';

export const getMessages = async (otherUserId) => {
  return api.get(`/messages/${otherUserId}`);
};

export const sendMessage = async (otherUserId, text) => {
  return api.post(`/messages/${otherUserId}`, { text });
};
