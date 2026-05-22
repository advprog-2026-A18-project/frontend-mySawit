import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createPengiriman,
  getPanenList,
  getPengirimanByMandor,
  getPengirimanBySupir,
  getPengirimanDisetujuiMandor,
  getPengirimanList,
  getSupirSatuKebun,
  reviewPengirimanByAdmin,
  reviewPengirimanByMandor,
  unwrapApiData,
  updatePengirimanStatus,
} from '../../../api/axios';
import { getAuthUser } from '../../auth/authStorage';

const statusPengiriman = ['', 'Memuat', 'Mengirim', 'Tiba di Tujuan'];
const statusClass = {
  Memuat: 'bg-[#2a220f] text-[#fbbf24]',
  Mengirim: 'bg-[#0a1520] text-[#9ccfff]',
  'Tiba di Tujuan': 'bg-[#102518] text-[#52ef8b]',
  PENDING: 'bg-[#242424] text-[#cbd6c9]',
  DISETUJUI: 'bg-[#102518] text-[#52ef8b]',
  DITOLAK: 'bg-[#351717] text-[#fca5a5]',
  PARTIAL_DITOLAK: 'bg-[#2a220f] text-[#fbbf24]',
};

const inputClass =
  'h-11 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] px-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b] focus:ring-2 focus:ring-[#52ef8b]/15';

const pageContent = (payload) => (Array.isArray(payload) ? payload : payload?.content || []);

function Message({ message }) {
  if (!message) return null;
  const className = message.type === 'error'
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  return <div className={`rounded-[8px] border px-4 py-3 text-[13px] font-bold ${className}`}>{message.text}</div>;
}

function Badge({ value }) {
  return <span className={`rounded-[8px] px-3 py-2 font-mono text-[11px] font-black ${statusClass[value] || 'bg-[#242424] text-[#cbd6c9]'}`}>{value || '-'}</span>;
}

