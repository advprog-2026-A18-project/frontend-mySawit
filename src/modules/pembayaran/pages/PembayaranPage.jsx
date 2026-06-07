import { useEffect, useMemo, useState } from 'react';
import {
  acceptPayroll,
  confirmAdminWalletTopUp,
  createAdminWalletTopUp,
  getAdminWalletTopUps,
  getAllPayrolls,
  getPayrollRates,
  getWallet,
  payPayroll,
  rejectPayroll,
  unwrapApiData,
  updatePayrollRates,
} from '../../../api/axios';

const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const statusOptions = ['', 'PENDING', 'ACCEPTED', 'REJECTED', 'PAID'];
const topUpStatusOptions = ['', 'PENDING', 'COMPLETED'];
const adminWalletOwnerId = 'admin-default';

export default function PembayaranPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [rates, setRates] = useState(null);
  const [adminWallet, setAdminWallet] = useState(null);
  const [topUpRequests, setTopUpRequests] = useState([]);
  const [filters, setFilters] = useState({ status: '', startDate: '', endDate: '' });
  const [topUpFilter, setTopUpFilter] = useState('');
  const [rateForm, setRateForm] = useState({ buruhRatePerKg: '', supirRatePerKg: '', mandorRatePerKg: '' });
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const totals = useMemo(() => payrolls.reduce((acc, item) => {
    acc.count += 1;
    acc.amount += Number(item.amount || 0);
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { count: 0, amount: 0, PENDING: 0, ACCEPTED: 0, REJECTED: 0, PAID: 0 }), [payrolls]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };
      const [payrollResponse, rateResponse, topUpResponse, walletResponse] = await Promise.all([
        getAllPayrolls(params),
        getPayrollRates().catch(() => ({ data: null })),
        getAdminWalletTopUps({ status: topUpFilter || undefined }).catch(() => ({ data: [] })),
        getWallet(adminWalletOwnerId).catch(() => ({ data: null })),
      ]);
      const payrollData = unwrapApiData(payrollResponse);
      const rateData = unwrapApiData(rateResponse);
      const topUpData = unwrapApiData(topUpResponse);
      const walletData = unwrapApiData(walletResponse);
      setPayrolls(Array.isArray(payrollData) ? payrollData : []);
      setTopUpRequests(Array.isArray(topUpData) ? topUpData : []);
      setAdminWallet(walletData || null);
      setRates(rateData || null);
      if (rateData) {
        setRateForm({
          buruhRatePerKg: rateData.buruhRatePerKg ?? '',
          supirRatePerKg: rateData.supirRatePerKg ?? '',
          mandorRatePerKg: rateData.mandorRatePerKg ?? '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memuat data pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePayrollAction = async (action, payrollId) => {
    setError('');
    setNotice('');
    try {
      if (action === 'accept') await acceptPayroll(payrollId);
      if (action === 'pay') await payPayroll(payrollId);
      if (action === 'reject') {
        const reason = window.prompt('Alasan reject payroll');
        if (!reason) return;
        await rejectPayroll(payrollId, reason);
      }
      setNotice('Status payroll diperbarui.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal memperbarui payroll.');
    }
  };

  const handleRateSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      await updatePayrollRates({
        buruhRatePerKg: Number(rateForm.buruhRatePerKg),
        supirRatePerKg: Number(rateForm.supirRatePerKg),
        mandorRatePerKg: Number(rateForm.mandorRatePerKg),
      });
      setNotice('Konfigurasi rate payroll tersimpan.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan rate payroll.');
    }
  };

  const handleTopUpSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Nominal top-up harus lebih dari 0.');
      return;
    }

    try {
      await createAdminWalletTopUp(amount);
      setTopUpAmount('');
      setNotice('Request top-up admin wallet dibuat.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal membuat top-up admin wallet.');
    }
  };

  const handleConfirmTopUp = async (topUpRequestId) => {
    setError('');
    setNotice('');
    try {
      await confirmAdminWalletTopUp(topUpRequestId);
      setNotice('Top-up admin wallet berhasil dikonfirmasi.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengonfirmasi top-up.');
    }
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Financials</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4f4f4] lg:text-5xl">Manajemen Pembayaran</h1>
          <p className="mt-3 max-w-3xl text-[17px] leading-7 text-[#c2cec0]">Payroll buruh, supir, mandor, wallet, dan konfigurasi rate melalui API Gateway.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[8px] border border-[#303030] bg-[#171717] px-6 py-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#a8b5a7]">Total Payroll</p>
            <p className="mt-2 text-3xl font-black text-[#52ef8b]">{totals.count}</p>
          </div>
          <div className="rounded-[8px] border border-[#303030] bg-[#171717] px-6 py-4">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#a8b5a7]">Admin Wallet</p>
            <p className="mt-2 text-3xl font-black text-[#52ef8b]">{money.format(Number(adminWallet?.balance || 0))}</p>
          </div>
        </div>
      </section>

      {error && <div className="rounded-[8px] border border-[#852929] bg-[#2a0d0d] px-5 py-4 text-[14px] font-bold text-[#ffb0b0]">{error}</div>}
      {notice && <div className="rounded-[8px] border border-[#237a43] bg-[#0d2617] px-5 py-4 text-[14px] font-bold text-[#86f7aa]">{notice}</div>}

      <section className="grid gap-4 md:grid-cols-4">
        {[['PENDING', totals.PENDING], ['ACCEPTED', totals.ACCEPTED], ['PAID', totals.PAID], ['TOTAL AMOUNT', money.format(totals.amount)]].map(([label, value]) => (
          <div key={label} className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#a8b5a7]">{label}</p>
            <p className="mt-3 text-2xl font-black text-[#f4f4f4]">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
        <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_130px]">
          <select className="h-11 rounded-[8px] border border-[#294633] bg-[#0b2414] px-4 font-bold text-[#f4f4f4]" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            {statusOptions.map((option) => <option key={option} value={option}>{option || 'Semua status'}</option>)}
          </select>
          <input className="h-11 rounded-[8px] border border-[#294633] bg-[#0b2414] px-4 font-bold text-[#f4f4f4]" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          <input className="h-11 rounded-[8px] border border-[#294633] bg-[#0b2414] px-4 font-bold text-[#f4f4f4]" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          <button className="h-11 rounded-[8px] bg-[#35d174] font-black text-[#06120b]" onClick={loadData}>Filter</button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.42fr]">
        <div className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr] gap-3 border-b border-[#303030] bg-[#202020] px-5 py-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#a8b5a7]">
            <span>Owner</span><span>Source</span><span>Kg</span><span>Amount</span><span>Aksi</span>
          </div>
          {loading ? <p className="p-5 font-bold text-[#c2cec0]">Memuat payroll...</p> : payrolls.map((item) => (
            <div key={item.id} className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.4fr] gap-3 border-b border-[#252525] px-5 py-4 text-[14px] text-[#e8eee6]">
              <span className="font-bold">{item.ownerRole || item.userRole}<br /><small className="text-[#9aa69a]">{item.ownerId || item.userId}</small></span>
              <span>{item.sourceType || item.type}<br /><small className="text-[#9aa69a]">{item.status}</small></span>
              <span>{item.kilogram ?? item.kilogramSawit} kg</span>
              <span className="font-black text-[#52ef8b]">{money.format(Number(item.amount || 0))}</span>
              <span className="flex flex-wrap gap-2">
                {item.status === 'PENDING' && <button className="rounded-[8px] bg-[#35d174] px-3 py-2 font-black text-[#06120b]" onClick={() => handlePayrollAction('accept', item.id)}>Accept</button>}
                {item.status === 'PENDING' && <button className="rounded-[8px] border border-[#852929] px-3 py-2 font-black text-[#ffb0b0]" onClick={() => handlePayrollAction('reject', item.id)}>Reject</button>}
                {item.status === 'ACCEPTED' && <button className="rounded-[8px] bg-[#52ef8b] px-3 py-2 font-black text-[#06120b]" onClick={() => handlePayrollAction('pay', item.id)}>Pay</button>}
                {!['PENDING', 'ACCEPTED'].includes(item.status) && <span className="text-[#9aa69a]">-</span>}
              </span>
            </div>
          ))}
          {!loading && payrolls.length === 0 && <p className="p-5 font-bold text-[#c2cec0]">Belum ada payroll.</p>}
        </div>

        <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleRateSubmit}>
          <h2 className="text-2xl font-black text-[#f4f4f4]">Rate Payroll</h2>
          <div className="mt-5 space-y-4">
            {[['buruhRatePerKg', 'Buruh / kg'], ['supirRatePerKg', 'Supir / kg'], ['mandorRatePerKg', 'Mandor / kg']].map(([key, label]) => (
              <label key={key} className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#a8b5a7]">{label}</span>
                <input className="mt-2 h-11 w-full rounded-[8px] border border-[#294633] bg-[#0b2414] px-4 font-bold text-[#f4f4f4]" type="number" min="0" value={rateForm[key]} onChange={(e) => setRateForm({ ...rateForm, [key]: e.target.value })} />
              </label>
            ))}
          </div>
          <button className="mt-5 h-11 w-full rounded-[8px] bg-[#35d174] font-black text-[#06120b]" type="submit">Simpan Rate</button>
          {rates && <p className="mt-4 text-[13px] font-bold text-[#9aa69a]">Rate aktif tersinkron dari service pembayaran.</p>}
        </form>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.42fr_1fr]">
        <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleTopUpSubmit}>
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#52ef8b]">Admin Wallet</p>
          <h2 className="mt-2 text-2xl font-black text-[#f4f4f4]">Top-Up Saldo</h2>
          <p className="mt-2 text-[13px] font-bold leading-6 text-[#9aa69a]">
            Buat request top-up untuk menambah saldo wallet admin sebelum payroll dibayarkan.
          </p>
          <label className="mt-5 block">
            <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#a8b5a7]">Nominal</span>
            <input
              className="mt-2 h-11 w-full rounded-[8px] border border-[#294633] bg-[#0b2414] px-4 font-bold text-[#f4f4f4]"
              type="number"
              min="1"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="250000"
            />
          </label>
          <button className="mt-5 h-11 w-full rounded-[8px] bg-[#35d174] font-black text-[#06120b]" type="submit">
            Buat Request Top-Up
          </button>
        </form>

        <div className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
          <div className="flex flex-col gap-3 border-b border-[#303030] bg-[#202020] px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#a8b5a7]">Top-Up Requests</p>
              <p className="mt-1 text-[13px] font-bold text-[#9aa69a]">Konfirmasi request untuk menambah saldo admin wallet.</p>
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 rounded-[8px] border border-[#294633] bg-[#0b2414] px-3 font-bold text-[#f4f4f4]"
                value={topUpFilter}
                onChange={(e) => setTopUpFilter(e.target.value)}
              >
                {topUpStatusOptions.map((option) => <option key={option || 'ALL'} value={option}>{option || 'Semua status'}</option>)}
              </select>
              <button className="h-10 rounded-[8px] bg-[#35d174] px-4 font-black text-[#06120b]" onClick={loadData} type="button">
                Refresh
              </button>
            </div>
          </div>
          <div className="grid grid-cols-[0.8fr_1fr_1fr_1fr] gap-3 border-b border-[#303030] px-5 py-3 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#a8b5a7]">
            <span>ID</span><span>Amount</span><span>Status</span><span>Aksi</span>
          </div>
          {topUpRequests.map((request) => (
            <div key={request.id} className="grid grid-cols-[0.8fr_1fr_1fr_1fr] gap-3 border-b border-[#252525] px-5 py-4 text-[14px] text-[#e8eee6]">
              <span className="font-bold">#{request.id}</span>
              <span className="font-black text-[#52ef8b]">{money.format(Number(request.amount || 0))}</span>
              <span>{request.status}</span>
              <span>
                {request.status === 'PENDING' ? (
                  <button
                    className="rounded-[8px] bg-[#35d174] px-3 py-2 font-black text-[#06120b]"
                    onClick={() => handleConfirmTopUp(request.id)}
                    type="button"
                  >
                    Confirm
                  </button>
                ) : (
                  <span className="text-[#9aa69a]">-</span>
                )}
              </span>
            </div>
          ))}
          {topUpRequests.length === 0 && <p className="p-5 font-bold text-[#c2cec0]">Belum ada request top-up.</p>}
        </div>
      </section>
    </div>
  );
}
