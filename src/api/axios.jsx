import axios from 'axios';

const authApiBaseURL = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:8080/auth-service';
const plantationApiBaseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/api';
const AUTH_USER_KEY = 'authUser';

const publicAuthPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh', '/auth/logout'];

const attachAccessToken = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

const persistAuthData = (authData) => {
  if (!authData?.accessToken || !authData?.refreshToken) return;

  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);
  if (authData.user) localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));
};

const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(AUTH_USER_KEY);
};

const refreshClient = axios.create({
  baseURL: authApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = axios.create({
  baseURL: plantationApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authApi = axios.create({
  baseURL: authApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(attachAccessToken);
authApi.interceptors.request.use(attachAccessToken);

let refreshPromise = null;

const shouldRefresh = (error) => {
  const status = error.response?.status;
  const url = error.config?.url || '';
  return status === 401 && !error.config?._retry && !publicAuthPaths.some((path) => url.includes(path));
};

const refreshAccessToken = async () => {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) throw new Error('Refresh token is not available');

  const response = await refreshClient.post('/auth/refresh', { refreshToken: refreshTokenValue });
  const authData = unwrapApiData(response);
  persistAuthData(authData);
  return authData.accessToken;
};

const handleAuthError = async (error) => {
  if (!shouldRefresh(error)) return Promise.reject(error);

  try {
    error.config._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const accessToken = await refreshPromise;
    error.config.headers = {
      ...error.config.headers,
      Authorization: `Bearer ${accessToken}`,
    };
    return error.config.baseURL === plantationApiBaseURL ? api(error.config) : authApi(error.config);
  } catch (refreshError) {
    clearAuthData();
    return Promise.reject(refreshError);
  }
};

api.interceptors.response.use((response) => response, handleAuthError);
authApi.interceptors.response.use((response) => response, handleAuthError);

export const unwrapApiData = (response) => response.data?.data ?? response.data;

// Auth API
export const login = (payload) => authApi.post('/auth/login', payload);
export const register = (payload) => authApi.post('/auth/register', payload);
export const loginWithGoogle = (payload) => authApi.post('/auth/google', payload);
export const refreshToken = (refreshTokenValue) =>
  authApi.post('/auth/refresh', { refreshToken: refreshTokenValue });
export const logout = (refreshTokenValue) =>
  authApi.post('/auth/logout', { refreshToken: refreshTokenValue });

// Current user
export const getMyProfile = () => authApi.get('/users/me');
export const updateMyProfile = (payload) => authApi.put('/users/me', payload);

// Admin user management
export const searchUsers = (params) => authApi.get('/admin/users', { params });
export const getUserDetail = (userId) => authApi.get(`/admin/users/${userId}`);
export const assignUserMandor = (buruhId, mandorId) =>
  authApi.put(`/admin/users/${buruhId}/assign-mandor/${mandorId}`);
export const unassignUserMandor = (buruhId) =>
  authApi.put(`/admin/users/${buruhId}/unassign-mandor`);
export const deleteUser = (userId) => authApi.delete(`/admin/users/${userId}`);

// Mandor
export const getMyBawahan = (params) => authApi.get('/mandor/bawahan', { params });

// Internal communication preview
export const internalSearchUsers = (params) => authApi.get('/internal/user/search', { params });
export const internalGetUserDetail = (userId) => authApi.get(`/internal/user/${userId}`);


// Kebun API
export const getKebunList = (params) => api.get('/kebun', { params });
export const getKebunDetail = (kode, params) => api.get(`/kebun/${kode}`, { params });
export const createKebun = (data) => api.post('/kebun', data);
export const updateKebun = (kode, data) => api.put(`/kebun/${kode}`, data);
export const deleteKebun = (kode) => api.delete(`/kebun/${kode}`);

// Mandor
export const assignMandor = (kode, mandorId) => api.post(`/kebun/${kode}/mandor`, { mandorId });
export const unassignMandor = (kode, target) => api.delete(`/kebun/${kode}/mandor`, { params: { target } });

// Supir
export const assignSupir = (kode, supirId) => api.post(`/kebun/${kode}/supir?supirId=${supirId}`);
export const unassignSupir = (kode, supirId, target) => api.delete(`/kebun/${kode}/supir/${supirId}`, { params: { target } });

export default api;
