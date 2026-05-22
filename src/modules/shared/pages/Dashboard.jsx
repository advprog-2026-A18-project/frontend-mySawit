import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getKebunList,
  getPanenList,
  getPengirimanByMandor,
  getPengirimanBySupir,
  getPengirimanList,
  searchUsers,
  unwrapApiData,
} from '../../../api/axios';
import { appModules, systemModules } from '../../../config/modules';
import { canAccess } from '../../../config/access';
import { getAuthUser } from '../../auth/authStorage';

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
  red: 'text-[#fca5a5]',
};

const pageContent = (payload) => (Array.isArray(payload) ? payload : payload?.content || []);
const totalElements = (payload) => (Array.isArray(payload) ? payload.length : payload?.totalElements ?? pageContent(payload).length);
const getDate = (item) => item.tanggalPengiriman?.slice(0, 10) || item.tanggalPanen || '-';
const sameId = (left, right) => left && right && String(left) === String(right);
const statusTone = (status) => (['APPROVED', 'DISETUJUI', 'Tiba di Tujuan'].includes(status) ? 'green' : ['REJECTED', 'DITOLAK'].includes(status) ? 'red' : 'amber');

export default function Dashboard() {
  const user = getAuthUser();
  const summary = roleSummary[user?.role] || roleSummary.ADMIN;
  const availableModules = [...appModules, ...systemModules].filter((module) => canAccess(user?.role, module.roles));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [data, setData] = useState({
    kebuns: [],
    panen: [],
    panenTotal: 0,
    shipments: [],
    personnelTotal: null,
  });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const calls = [
        getPanenList({
          buruh_id: user?.role === 'BURUH' ? user?.id : undefined,
          page: 0,
          size: 100,
        }).catch(() => null),
      ];

      if (user?.role === 'ADMIN' || user?.role === 'MANDOR') {
        calls.push(getKebunList({}).catch(() => null));
      } else {
        calls.push(Promise.resolve(null));
      }

      if (user?.role === 'SUPIR') {
        calls.push(getPengirimanBySupir({ supirId: user?.id }).catch(() => null));
      } else if (user?.role === 'MANDOR') {
        calls.push(getPengirimanByMandor({ mandorId: user?.id }).catch(() => null));
      } else {
        calls.push(getPengirimanList({}).catch(() => null));
      }

      if (user?.role === 'ADMIN') {
        calls.push(searchUsers({ page: 0, size: 1 }).catch(() => null));
      } else {
        calls.push(Promise.resolve(null));
      }

      const [panenResponse, kebunResponse, pengirimanResponse, usersResponse] = await Promise.all(calls);
      const panenPayload = panenResponse ? unwrapApiData(panenResponse) : [];
      const kebunPayload = kebunResponse ? unwrapApiData(kebunResponse) : [];
      const pengirimanPayload = pengirimanResponse ? unwrapApiData(pengirimanResponse) : [];
      const usersPayload = usersResponse ? unwrapApiData(usersResponse) : null;

      setData({
        kebuns: Array.isArray(kebunPayload) ? kebunPayload : pageContent(kebunPayload),
        panen: pageContent(panenPayload),
        panenTotal: totalElements(panenPayload),
        shipments: Array.isArray(pengirimanPayload) ? pengirimanPayload : pageContent(pengirimanPayload),
        personnelTotal: usersPayload ? totalElements(usersPayload) : null,
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Gagal memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const assignedKebuns = useMemo(() => {
    if (user?.role !== 'MANDOR') return data.kebuns;
    return data.kebuns.filter((item) => sameId(item.mandorId, user?.id));
  }, [data.kebuns, user?.id, user?.role]);

  const metrics = useMemo(() => {
    const approvedPanen = data.panen.filter((item) => item.status === 'APPROVED').length;
    const pendingPanen = data.panen.filter((item) => item.status === 'REPORTED').length;
    const totalKgPanen = data.panen.reduce((sum, item) => sum + Number(item.kuantitasBerat || 0), 0);
    const totalKgKirim = data.shipments.reduce((sum, item) => sum + Number(item.totalBeratKg || 0), 0);
    const activeShipments = data.shipments.filter((item) => item.statusPengiriman !== 'Tiba di Tujuan').length;
    const pendingAdmin = data.shipments.filter((item) => item.statusPersetujuanMandor === 'DISETUJUI' && item.statusPersetujuanAdmin === 'PENDING').length;

    if (user?.role === 'ADMIN') {
      return [
        { label: 'Total Personnel', value: data.personnelTotal ?? '-', helper: 'User terdaftar di Auth', tone: 'green' },
        { label: 'Active Estates', value: data.kebuns.length, helper: `${data.kebuns.filter((item) => item.mandorId).length} sudah punya mandor`, tone: 'amber' },
        { label: 'Harvest Reports', value: data.panenTotal, helper: `${approvedPanen} laporan approved`, tone: 'blue' },
        { label: 'Admin Review', value: pendingAdmin, helper: 'Pengiriman menunggu approval admin', tone: pendingAdmin ? 'amber' : 'green' },
      ];
    }
    if (user?.role === 'MANDOR') {
      return [
        { label: 'Kebun Assigned', value: assignedKebuns.length, helper: 'Area tanggung jawab mandor', tone: 'green' },
        { label: 'Panen Pending', value: pendingPanen, helper: 'Laporan menunggu review', tone: pendingPanen ? 'amber' : 'green' },
        { label: 'Approved Panen', value: approvedPanen, helper: `${totalKgPanen} kg terlihat`, tone: 'blue' },
        { label: 'Pengiriman Aktif', value: activeShipments, helper: `${totalKgKirim} kg dalam daftar`, tone: activeShipments ? 'amber' : 'green' },
      ];
    }
    if (user?.role === 'BURUH') {
      return [
        { label: 'Laporan Saya', value: data.panenTotal, helper: 'Total laporan panen', tone: 'green' },
        { label: 'Total Kg', value: `${totalKgPanen} kg`, helper: 'Akumulasi laporan terlihat', tone: 'blue' },
        { label: 'Menunggu Review', value: pendingPanen, helper: 'Status REPORTED', tone: pendingPanen ? 'amber' : 'green' },
        { label: 'Approved', value: approvedPanen, helper: 'Disetujui mandor', tone: 'green' },
      ];
    }
    return [
      { label: 'Pengiriman Saya', value: data.shipments.length, helper: 'Manifest supir', tone: 'green' },
      { label: 'Muatan Terlihat', value: `${totalKgKirim} kg`, helper: 'Total berat pengiriman', tone: 'blue' },
      { label: 'Masih Berjalan', value: activeShipments, helper: 'Belum tiba tujuan', tone: activeShipments ? 'amber' : 'green' },
      { label: 'Menunggu Mandor', value: data.shipments.filter((item) => item.statusPersetujuanMandor === 'PENDING').length, helper: 'Perlu review mandor', tone: 'amber' },
    ];
  }, [assignedKebuns.length, data, user?.role]);

  const recentActivity = useMemo(() => {
    const panenActivities = data.panen.map((item) => ({
      id: item.id,
      actor: item.berita || item.buruhId || 'Panen',
      context: 'Harvest report',
      amount: `${item.kuantitasBerat || 0} kg`,
      status: item.status,
      date: item.tanggalPanen,
    }));
    const shipmentActivities = data.shipments.map((item) => ({
      id: item.id,
      actor: item.namaMandor || item.mandorId || 'Mandor',
      context: `${item.namaSupir || item.supirId || 'Supir'} · ${item.statusPengiriman || '-'}`,
      amount: `${item.totalBeratKg || 0} kg`,
      status: item.statusPersetujuanAdmin !== 'PENDING' ? item.statusPersetujuanAdmin : item.statusPersetujuanMandor,
      date: getDate(item),
    }));
    return [...shipmentActivities, ...panenActivities]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 6);
  }, [data.panen, data.shipments]);

  const currentKebun = user?.role === 'MANDOR' ? assignedKebuns[0] : data.kebuns[0];

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
        {metrics.map((card) => (
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

      {message && (
        <div className="rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] font-bold text-red-300">
          {message}
        </div>
      )}

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
              <p className="mt-1 text-[18px] font-black text-[#f4f4f4]">
                {currentKebun?.namaKebun || (loading ? 'Memuat data...' : user?.role === 'MANDOR' ? 'Belum ada kebun assigned' : 'Belum ada kebun')}
              </p>
              <p className="mt-1 text-[12px] font-bold text-[#cbd6c9]">
                {currentKebun ? `${currentKebun.kodeKebun} · ${currentKebun.luasHektare} Ha` : user?.role === 'MANDOR' ? 'Admin perlu assign kebun ke akun mandor ini.' : 'Tambahkan data kebun untuk memunculkan area.'}
              </p>
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
          <span className="rounded-[6px] bg-[#242424] px-3 py-1 text-[12px] font-black text-[#cbd6c9]">
            {recentActivity.length} aktivitas
          </span>
        </div>
        <div className="grid divide-y divide-[#242424]">
          {recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center text-[#9aa79a]">
              {loading ? 'Memuat aktivitas...' : 'Belum ada aktivitas operasional.'}
            </div>
          ) : recentActivity.map((item) => (
            <div key={`${item.context}-${item.id}`} className="grid gap-3 px-6 py-5 text-[14px] md:grid-cols-[1fr_1fr_1.5fr_1fr_1fr]">
              <span className="font-mono font-black text-[#e8eee6]">{String(item.id).slice(0, 8)}</span>
              <span className="font-bold text-[#f4f4f4]">{item.actor}</span>
              <span className="text-[#cbd6c9]">{item.context}</span>
              <span className="font-black text-[#f4f4f4]">{item.amount}</span>
              <span className={`font-mono text-[12px] font-black uppercase tracking-[0.12em] ${toneClass[statusTone(item.status)]}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
