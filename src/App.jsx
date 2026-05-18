import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './modules/auth/pages/Register';
import Login from './modules/auth/pages/Login';
import Users from './modules/auth/pages/Users';
import Profile from './modules/auth/pages/Profile';
import Bawahan from './modules/mandor/pages/Bawahan';
import InternalUsers from './modules/internal/pages/InternalUsers';
import KebunList from './modules/manajemen_kebun_sawit/pages/KebunList';
import KebunForm from './modules/manajemen_kebun_sawit/pages/KebunForm';
import KebunDetail from './modules/manajemen_kebun_sawit/pages/KebunDetail';
import AppLayout from './layouts/AppLayout';
import Dashboard from './modules/shared/pages/Dashboard';
import ModulePlaceholder from './modules/shared/pages/ModulePlaceholder';
import { isAuthenticated } from './modules/auth/authStorage';

function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/users/me" element={<Profile />} />
          <Route path="/mandor/bawahan" element={<Bawahan />} />
          <Route path="/internal/users" element={<InternalUsers />} />

          <Route path="/kebun" element={<KebunList />} />
          <Route path="/kebun/new" element={<KebunForm />} />
          <Route path="/kebun/:kode/edit" element={<KebunForm />} />
          <Route path="/kebun/:kode" element={<KebunDetail />} />

          <Route
            path="/panen"
            element={
              <ModulePlaceholder
                title="Manajemen Hasil Panen"
                description="Base page untuk pelaporan hasil panen, approval mandor, rejection reason, dan riwayat panen."
                checklist={['Buruh submit hasil panen', 'Mandor approval/rejection', 'Filter tanggal dan status']}
              />
            }
          />
          <Route
            path="/pengiriman"
            element={
              <ModulePlaceholder
                title="Manajemen Pengiriman"
                description="Base page untuk assignment supir, tracking status pengiriman, dan approval hasil pengiriman."
                checklist={['Assign supir', 'Status Memuat/Mengirim/Tiba', 'Approval dan rejection mandor/admin']}
              />
            }
          />
          <Route
            path="/pembayaran"
            element={
              <ModulePlaceholder
                title="Manajemen Pembayaran"
                description="Base page untuk payroll, wallet, konfigurasi upah, dan approval pembayaran."
                checklist={['Payroll pending/accepted/rejected', 'Wallet SawitDollar', 'Payment gateway sandbox']}
              />
            }
          />
          <Route
            path="/notifikasi"
            element={
              <ModulePlaceholder
                title="Notifikasi"
                description="Base page untuk inbox notifikasi, broadcast admin, dan event notification antarmodul."
                checklist={['Unread/read notification', 'Broadcast admin', 'Event-based notification']}
              />
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
