import { useCallback, useEffect, useMemo, useState } from 'react';
import { approvePanen, createPanen, getPanenList, unwrapApiData } from '../../../api/axios';
import { getAuthUser } from '../../auth/authStorage';

const statusOptions = ['', 'REPORTED', 'APPROVED', 'REJECTED'];
const statusClass = {
  REPORTED: 'bg-[#2a220f] text-[#fbbf24]',
  APPROVED: 'bg-[#102518] text-[#52ef8b]',
  REJECTED: 'bg-[#351717] text-[#fca5a5]',
};

const inputClass =
  'h-11 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] px-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b] focus:ring-2 focus:ring-[#52ef8b]/15';

const unwrapPageContent = (payload) => (Array.isArray(payload) ? payload : payload?.content || []);

function getErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return 'Sesi login tidak valid atau sudah habis. Silakan logout, login ulang, lalu coba lagi.';
  }
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === 'Network Error') {
    return 'Tidak bisa menghubungi service Panen melalui gateway. Pastikan Docker Compose masih berjalan.';
  }
  return error.message || fallback;
}

function Message({ message }) {
  if (!message) return null;
  const className = message.type === 'error'
    ? 'border-red-500/30 bg-red-500/10 text-red-300'
    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  return <div className={`rounded-[8px] border px-4 py-3 text-[13px] font-bold ${className}`}>{message.text}</div>;
}

