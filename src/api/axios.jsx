import axios from 'axios';

const api = axios.create({
  // Tembak ke API Gateway Anda yang sudah di-expose di docker-compose
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;