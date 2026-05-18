import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../api/axios';
import { appModules } from '../config/modules';
import { clearAuthSession, getAuthUser, getRefreshToken } from '../modules/auth/authStorage';

const NAV_ICONS = {
  '/dashboard': '🌴',
  '/kebun': '🗺️',
  '/panen': '🌾',
  '/pengiriman': '🚛',
  '/pembayaran': '💰',
  '/notifikasi': '🔔',
  '/internal/users': '⚙️',
};

const navLinkClass = ({ isActive }) =>
  [
    'group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition-all duration-150',
    isActive
      ? 'bg-[#1a3a2a] text-[#4ade80] shadow-[inset_0_0_0_1px_rgba(74,222,128,0.2)]'
      : 'text-[#8a9a8e] hover:bg-[#0f1f17] hover:text-[#c8e6c9]',
  ].join(' ');

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = async () => {
    const refreshToken = getRefreshToken();

    try {
      if (refreshToken) await logout(refreshToken);
    } finally {
      clearAuthSession();
      navigate('/login', { replace: true });
    }
  };

  const roleColor = {
    ADMIN: 'text-[#fbbf24] bg-[#2a1f0a]',
    MANDOR: 'text-[#60a5fa] bg-[#0a1a2a]',
    BURUH: 'text-[#4ade80] bg-[#0a1f12]',
    SUPIR: 'text-[#f472b6] bg-[#1f0a16]',
  };

  const userRoleStyle = roleColor[user?.role] || 'text-[#8a9a8e] bg-[#0f1a14]';

  return (
    <div className="min-h-screen bg-[#060d09] text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#1a2e20] bg-[#080f0a] lg:flex">
        {/* Logo */}
        <Link
          className="flex items-center gap-3 border-b border-[#1a2e20] px-5 py-5 transition-opacity hover:opacity-80"
          to="/dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#166534] text-sm shadow-[0_0_12px_rgba(74,222,128,0.25)]">
            🌴
          </div>
          <div>
            <span className="block text-[15px] font-black tracking-tight text-white">MySawit</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4a6b52]">
              Control Center
            </span>
          </div>
        </Link>

        {/* API Badge */}
        <div className="mx-3 mt-3 rounded-lg bg-[#0a1a0f] px-3 py-2 border border-[#1a2e20]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">API Gateway</p>
          <p className="mt-0.5 truncate font-mono text-[11px] text-[#4a7c52]">
            {typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUTH_API_BASE_URL
              ? import.meta.env.VITE_AUTH_API_BASE_URL
              : 'localhost:8080/auth-service'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3a5c42]">
            Navigation
          </p>
          <NavLink className={navLinkClass} to="/dashboard">
            <span className="text-base leading-none">🌴</span>
            <span className="flex-1">Dashboard</span>
          </NavLink>

          {appModules.map((module) => (
            <NavLink key={module.id} className={navLinkClass} to={module.path}>
              <span className="text-base leading-none">{NAV_ICONS[module.path] || '📁'}</span>
              <span className="flex-1">{module.label}</span>
              {module.status === 'base' && (
                <span className="rounded bg-[#1a2e20] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#4a6b52]">
                  Base
                </span>
              )}
              {module.status === 'ready' && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
              )}
            </NavLink>
          ))}

          <div className="pt-3">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3a5c42]">
              System
            </p>
            <NavLink className={navLinkClass} to="/internal/users">
              <span className="text-base leading-none">⚙️</span>
              <span className="flex-1">Internal API</span>
            </NavLink>
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-[#1a2e20] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#166534] text-xs font-black text-white shadow-[0_0_10px_rgba(74,222,128,0.2)]">
              {(user?.fullname || user?.username || 'G').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-white">
                {user?.fullname || user?.username || 'Guest session'}
              </p>
              <span
                className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${userRoleStyle}`}
              >
                {user?.role || 'No role'}
              </span>
            </div>
          </div>
          <button
            className="mt-3 h-9 w-full rounded-lg border border-[#3a1a1a] bg-[#1a0a0a] text-[12px] font-bold text-[#f87171] transition-all hover:border-[#f87171] hover:bg-[#2a0f0f] active:scale-[0.98]"
            type="button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-20 border-b border-[#1a2e20] bg-[#080f0a]/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-2 font-black text-white lg:hidden" to="/dashboard">
              <span>🌴</span> MySawit
            </Link>

            {/* Breadcrumb area for desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <span className="text-[12px] font-semibold text-[#4a6b52]">System Online</span>
              </div>
            </div>

            {/* Mobile nav */}
            <nav className="flex gap-1.5 overflow-x-auto lg:hidden">
              {appModules.slice(0, 3).map((module) => (
                <NavLink
                  key={module.id}
                  className={({ isActive }) =>
                    `flex h-8 shrink-0 items-center rounded-md px-3 text-[12px] font-semibold transition ${
                      isActive
                        ? 'bg-[#1a3a2a] text-[#4ade80]'
                        : 'text-[#8a9a8e] hover:bg-[#0f1f17] hover:text-white'
                    }`
                  }
                  to={module.path}
                >
                  {module.label}
                </NavLink>
              ))}
            </nav>

            {/* Right side: user chip */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] text-xs font-black text-white">
                {(user?.fullname || user?.username || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">
                  {user?.fullname || user?.username || 'Guest'}
                </p>
                <p className="text-[10px] font-semibold text-[#4a6b52] leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
