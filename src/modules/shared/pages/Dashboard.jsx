import { Link } from 'react-router-dom';
import { appModules } from '../../../config/modules';
import { getAuthUser } from '../../auth/authStorage';

const MODULE_ICONS = {
  'Kebun Sawit': '🗺️',
  'Hasil Panen': '🌾',
  'Pengiriman': '🚛',
  'Pembayaran': '💰',
  'Notifikasi': '🔔',
};

const statCards = [
  { label: 'Total Kebun', value: '—', unit: 'kebun', icon: '🗺️', color: 'emerald' },
  { label: 'Panen Hari Ini', value: '—', unit: 'kg', icon: '🌾', color: 'lime' },
  { label: 'Pengiriman Aktif', value: '—', unit: 'truk', icon: '🚛', color: 'sky' },
  { label: 'Payroll Pending', value: '—', unit: 'item', icon: '💰', color: 'amber' },
];

const colorMap = {
  emerald: {
    bg: 'bg-[#0a1f12]',
    border: 'border-[#1a3a22]',
    text: 'text-[#4ade80]',
    dot: 'bg-[#4ade80]',
  },
  lime: {
    bg: 'bg-[#0f1f0a]',
    border: 'border-[#2a3a1a]',
    text: 'text-[#a3e635]',
    dot: 'bg-[#a3e635]',
  },
  sky: {
    bg: 'bg-[#0a1520]',
    border: 'border-[#1a2a3a]',
    text: 'text-[#38bdf8]',
    dot: 'bg-[#38bdf8]',
  },
  amber: {
    bg: 'bg-[#1f1500]',
    border: 'border-[#3a2a00]',
    text: 'text-[#fbbf24]',
    dot: 'bg-[#fbbf24]',
  },
};

export default function Dashboard() {
  const user = getAuthUser();

  const roleGradient = {
    ADMIN: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    MANDOR: 'from-sky-500/20 to-transparent border-sky-500/30 text-sky-400',
    BURUH: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    SUPIR: 'from-pink-500/20 to-transparent border-pink-500/30 text-pink-400',
  };

  const roleStyle = roleGradient[user?.role] || 'from-slate-500/20 to-transparent border-slate-500/30 text-slate-400';

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1a3a22] bg-[#060d09] p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/40 to-transparent" />

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#4a6b52]">
                Operational Console
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
                MySawit Control Center
              </h1>
              <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#6b8a72]">
                Platform manajemen perkebunan sawit terpadu — memantau panen, pengiriman,
                dan pembayaran dalam satu sistem terintegrasi.
              </p>
            </div>

            <div
              className={`hidden shrink-0 rounded-xl border bg-gradient-to-b px-4 py-3 text-right lg:block ${roleStyle}`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Role Aktif</p>
              <p className="mt-1 text-lg font-black">{user?.role || '—'}</p>
            </div>
          </div>

          {user && (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Pengguna', value: user.fullname || user.username },
                { label: 'Email', value: user.email, mono: true },
                { label: 'Role', value: user.role },
              ].map(({ label, value, mono }) => (
                <div key={label} className="rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">{label}</p>
                  <p
                    className={`mt-1 truncate text-[13px] font-bold text-white ${mono ? 'font-mono' : ''}`}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, unit, icon, color }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className={`rounded-xl border ${c.bg} ${c.border} px-4 py-4 transition-all duration-200 hover:scale-[1.01]`}
            >
              <div className="flex items-start justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#4a6b52]">{label}</p>
                <span className="text-xl">{icon}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-black ${c.text}`}>{value}</span>
                <span className="text-[11px] text-[#4a6b52]">{unit}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${c.dot} opacity-60`} />
                <span className="text-[10px] text-[#3a5c42]">Live data</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Module grid */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#3a5c42]">
          Modul Sistem
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {appModules.map((module) => (
            <Link
              key={module.id}
              className="group relative overflow-hidden rounded-xl border border-[#1a3a22] bg-[#080f0a] p-5 transition-all duration-200 hover:border-[#2a5a32] hover:bg-[#0a1a0f]"
              to={module.path}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#4ade80]/0 to-[#166534]/0 transition-all duration-300 group-hover:from-[#4ade80]/5 group-hover:to-[#166534]/5" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {MODULE_ICONS[module.label] || '📁'}
                  </span>
                  <h2 className="text-[15px] font-black text-white">{module.label}</h2>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-[9px] font-bold uppercase tracking-widest ${
                    module.status === 'ready'
                      ? 'bg-[#0a1f12] text-[#4ade80]'
                      : 'bg-[#1a1a1a] text-[#4a6b52]'
                  }`}
                >
                  {module.status}
                </span>
              </div>
              <p className="relative mt-3 text-[13px] leading-5 text-[#4a6b52]">{module.description}</p>

              <div className="relative mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#2a5a32] group-hover:text-[#4ade80] transition-colors">
                Buka modul
                <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 12 12">
                  <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
