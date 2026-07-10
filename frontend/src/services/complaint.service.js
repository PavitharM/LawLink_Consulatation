import api from './api';

export const createComplaint = async (data) => {
  return api.post('/complaints', data);
};

export const getComplaints = async () => {
  return api.get('/complaints');
};

export const getComplaintById = async (id) => {
  return api.get(`/complaints/${id}`);
};

export const updateComplaintStatus = async (id, statusData) => {
  return api.patch(`/complaints/${id}`, statusData);
};

export const assignLawyer = async (id, lawyerId) => {
  return api.post(`/complaints/${id}/assign`, { lawyerId });
};

export const rejectAssignment = async (id) => {
  return api.post(`/complaints/${id}/reject`);
};