export default function PanenPage() {
  const user = getAuthUser();
  const isBuruh = user?.role === 'BURUH';
  const isMandor = user?.role === 'MANDOR';

  const [panen, setPanen] = useState([]);
  const [paging, setPaging] = useState(null);
  const [filters, setFilters] = useState({ status: '', tanggalPanen: '', page: 0, size: 10 });
  const [form, setForm] = useState({ kuantitasBerat: '', berita: '', buktiFoto: '' });
  const [review, setReview] = useState({ panenId: '', status: 'APPROVED', pesanPenolakan: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const totalKg = useMemo(() => panen.reduce((sum, item) => sum + Number(item.kuantitasBerat || 0), 0), [panen]);
  const approvedCount = useMemo(() => panen.filter((item) => item.status === 'APPROVED').length, [panen]);

  const loadPanen = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await getPanenList({
        status: nextFilters.status || undefined,
        tanggal_panen: nextFilters.tanggalPanen || undefined,
        buruh_id: isBuruh ? user?.id : undefined,
        page: nextFilters.page,
        size: nextFilters.size,
      });
      const data = unwrapApiData(response);
      setPanen(unwrapPageContent(data));
      setPaging(data);
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Gagal mengambil data panen.') });
    } finally {
      setLoading(false);
    }
  }, [filters, isBuruh, user?.id]);

  useEffect(() => { loadPanen(); }, [loadPanen]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value, page: 0 }));
  };

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateReview = (event) => {
    const { name, value } = event.target;
    setReview((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadPanen({ ...filters, page: 0 });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createPanen({
        buruhId: user?.id,
        kuantitasBerat: Number(form.kuantitasBerat),
        berita: form.berita,
        buktiFoto: form.buktiFoto.split('\n').map((item) => item.trim()).filter(Boolean),
      });
      setForm({ kuantitasBerat: '', berita: '', buktiFoto: '' });
      setMessage({ type: 'success', text: 'Laporan panen berhasil dibuat.' });
      await loadPanen();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Gagal membuat laporan panen.') });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await approvePanen(review.panenId, {
        status: review.status,
        pesanPenolakan: review.status === 'REJECTED' ? review.pesanPenolakan : null,
      });
      setReview({ panenId: '', status: 'APPROVED', pesanPenolakan: '' });
      setMessage({ type: 'success', text: 'Status panen berhasil diproses.' });
      await loadPanen();
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Gagal memproses approval panen.') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Harvest Operations</p>
          <h1 className="mt-2 text-4xl font-black text-[#f4f4f4]">Manajemen Hasil Panen</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#c2cec0]">
            Laporan buruh, filter status/tanggal, dan approval mandor lewat API Gateway.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#303030] bg-[#181818] px-5 py-4">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9aa79a]">Approved</p>
          <p className="mt-1 text-3xl font-black text-[#52ef8b]">{approvedCount}/{panen.length}</p>
        </div>
      </section>

      <Message message={message} />

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Total laporan', paging?.totalElements ?? panen.length],
          ['Total kg terlihat', `${totalKg} kg`],
          ['Role aktif', user?.role || '-'],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[8px] border border-[#303030] bg-[#181818] p-5">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9aa79a]">{label}</p>
            <p className="mt-3 text-2xl font-black text-[#f4f4f4]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {isBuruh && (
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleCreate}>
            <h2 className="text-xl font-black text-[#f4f4f4]">Buat Laporan Panen</h2>
            <div className="mt-4 grid gap-3">
              <input className={inputClass} min="1" name="kuantitasBerat" type="number" value={form.kuantitasBerat} onChange={updateForm} placeholder="Kuantitas berat kg" required />
              <input className={inputClass} name="berita" value={form.berita} onChange={updateForm} placeholder="Berita hasil panen" required />
              <textarea className="min-h-28 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] p-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b]" name="buktiFoto" value={form.buktiFoto} onChange={updateForm} placeholder="URL bukti foto, satu baris satu URL" required />
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={loading} type="submit">Submit Laporan</button>
            </div>
          </form>
        )}

        {isMandor && (
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleReview}>
            <h2 className="text-xl font-black text-[#f4f4f4]">Review Panen</h2>
            <div className="mt-4 grid gap-3">
              <select className={inputClass} name="panenId" value={review.panenId} onChange={updateReview} required>
                <option value="">Pilih laporan REPORTED</option>
                {panen.filter((item) => item.status === 'REPORTED').map((item) => (
                  <option key={item.id} value={item.id}>{item.tanggalPanen} · {item.kuantitasBerat} kg · {item.berita}</option>
                ))}
              </select>
              <select className={inputClass} name="status" value={review.status} onChange={updateReview}>
                <option value="APPROVED">Approve</option>
                <option value="REJECTED">Reject</option>
              </select>
              {review.status === 'REJECTED' && (
                <input className={inputClass} name="pesanPenolakan" value={review.pesanPenolakan} onChange={updateReview} placeholder="Alasan penolakan" required />
              )}
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={loading || !review.panenId} type="submit">Kirim Review</button>
            </div>
          </form>
        )}
      </section>

      <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleSearch}>
        <div className="grid gap-3 md:grid-cols-[180px_1fr_120px]">
          <select className={inputClass} name="status" value={filters.status} onChange={updateFilter}>
            {statusOptions.map((status) => <option key={status || 'ALL'} value={status}>{status || 'Semua status'}</option>)}
          </select>
          <input className={inputClass} name="tanggalPanen" type="date" value={filters.tanggalPanen} onChange={updateFilter} />
          <button className="h-11 rounded-[8px] bg-[#242424] px-4 text-[12px] font-black text-[#52ef8b]" type="submit">Filter</button>
        </div>
      </form>

      <section className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left">
            <thead className="bg-[#202020]">
              <tr>
                {['Tanggal', 'Buruh', 'Berat', 'Berita', 'Status', 'Bukti'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {panen.length === 0 ? (
                <tr><td className="px-5 py-8 text-center text-[#9aa79a]" colSpan="6">Belum ada data panen.</td></tr>
              ) : panen.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-4 text-[#dce6da]">{item.tanggalPanen || '-'}</td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[#9aa79a]">{item.buruhId}</td>
                  <td className="px-5 py-4 font-black text-[#f4f4f4]">{item.kuantitasBerat} kg</td>
                  <td className="px-5 py-4 text-[#cbd6c9]">{item.berita}</td>
                  <td className="px-5 py-4"><span className={`rounded-[8px] px-3 py-2 font-mono text-[11px] font-black ${statusClass[item.status] || 'bg-[#242424] text-[#cbd6c9]'}`}>{item.status}</span></td>
                  <td className="px-5 py-4 text-[#9ccfff]">{item.buktiFoto?.length || 0} file</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
