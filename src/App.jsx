import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './modules/auth/pages/Register';
import Login from './modules/auth/pages/Login';
import Users from './modules/auth/pages/Users';
import Profile from './modules/auth/pages/Profile';
import Bawahan from './modules/mandor/pages/Bawahan';
import InternalUsers from './modules/internal/pages/InternalUsers';
import GrpcIntegrations from './modules/internal/pages/GrpcIntegrations';
import KebunList from './modules/manajemen_kebun_sawit/pages/KebunList';
import KebunForm from './modules/manajemen_kebun_sawit/pages/KebunForm';
import KebunDetail from './modules/manajemen_kebun_sawit/pages/KebunDetail';
import PanenPage from './modules/panen/pages/PanenPage';
import PengirimanPage from './modules/pengiriman/pages/PengirimanPage';
import AppLayout from './layouts/AppLayout';
import Dashboard from './modules/shared/pages/Dashboard';
import ModulePlaceholder from './modules/shared/pages/ModulePlaceholder';
import AccessDenied from './modules/shared/pages/AccessDenied';
import { ALL_ROLES, ROLES, canAccess, getDefaultPathForRole } from './config/access';
import { getAuthUser, isAuthenticated } from './modules/auth/authStorage';

function ProtectedRoute() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function RoleRoute({ roles = ALL_ROLES, children }) {
  const user = getAuthUser();

  if (!canAccess(user?.role, roles)) {
    return <AccessDenied />;
  }

  return children;
}

function HomeRedirect() {
  const user = getAuthUser();
  return <Navigate to={getDefaultPathForRole(user?.role)} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/users"
            element={(
              <RoleRoute roles={[ROLES.ADMIN]}>
                <Users />
              </RoleRoute>
            )}
          />
          <Route path="/users/me" element={<Profile />} />
          <Route
            path="/mandor/bawahan"
            element={(
              <RoleRoute roles={[ROLES.MANDOR]}>
                <Bawahan />
              </RoleRoute>
            )}
          />
          <Route
            path="/internal/users"
            element={(
              <RoleRoute roles={[ROLES.ADMIN]}>
                <InternalUsers />
              </RoleRoute>
            )}
          />
          <Route
            path="/internal/grpc"
            element={(
              <RoleRoute roles={[ROLES.ADMIN]}>
                <GrpcIntegrations />
              </RoleRoute>
            )}
          />

          <Route
            path="/kebun"
            element={(
              <RoleRoute roles={[ROLES.ADMIN, ROLES.MANDOR]}>
                <KebunList />
              </RoleRoute>
            )}
          />
          <Route
            path="/kebun/new"
            element={(
              <RoleRoute roles={[ROLES.ADMIN]}>
                <KebunForm />
              </RoleRoute>
            )}
          />
          <Route
            path="/kebun/:kode/edit"
            element={(
              <RoleRoute roles={[ROLES.ADMIN]}>
                <KebunForm />
              </RoleRoute>
            )}
          />
          <Route
            path="/kebun/:kode"
            element={(
              <RoleRoute roles={[ROLES.ADMIN, ROLES.MANDOR]}>
                <KebunDetail />
              </RoleRoute>
            )}
          />

          <Route
            path="/panen"
            element={
              <RoleRoute roles={[ROLES.BURUH, ROLES.MANDOR]}>
                <PanenPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pengiriman"
            element={
              <RoleRoute roles={[ROLES.SUPIR, ROLES.ADMIN, ROLES.MANDOR]}>
                <PengirimanPage />
              </RoleRoute>
            }
          />
          <Route
            path="/pembayaran"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <ModulePlaceholder
                  title="Payment & Payroll Config"
                  eyebrow="Financials"
                  description="Payroll, wallet, konfigurasi upah, dan approval pembayaran."
                  checklist={['Payroll pending/accepted/rejected', 'Wallet SawitDollar', 'Payment gateway sandbox']}
                />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="/" element={<HomeRedirect />} />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
