export const appModules = [
  {
    id: 'auth',
    label: 'Auth & Users',
    path: '/users',
    status: 'ready',
    description: 'Autentikasi, otorisasi, dan manajemen pengguna.',
  },
  {
    id: 'kebun',
    label: 'Kebun Sawit',
    path: '/kebun',
    status: 'ready',
    description: 'Manajemen data kebun dan assignment operasional.',
  },
  {
    id: 'panen',
    label: 'Hasil Panen',
    path: '/panen',
    status: 'base',
    description: 'Pelaporan, approval, dan riwayat hasil panen.',
  },
  {
    id: 'pengiriman',
    label: 'Pengiriman',
    path: '/pengiriman',
    status: 'base',
    description: 'Penugasan pengiriman dan tracking status supir.',
  },
  {
    id: 'pembayaran',
    label: 'Pembayaran',
    path: '/pembayaran',
    status: 'base',
    description: 'Payroll, wallet, dan konfigurasi upah.',
  },
  {
    id: 'notifikasi',
    label: 'Notifikasi',
    path: '/notifikasi',
    status: 'base',
    description: 'Kotak masuk, broadcast, dan event notification.',
  },
];
