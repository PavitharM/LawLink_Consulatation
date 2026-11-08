/**
 * One-to-one port of frontend/src/services/*.service.js
 */
import { http } from './client';

export type PickedFile = { uri: string; name: string; mimeType?: string | null };

const toFormFile = (f: PickedFile) =>
  ({ uri: f.uri, name: f.name, type: f.mimeType || 'application/octet-stream' }) as any;

const multipart = { headers: { 'Content-Type': 'multipart/form-data' }, transformRequest: (d: any) => d };

// ── Auth ───────────────────────────────────────────────
export const login = (credentials: { email: string; password: string }) => http.post('/auth/login', credentials);
export const register = (userData: any) => http.post('/auth/register', userData);
export const logout = () => http.post('/auth/logout');

// ── Users / Lawyers ────────────────────────────────────
export const getMe = () => http.get('/users/me');
export const updateMe = (data: any) => http.put('/users/me', data);
export const getUsers = () => http.get<any[]>('/users');
export const toggleUserStatus = (id: string, status: string) => http.patch(`/users/${id}/status`, { status });
export const getLawyers = () => http.get<any[]>('/lawyers');
export const getLawyerById = (id: string) => http.get(`/lawyers/${id}`);
export const updateLawyerProfile = (data: any) => http.put('/lawyers/me/profile', data);
export const verifyLawyer = (id: string, isVerified: boolean) => http.patch(`/lawyers/${id}/verify`, { isVerified });
export const uploadAvatar = (file: PickedFile) => {
  const fd = new FormData();
  fd.append('avatar', toFormFile(file));
  return http.post<{ avatarUrl: string }>('/upload/avatar', fd, multipart);
};

// ── Complaints ─────────────────────────────────────────
export const createComplaint = (data: any) => http.post('/complaints', data);
export const getComplaints = () => http.get<any[]>('/complaints');
export const getComplaintById = (id: string) => http.get(`/complaints/${id}`);
export const updateComplaintStatus = (id: string, statusData: any) => http.patch(`/complaints/${id}`, statusData);
export const assignLawyer = (id: string, lawyerId: string) => http.post(`/complaints/${id}/assign`, { lawyerId });
export const rejectAssignment = (id: string) => http.post(`/complaints/${id}/reject`);

// ── Uploads ────────────────────────────────────────────
export const uploadFile = (complaintId: string, slotId: string, file: PickedFile) => {
  const fd = new FormData();
  fd.append('complaintId', complaintId);
  fd.append('slotId', slotId);
  fd.append('file', toFormFile(file));
  return http.post('/upload', fd, multipart);
};

// ── Packages ───────────────────────────────────────────
export const getPackages = () => http.get<any[]>('/packages');
export const getAllPackagesAdmin = () => http.get<any[]>('/packages/all');
export const createPackage = (data: any) => http.post('/packages', data);
export const updatePackage = (id: string, data: any) => http.put(`/packages/${id}`, data);
export const deletePackage = (id: string) => http.delete(`/packages/${id}`);

// ── Articles ───────────────────────────────────────────
export const getArticles = () => http.get<any[]>('/articles');
export const getAllArticlesAdmin = () => http.get<any[]>('/articles/admin/all');
export const createArticle = (data: any) => http.post('/articles', data);
export const updateArticle = (id: string, data: any) => http.put(`/articles/${id}`, data);
export const deleteArticle = (id: string) => http.delete(`/articles/${id}`);

// ── Notifications ──────────────────────────────────────
export const getNotifications = () => http.get<any[]>('/notifications');
export const markNotificationRead = (id: string) => http.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => http.put('/notifications/read-all');
export const dismissNotification = (id: string) => http.delete(`/notifications/${id}`);
export const createNotification = (data: any) => http.post('/notifications', data);
export const triggerEmergencyAlert = () => http.post('/notifications/emergency');

// ── Messages ───────────────────────────────────────────
export const getMessages = (otherUserId: string) => http.get<any[]>(`/messages/${otherUserId}`);
export const sendMessage = (otherUserId: string, text: string) => http.post(`/messages/${otherUserId}`, { text });

// ── Admin ──────────────────────────────────────────────
export const getAdminStats = () => http.get('/admin/stats');
export const getReportData = () => http.get('/admin/report');
