import axios from 'axios';

// Auth API - port 8081
const authApi = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Kebun/User API - port 8082
const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const login = (data) => authApi.post('/auth/login', data);
export const register = (data) => authApi.post('/auth/register', data);

// User endpoints
export const getUsers = (params) => authApi.get('/internal/user/search', { params });
export const getUserById = (userId) => authApi.get(`/auth/internal/user/${userId}`);

// Kebun API
export const getKebunList = (params) => api.get('/kebun', { params });
export const getKebunDetail = (kode, params) => api.get(`/kebun/${kode}`, { params });
export const createKebun = (data) => api.post('/kebun', data);
export const updateKebun = (kode, data) => api.put(`/kebun/${kode}`, data);
export const deleteKebun = (kode) => api.delete(`/kebun/${kode}`);

// Mandor
export const assignMandor = (kode, mandorId, mandorName) => api.post(`/kebun/${kode}/mandor`, { mandorId, mandorName });
export const unassignMandor = (kode, target) => api.delete(`/kebun/${kode}/mandor`, { params: { target } });

// Supir
export const assignSupir = (kode, supirId, namaSupir) => api.post(`/kebun/${kode}/supir`, { supirId, namaSupir });
export const unassignSupir = (kode, supirId, target) => api.delete(`/kebun/${kode}/supir/${supirId}`, { params: { target } });

export default api;