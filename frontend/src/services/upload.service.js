import api from './api';

export const uploadFile = async (complaintId, slotId, file) => {
  const formData = new FormData();
  formData.append('complaintId', complaintId);
  formData.append('slotId', slotId);
  formData.append('file', file);

  // We must omit the default 'Content-Type' header so Axios/fetch can set the multipart boundary automatically
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
