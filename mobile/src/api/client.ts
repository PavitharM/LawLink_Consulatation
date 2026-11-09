import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * API base URL resolution:
 * 1. EXPO_PUBLIC_API_BASE_URL (e.g. your deployed backend, https://api.example.com/api)
 * 2. In development, the machine running Metro (so a physical phone on the same Wi-Fi works)
 * 3. Emulator / simulator loopback fallback
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const hostUri = Constants.expoConfig?.hostUri; // e.g. "192.168.1.20:8081"
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:5001/api`;

  return Platform.OS === 'android' ? 'http://10.0.2.2:5001/api' : 'http://localhost:5001/api';
}

export const API_BASE_URL = resolveBaseUrl();
/** Origin serving /uploads/... files (API base without the trailing /api). */
export const FILES_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export const fileUrl = (path?: string | null) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${FILES_BASE_URL}${path}`;
};

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

// Mirror the web client: unwrap `response.data`, reject with the server's error body.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && authToken && onUnauthorized) {
      onUnauthorized();
    }
    const status: number | undefined = error.response?.status;
    const body = error.response?.data;
    let message: string;
    if (!error.response) {
      message = error.message === 'Network Error' || error.code === 'ECONNABORTED'
        ? 'Cannot reach the LawLink server. Check your connection and try again.'
        : error.message;
      console.warn(`[api] ${error.message} (${API_BASE_URL})`);
    } else if (status && status >= 500) {
      // Never show server internals (stack traces, DB errors) to the user.
      console.warn(`[api] ${status} ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, body?.message || body?.error);
      message = 'Something went wrong on our side. Please try again in a moment.';
    } else {
      message = body?.message || body?.error || error.message;
    }
    return Promise.reject({ ...(body || {}), message, status });
  }
);

/** Typed helpers — the interceptor already returns the JSON body. */
export type ApiResponse<T = any> = { success: boolean; data: T; message?: string; error?: string };

export const http = {
  get: <T = any>(url: string) => api.get(url) as unknown as Promise<ApiResponse<T>>,
  post: <T = any>(url: string, body?: any, config?: any) =>
    api.post(url, body, config) as unknown as Promise<ApiResponse<T>>,
  put: <T = any>(url: string, body?: any) => api.put(url, body) as unknown as Promise<ApiResponse<T>>,
  patch: <T = any>(url: string, body?: any) => api.patch(url, body) as unknown as Promise<ApiResponse<T>>,
  delete: <T = any>(url: string) => api.delete(url) as unknown as Promise<ApiResponse<T>>,
};

export default api;
