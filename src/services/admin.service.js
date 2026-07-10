import api from './api';

export const getAdminStats = async () => {
  return api.get('/admin/stats');
};

export const getReportData = async () => {
  return api.get('/admin/report');
};
