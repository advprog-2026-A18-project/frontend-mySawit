import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../api/axios';
import { appModules, systemModules } from '../config/modules';
import { canAccess } from '../config/access';
import { clearAuthSession, getAuthUser, getRefreshToken } from '../modules/auth/authStorage';

const iconPath = {
  dashboard: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-11h6V4h-6v5Z',
  users: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0H4Zm16-11h2v3h3v2h-3v3h-2v-3h-3v-2h3V9Z',
  field: 'M4 6h16v5H4V6Zm0 7h7v5H4v-5Zm9 0h7v5h-7v-5Zm2-9 3-2 3 2-3 2-3-2Z',
  harvest: 'M12 3c3 3 4.5 5.8 4.5 8.4A4.5 4.5 0 0 1 12 16a4.5 4.5 0 0 1-4.5-4.6C7.5 8.8 9 6 12 3Zm-7 17c2.7-2 4.8-2.5 7-2.5s4.3.5 7 2.5H5Z',
  truck: 'M3 6h11v8H3V6Zm11 3h4l3 3v2h-7V9ZM7 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  wallet: 'M4 7h14a2 2 0 0 1 2 2v2h-5a3 3 0 0 0 0 6h5v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm11 6h6v2h-6a1 1 0 0 1 0-2ZM5 4h11v2H5V4Z',
  bell: 'M12 22a2.5 2.5 0 0 0 2.5-2h-5A2.5 2.5 0 0 0 12 22Zm7-5H5l2-3V9a5 5 0 0 1 10 0v5l2 3Z',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z',
  internal: 'M4 5h16v4H4V5Zm0 6h16v8H4v-8Zm3 3v2h5v-2H7Zm8 0v2h2v-2h-2Z',
  logout: 'M4 4h8v2H6v12h6v2H4V4Zm11 4 5 4-5 4v-3H9v-2h6V8Z',
};

const moduleIcon = {
  auth: 'users',
  kebun: 'field',
  panen: 'harvest',
  pengiriman: 'truck',
  pembayaran: 'wallet',
  notifikasi: 'bell',
  profile: 'profile',
  mandor: 'harvest',
  internal: 'internal',
  grpc: 'internal',
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d={iconPath[name]} />
    </svg>
  );
}

const navLinkClass = ({ isActive }) =>
  [
    'group flex min-h-12 items-center gap-3 rounded-[8px] px-4 text-[14px] font-bold tracking-[0.05em] transition',
    isActive
      ? 'bg-[#35d174] text-[#06120b] shadow-[0_14px_34px_rgba(53,209,116,0.18)]'
      : 'text-[#c1cec0] hover:bg-[#222] hover:text-[#f4f4f4]',
  ].join(' ');

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const userRole = user?.role;
  const visibleModules = appModules.filter((module) => canAccess(userRole, module.roles));
  const visibleSystemModules = systemModules.filter((module) => canAccess(userRole, module.roles));
  const canQuickHarvest = visibleModules.some((module) => module.path === '/panen');

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuthSession();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#f3f3f3]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[#282828] bg-[#171717] lg:flex">
        <Link className="flex items-center gap-4 px-7 py-7" to="/dashboard">
          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#35d174] text-[#06120b]">
            <Icon name="truck" />
          </div>
          <div>
            <span className="block text-[18px] font-black leading-5">Plantation OS</span>
            <span className="block font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#c5d4c3]">
              Agri-Tech Precision
            </span>
          </div>
        </Link>

        <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-3">
          <NavLink className={navLinkClass} to="/dashboard">
            <Icon name="dashboard" />
            <span>Dashboard</span>
          </NavLink>

          {visibleModules.map((module) => (
            <NavLink key={module.id} className={navLinkClass} to={module.path}>
              <Icon name={moduleIcon[module.id]} />
              <span>{module.label}</span>
            </NavLink>
          ))}

          {visibleSystemModules.map((module) => (
            <NavLink key={module.id} className={navLinkClass} to={module.path}>
              <Icon name={moduleIcon[module.id]} />
              <span>{module.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#282828] p-5">
          {canQuickHarvest && (
            <Link
              className="mb-5 flex h-12 items-center justify-center rounded-[8px] bg-[#52ef8b] text-[14px] font-black tracking-[0.08em] text-[#06120b] transition hover:bg-[#7dffaa]"
              to="/panen"
            >
              Quick Harvest
            </Link>
          )}

          <div className="mb-5 flex items-center gap-3 rounded-[8px] border border-[#2d2d2d] bg-[#1f1f1f] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f3320] text-sm font-black text-[#52ef8b]">
              {(user?.fullname || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black">{user?.fullname || user?.username || 'Guest'}</p>
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#9aa79a]">
                {userRole || 'NO ROLE'}
              </p>
            </div>
          </div>

          <button
            className="flex h-11 w-full items-center gap-3 rounded-[8px] px-3 text-left text-[13px] font-bold text-[#cbd6c9] transition hover:bg-[#251b1b] hover:text-[#ffb4b4]"
            type="button"
            onClick={handleLogout}
          >
            <Icon name="logout" className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#262626] bg-[#101010]/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="text-2xl font-black text-[#52ef8b] lg:hidden" to="/dashboard">
              MySawit
            </Link>

            <nav className="hidden items-center gap-8 lg:flex">
              <Link className="text-[24px] font-black text-[#52ef8b]" to="/dashboard">
                MySawit
              </Link>
              <NavLink className={({ isActive }) => `border-b-2 py-2 text-[15px] font-bold ${isActive ? 'border-[#52ef8b] text-[#52ef8b]' : 'border-transparent text-[#cbd6c9]'}`} to="/dashboard">
                Dashboard
              </NavLink>
              {visibleModules.slice(0, 4).map((module) => (
                <NavLink
                  key={module.id}
                  className={({ isActive }) => `border-b-2 py-2 text-[15px] font-bold ${isActive ? 'border-[#52ef8b] text-[#52ef8b]' : 'border-transparent text-[#cbd6c9]'}`}
                  to={module.path}
                >
                  {module.label}
                </NavLink>
              ))}
            </nav>

            <nav className="flex gap-2 overflow-x-auto lg:hidden">
              {[...visibleModules, ...visibleSystemModules].slice(0, 4).map((module) => (
                <NavLink
                  key={module.id}
                  className={({ isActive }) =>
                    `flex h-9 shrink-0 items-center rounded-[8px] px-3 text-[12px] font-bold ${
                      isActive ? 'bg-[#35d174] text-[#06120b]' : 'bg-[#1d1d1d] text-[#cbd6c9]'
                    }`
                  }
                  to={module.path}
                >
                  {module.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link className="hidden rounded-full border border-[#303030] bg-[#1d1d1d] px-4 py-2 text-[12px] font-black uppercase tracking-[0.12em] text-[#cbd6c9] sm:block" to="/users/me">
                {userRole || 'Profile'}
              </Link>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#255b39] bg-[#102518] text-sm font-black text-[#52ef8b]">
                {(user?.fullname || user?.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-7 lg:px-8 lg:py-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
