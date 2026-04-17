import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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