export default function PengirimanPage() {
  const user = getAuthUser();
  const role = user?.role;
  const isAdmin = role === 'ADMIN';
  const isMandor = role === 'MANDOR';
  const isSupir = role === 'SUPIR';

  const [shipments, setShipments] = useState([]);
  const [approvedForAdmin, setApprovedForAdmin] = useState([]);
  const [supirOptions, setSupirOptions] = useState([]);
  const [approvedPanen, setApprovedPanen] = useState([]);
  const [filters, setFilters] = useState({ status: '', tanggal: '', searchNamaMandor: '' });
  const [createForm, setCreateForm] = useState({ supirId: '', hasilPanenIds: [] });
  const [reviewForm, setReviewForm] = useState({ pengirimanId: '', approved: true, alasanPenolakan: '', statusApproval: 'APPROVE', beratDiakuiKg: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const totalKg = useMemo(() => shipments.reduce((sum, item) => sum + Number(item.totalBeratKg || 0), 0), [shipments]);

  const loadSupportingData = useCallback(async () => {
    const calls = [];
    if (isMandor) {
      calls.push(getSupirSatuKebun(user?.id, {}).then((res) => setSupirOptions(unwrapApiData(res) || [])));
      calls.push(getPanenList({ status: 'APPROVED', page: 0, size: 100 }).then((res) => setApprovedPanen(pageContent(unwrapApiData(res)))));
    }
    if (isAdmin) {
      calls.push(getPengirimanDisetujuiMandor({
        tanggal: filters.tanggal || undefined,
        searchNamaMandor: filters.searchNamaMandor || undefined,
      }).then((res) => setApprovedForAdmin(unwrapApiData(res) || [])));
    }
    await Promise.all(calls);
  }, [filters.searchNamaMandor, filters.tanggal, isAdmin, isMandor, user?.id]);

  const loadShipments = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      let response;
      if (isSupir) {
        response = await getPengirimanBySupir({ supirId: user?.id, tanggal: filters.tanggal || undefined });
      } else if (isMandor) {
        response = await getPengirimanByMandor({ mandorId: user?.id, status: filters.status || undefined });
      } else {
        response = await getPengirimanList({
          status: filters.status || undefined,
          tanggal: filters.tanggal || undefined,
        });
      }
      setShipments(unwrapApiData(response) || []);
      await loadSupportingData();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengambil data pengiriman.' });
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.tanggal, isMandor, isSupir, loadSupportingData, user?.id]);

  useEffect(() => { loadShipments(); }, [loadShipments]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const updateCreateForm = (event) => {
    const { name, value, selectedOptions } = event.target;
    if (name === 'hasilPanenIds') {
      setCreateForm((current) => ({ ...current, hasilPanenIds: Array.from(selectedOptions).map((option) => option.value) }));
      return;
    }
    setCreateForm((current) => ({ ...current, [name]: value }));
  };

  const updateReviewForm = (event) => {
    const { name, value, type, checked } = event.target;
    setReviewForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createPengiriman(user?.id, {
        supirId: createForm.supirId,
        hasilPanenIds: createForm.hasilPanenIds,
      });
      setCreateForm({ supirId: '', hasilPanenIds: [] });
      setMessage({ type: 'success', text: 'Pengiriman berhasil dibuat.' });
      await loadShipments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal membuat pengiriman.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (shipment) => {
    const currentIndex = statusPengiriman.indexOf(shipment.statusPengiriman);
    const nextStatus = statusPengiriman[currentIndex + 1];
    if (!nextStatus) return;
    setLoading(true);
    setMessage(null);
    try {
      await updatePengirimanStatus(shipment.id, user?.id, nextStatus);
      setMessage({ type: 'success', text: `Status diperbarui menjadi ${nextStatus}.` });
      await loadShipments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal update status pengiriman.' });
    } finally {
      setLoading(false);
    }
  };

  const handleMandorReview = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await reviewPengirimanByMandor(reviewForm.pengirimanId, user?.id, {
        approved: reviewForm.approved,
        alasanPenolakan: reviewForm.approved ? null : reviewForm.alasanPenolakan,
      });
      setReviewForm((current) => ({ ...current, pengirimanId: '', alasanPenolakan: '' }));
      setMessage({ type: 'success', text: 'Review mandor berhasil diproses.' });
      await loadShipments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal review pengiriman.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReview = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await reviewPengirimanByAdmin(reviewForm.pengirimanId, {
        statusApproval: reviewForm.statusApproval,
        alasanPenolakan: reviewForm.alasanPenolakan || null,
        beratDiakuiKg: reviewForm.beratDiakuiKg ? Number(reviewForm.beratDiakuiKg) : null,
      });
      setReviewForm((current) => ({ ...current, pengirimanId: '', alasanPenolakan: '', beratDiakuiKg: '' }));
      setMessage({ type: 'success', text: 'Review admin berhasil diproses.' });
      await loadShipments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal review admin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Logistics</p>
          <h1 className="mt-2 text-4xl font-black text-[#f4f4f4]">Manajemen Pengiriman Hasil Panen</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#c2cec0]">
            Assignment supir, tracking status, approval mandor, dan approval admin via API Gateway.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#303030] bg-[#181818] px-5 py-4">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9aa79a]">Visible load</p>
          <p className="mt-1 text-3xl font-black text-[#52ef8b]">{totalKg} kg</p>
        </div>
      </section>

      <Message message={message} />

      <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={(event) => { event.preventDefault(); loadShipments(); }}>
        <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_120px]">
          <select className={inputClass} name="status" value={filters.status} onChange={updateFilter}>
            {statusPengiriman.map((status) => <option key={status || 'ALL'} value={status}>{status || 'Semua status'}</option>)}
          </select>
          <input className={inputClass} name="tanggal" type="date" value={filters.tanggal} onChange={updateFilter} />
          <input className={inputClass} name="searchNamaMandor" value={filters.searchNamaMandor} onChange={updateFilter} placeholder="Cari nama mandor (admin)" />
          <button className="h-11 rounded-[8px] bg-[#242424] px-4 text-[12px] font-black text-[#52ef8b]" type="submit">Filter</button>
        </div>
      </form>

      <section className="grid gap-5 xl:grid-cols-2">
        {isMandor && (
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleCreate}>
            <h2 className="text-xl font-black text-[#f4f4f4]">Tugaskan Supir</h2>
            <div className="mt-4 grid gap-3">
              <select className={inputClass} name="supirId" value={createForm.supirId} onChange={updateCreateForm} required>
                <option value="">Pilih supir satu kebun</option>
                {supirOptions.map((supir) => <option key={supir.id} value={supir.id}>{supir.nama}</option>)}
              </select>
              <select className="min-h-32 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] p-3 text-[13px] text-white outline-none focus:border-[#52ef8b]" multiple name="hasilPanenIds" value={createForm.hasilPanenIds} onChange={updateCreateForm} required>
                {approvedPanen.map((item) => <option key={item.id} value={item.id}>{item.tanggalPanen} · {item.kuantitasBerat} kg · {item.berita}</option>)}
              </select>
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={loading || !createForm.supirId || createForm.hasilPanenIds.length === 0} type="submit">Buat Pengiriman</button>
            </div>
          </form>
        )}

        {isMandor && (
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleMandorReview}>
            <h2 className="text-xl font-black text-[#f4f4f4]">Review Mandor</h2>
            <div className="mt-4 grid gap-3">
              <select className={inputClass} name="pengirimanId" value={reviewForm.pengirimanId} onChange={updateReviewForm} required>
                <option value="">Pilih pengiriman tiba</option>
                {shipments.filter((item) => item.statusPengiriman === 'Tiba di Tujuan' && item.statusPersetujuanMandor === 'PENDING').map((item) => <option key={item.id} value={item.id}>{item.namaSupir} · {item.totalBeratKg} kg</option>)}
              </select>
              <label className="flex items-center gap-3 text-[13px] font-bold text-[#cbd6c9]">
                <input checked={reviewForm.approved} name="approved" type="checkbox" onChange={updateReviewForm} />
                Approve pengiriman
              </label>
              {!reviewForm.approved && <input className={inputClass} name="alasanPenolakan" value={reviewForm.alasanPenolakan} onChange={updateReviewForm} placeholder="Alasan penolakan" required />}
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={loading || !reviewForm.pengirimanId} type="submit">Kirim Review</button>
            </div>
          </form>
        )}

        {isAdmin && (
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5 xl:col-span-2" onSubmit={handleAdminReview}>
            <h2 className="text-xl font-black text-[#f4f4f4]">Review Admin</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_180px_160px_1fr_140px]">
              <select className={inputClass} name="pengirimanId" value={reviewForm.pengirimanId} onChange={updateReviewForm} required>
                <option value="">Pilih pengiriman disetujui mandor</option>
                {approvedForAdmin.map((item) => <option key={item.id} value={item.id}>{item.namaMandor} · {item.namaSupir} · {item.totalBeratKg} kg</option>)}
              </select>
              <select className={inputClass} name="statusApproval" value={reviewForm.statusApproval} onChange={updateReviewForm}>
                <option value="APPROVE">Approve</option>
                <option value="REJECT">Reject</option>
                <option value="PARTIAL_REJECT">Partial Reject</option>
              </select>
              <input className={inputClass} name="beratDiakuiKg" type="number" value={reviewForm.beratDiakuiKg} onChange={updateReviewForm} placeholder="Berat diakui" />
              <input className={inputClass} name="alasanPenolakan" value={reviewForm.alasanPenolakan} onChange={updateReviewForm} placeholder="Alasan bila reject/partial" />
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={loading || !reviewForm.pengirimanId} type="submit">Review</button>
            </div>
          </form>
        )}
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left">
            <thead className="bg-[#202020]">
              <tr>
                {['Tanggal', 'Mandor', 'Supir', 'Berat', 'Status', 'Mandor Review', 'Admin Review', 'Aksi'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {shipments.length === 0 ? (
                <tr><td className="px-5 py-8 text-center text-[#9aa79a]" colSpan="8">Belum ada data pengiriman.</td></tr>
              ) : shipments.map((item) => {
                const currentIndex = statusPengiriman.indexOf(item.statusPengiriman);
                const nextStatus = statusPengiriman[currentIndex + 1];
                return (
                  <tr key={item.id}>
                    <td className="px-5 py-4 text-[#dce6da]">{item.tanggalPengiriman?.slice(0, 10) || '-'}</td>
                    <td className="px-5 py-4 text-[#cbd6c9]">{item.namaMandor}</td>
                    <td className="px-5 py-4 text-[#cbd6c9]">{item.namaSupir}</td>
                    <td className="px-5 py-4 font-black text-[#f4f4f4]">{item.totalBeratKg} kg</td>
                    <td className="px-5 py-4"><Badge value={item.statusPengiriman} /></td>
                    <td className="px-5 py-4"><Badge value={item.statusPersetujuanMandor} /></td>
                    <td className="px-5 py-4"><Badge value={item.statusPersetujuanAdmin} /></td>
                    <td className="px-5 py-4">
                      {isSupir && nextStatus ? (
                        <button className="rounded-[8px] bg-[#242424] px-3 py-2 text-[12px] font-black text-[#52ef8b] disabled:opacity-50" disabled={loading} type="button" onClick={() => handleStatusUpdate(item)}>
                          {nextStatus}
                        </button>
                      ) : <span className="text-[#6d796d]">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
