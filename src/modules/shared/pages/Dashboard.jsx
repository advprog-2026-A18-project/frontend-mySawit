import { Link } from 'react-router-dom';
import { appModules, systemModules } from '../../../config/modules';
import { canAccess } from '../../../config/access';
import { getAuthUser } from '../../auth/authStorage';

const metricCards = [
  { label: 'Total Personnel', value: '1,248', helper: '+12% from last month', tone: 'green' },
  { label: 'Active Estates', value: '42', helper: 'High performance', tone: 'amber' },
  { label: 'Active Mandors', value: '156', helper: 'Target: 180 leaders', tone: 'blue' },
  { label: 'Pending Payroll', value: '$12,450', helper: 'Awaiting final approval', tone: 'green' },
];

const roleSummary = {
  ADMIN: {
    eyebrow: 'Real-Time Operations',
    title: 'Admin Command Center',
    subtitle: 'Oversee authentication, role assignment, plantation assets, and internal service visibility.',
  },
  MANDOR: {
    eyebrow: 'Field Operations',
    title: 'Mandor Control Desk',
    subtitle: 'Monitor bawahan, review harvest reports, and coordinate active field assignments.',
  },
  BURUH: {
    eyebrow: 'Harvest Session',
    title: 'Buruh Field Portal',
    subtitle: 'Submit harvest reports, track recent entries, and keep your profile data ready.',
  },
  SUPIR: {
    eyebrow: 'Transport Operations',
    title: 'Supir Logistics Console',
    subtitle: 'Track active manifests, route status, and operational transport updates.',
  },
};

const toneClass = {
  green: 'text-[#52ef8b]',
  amber: 'text-[#ffbd59]',
  blue: 'text-[#9ccfff]',
};

export default function Dashboard() {
  const user = getAuthUser();
  const summary = roleSummary[user?.role] || roleSummary.ADMIN;
  const availableModules = [...appModules, ...systemModules].filter((module) => canAccess(user?.role, module.roles));

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
            {summary.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4f4f4] lg:text-5xl">
            {summary.title}
          </h1>
          <p className="mt-3 max-w-3xl text-[17px] leading-7 text-[#c2cec0]">
            {summary.subtitle}
          </p>
        </div>
        <Link
          className="inline-flex h-14 items-center justify-center rounded-[8px] bg-[#35d174] px-7 text-[15px] font-black text-[#06120b] shadow-[0_18px_42px_rgba(53,209,116,0.18)]"
          to="/users/me"
        >
          Open Profile
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <article key={card.label} className="rounded-[8px] border border-[#303030] bg-[#181818] p-6">
            <p className="font-mono text-[12px] font-black uppercase tracking-[0.2em] text-[#b9c3b8]">
              {card.label}
            </p>
            <p className={`mt-5 text-4xl font-black tracking-tight ${toneClass[card.tone]}`}>
              {card.value}
            </p>
            <p className="mt-4 text-[13px] font-bold text-[#cbd6c9]">{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.75fr]">
        <div className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
          <div
            className="relative min-h-[360px] bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg,rgba(12,12,12,0.22),rgba(12,12,12,0.94)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80')",
            }}
          >
            <div className="absolute left-6 top-6 rounded-[8px] border border-[#303030] bg-[#151515]/90 px-5 py-4 backdrop-blur">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#b9c3b8]">
                Current View
              </p>
              <p className="mt-1 text-[18px] font-black text-[#f4f4f4]">Selangor Block B-12</p>
            </div>
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[10px] border-[#287d49] bg-[#52ef8b] text-[13px] font-black text-[#06120b]">
              Live
            </div>
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#303030] bg-[#181818] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] font-black text-[#f4f4f4]">Accessible Modules</h2>
            <span className="rounded-full bg-[#102518] px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
              {user?.role || 'Role'}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {availableModules.map((module) => (
              <Link
                key={module.id}
                className="flex items-center justify-between rounded-[8px] border border-[#2b2b2b] bg-[#202020] px-4 py-3 transition hover:border-[#52ef8b]"
                to={module.path}
              >
                <div>
                  <p className="text-[14px] font-black text-[#f4f4f4]">{module.label}</p>
                  <p className="mt-1 text-[12px] text-[#9da89b]">{module.description}</p>
                </div>
                <span className="text-[#52ef8b]">→</span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b2b2b] px-6 py-5">
          <h2 className="text-2xl font-black text-[#f4f4f4]">Recent Activity</h2>
          <div className="flex gap-2">
            {['All', 'Pending', 'In-Transit'].map((status, index) => (
              <span key={status} className={`rounded-[6px] px-3 py-1 text-[12px] font-black ${index === 0 ? 'bg-[#52ef8b] text-[#06120b]' : 'bg-[#242424] text-[#cbd6c9]'}`}>
                {status}
              </span>
            ))}
          </div>
        </div>
        <div className="grid divide-y divide-[#242424]">
          {[
            ['#MS-0045861', 'Arif Pratama', 'North Estate / B-12', '1,240 kg', 'Approved'],
            ['#MS-0045862', 'Siti Aminah', 'West Estate / W-03', '890 kg', 'Pending'],
            ['#MS-0045863', 'Taufik Hidayat', 'Central Estate / C-04', '2,105 kg', 'In-Transit'],
          ].map(([id, mandor, block, tonnage, status]) => (
            <div key={id} className="grid gap-3 px-6 py-5 text-[14px] md:grid-cols-[1fr_1fr_1.5fr_1fr_1fr]">
              <span className="font-mono font-black text-[#e8eee6]">{id}</span>
              <span className="font-bold text-[#f4f4f4]">{mandor}</span>
              <span className="text-[#cbd6c9]">{block}</span>
              <span className="font-black text-[#f4f4f4]">{tonnage}</span>
              <span className="font-mono text-[12px] font-black uppercase tracking-[0.12em] text-[#52ef8b]">{status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
