import { ALL_ROLES, ROLES } from './access';

export const appModules = [
  {
    id: 'auth',
    label: 'Admin Panel',
    path: '/users',
    status: 'ready',
    description: 'Autentikasi, otorisasi, dan manajemen pengguna.',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'kebun',
    label: 'Field Assets',
    path: '/kebun',
    status: 'ready',
    description: 'Manajemen data kebun dan assignment operasional.',
    roles: [ROLES.ADMIN, ROLES.MANDOR],
  },
  {
    id: 'panen',
    label: 'Buruh Portal',
    path: '/panen',
    status: 'base',
    description: 'Pelaporan, approval, dan riwayat hasil panen.',
    roles: [ROLES.BURUH, ROLES.MANDOR],
  },
  {
    id: 'pengiriman',
    label: 'Logistics',
    path: '/pengiriman',
    status: 'base',
    description: 'Penugasan pengiriman dan tracking status supir.',
    roles: [ROLES.SUPIR, ROLES.ADMIN, ROLES.MANDOR],
  },
  {
    id: 'pembayaran',
    label: 'Financials',
    path: '/pembayaran',
    status: 'base',
    description: 'Payroll, wallet, dan konfigurasi upah.',
    roles: [ROLES.ADMIN],
  },
  {
    id: 'notifikasi',
    label: 'Notifikasi',
    path: '/notifikasi',
    status: 'base',
    description: 'Kotak masuk, broadcast, dan event notification.',
    roles: ALL_ROLES,
  },
];

export const systemModules = [
  {
    id: 'profile',
    label: 'My Profile',
    path: '/users/me',
    status: 'ready',
    description: 'Profil dan data akun pengguna login.',
    roles: ALL_ROLES,
  },
  {
    id: 'mandor',
    label: 'Mandor Tasks',
    path: '/mandor/bawahan',
    status: 'ready',
    description: 'Daftar bawahan mandor.',
    roles: [ROLES.MANDOR],
  },
  {
    id: 'internal',
    label: 'Internal API',
    path: '/internal/users',
    status: 'ready',
    description: 'Preview endpoint internal service-to-service.',
    roles: [ROLES.ADMIN],
  },
];
