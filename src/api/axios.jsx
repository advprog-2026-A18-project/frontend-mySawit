import axios from 'axios';


const authApiBaseURL = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:8081';

const attachAccessToken = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: authApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

authApi.interceptors.request.use(attachAccessToken);

// Auth API
export const login = (payload) => authApi.post('/auth/login', payload);
export const register = (payload) => authApi.post('/auth/register', payload);
export const loginWithGoogle = (payload) => authApi.post('/auth/google', payload);
export const refreshToken = (refreshTokenValue) =>
  authApi.post('/auth/refresh', { refreshToken: refreshTokenValue });
export const logout = (refreshTokenValue) =>
  authApi.post('/auth/logout', { refreshToken: refreshTokenValue });


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