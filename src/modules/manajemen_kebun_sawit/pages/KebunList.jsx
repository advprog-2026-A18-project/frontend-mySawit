import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteKebun, getKebunList, unwrapApiData } from '../../../api/axios';
import { getAuthUser } from '../../auth/authStorage';

const inputClass =
  'h-11 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] px-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b] focus:ring-2 focus:ring-[#52ef8b]/15';

const messageClass = {
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

function parseCoords(koordinat) {
  if (!koordinat) return [];
  if (Array.isArray(koordinat)) return koordinat;
  try {
    return JSON.parse(koordinat);
  } catch {
    return [];
  }
}

function coordSummary(koordinat) {
  const coords = parseCoords(koordinat);
  if (coords.length !== 4) return '-';
  const lats = coords.map((item) => Number(item.lat));
  const lngs = coords.map((item) => Number(item.lng));
  return `${Math.min(...lats)}, ${Math.min(...lngs)} -> ${Math.max(...lats)}, ${Math.max(...lngs)}`;
}

function Badge({ children, tone = 'default' }) {
  const toneClass = {
    green: 'bg-[#102518] text-[#52ef8b]',
    blue: 'bg-[#0a1520] text-[#9ccfff]',
    red: 'bg-[#351717] text-[#fca5a5]',
    default: 'bg-[#242424] text-[#cbd6c9]',
  };
  return (
    <span className={`inline-flex h-8 items-center rounded-[8px] px-3 font-mono text-[11px] font-black uppercase tracking-[0.14em] ${toneClass[tone]}`}>
      {children}
    </span>
  );
}

export default function KebunList() {
  const user = getAuthUser();
  const isAdmin = user?.role === 'ADMIN';

  const [kebuns, setKebuns] = useState([]);
  const [filters, setFilters] = useState({ searchNama: '', searchKode: '', sortBy: 'kodeKebun' });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState(null);

  const totalSupir = useMemo(
    () => kebuns.reduce((sum, kebun) => sum + (kebun.supirIds?.length || 0), 0),
    [kebuns],
  );
  const assignedMandor = useMemo(() => kebuns.filter((kebun) => kebun.mandorId).length, [kebuns]);

  const fetchKebuns = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await getKebunList({
        searchNama: nextFilters.searchNama || undefined,
        searchKode: nextFilters.searchKode || undefined,
        sortBy: nextFilters.sortBy || undefined,
      });
      const data = unwrapApiData(response);
      setKebuns(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengambil data kebun.' });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchKebuns(); }, [fetchKebuns]);

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchKebuns(filters);
  };

  const handleDelete = async (kodeKebun) => {
    if (!window.confirm(`Hapus kebun ${kodeKebun}?`)) return;
    setDeleting(kodeKebun);
    setMessage(null);
    try {
      await deleteKebun(kodeKebun);
      setMessage({ type: 'success', text: `Kebun ${kodeKebun} berhasil dihapus.` });
      await fetchKebuns(filters);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menghapus kebun.' });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Field Assets</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#f4f4f4]">Manajemen Kebun Sawit</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#c2cec0]">
            Kelola data kebun, koordinat area, mandor, supir, dan reassignment operasional.
          </p>
        </div>
        {isAdmin && (
          <Link className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b]" to="/kebun/new">
            Tambah Kebun
          </Link>
        )}
      </section>

      {message && (
        <div className={`rounded-[8px] border px-4 py-3 text-[13px] font-bold ${messageClass[message.type]}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Total kebun', kebuns.length],
          ['Mandor assigned', assignedMandor],
          ['Supir assigned', totalSupir],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[8px] border border-[#303030] bg-[#181818] p-5">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9aa79a]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#f4f4f4]">{value}</p>
          </article>
        ))}
      </section>

      <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleSearch}>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_120px]">
          <input className={inputClass} name="searchNama" value={filters.searchNama} onChange={updateFilter} placeholder="Cari nama kebun" />
          <input className={inputClass} name="searchKode" value={filters.searchKode} onChange={updateFilter} placeholder="Cari kode kebun" />
          <select className={inputClass} name="sortBy" value={filters.sortBy} onChange={updateFilter}>
            <option value="kodeKebun">Kode A-Z</option>
            <option value="createdAt">Terbaru</option>
          </select>
          <button className="h-11 rounded-[8px] bg-[#242424] px-4 text-[12px] font-black text-[#52ef8b]" type="submit">
            Filter
          </button>
        </div>
      </form>

      <section className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
        <div className="overflow-x-auto">
          <table className="min-w-[1040px] w-full text-left">
            <thead className="bg-[#202020]">
              <tr>
                {['Kode', 'Nama Kebun', 'Luas', 'Koordinat', 'Mandor', 'Supir', 'Aksi'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {loading ? (
                <tr><td className="px-5 py-8 text-center text-[#9aa79a]" colSpan="7">Memuat data kebun...</td></tr>
              ) : kebuns.length === 0 ? (
                <tr><td className="px-5 py-8 text-center text-[#9aa79a]" colSpan="7">Belum ada data kebun.</td></tr>
              ) : kebuns.map((kebun) => (
                <tr key={kebun.kodeKebun}>
                  <td className="px-5 py-4 font-mono text-[13px] font-black text-[#52ef8b]">{kebun.kodeKebun}</td>
                  <td className="px-5 py-4 font-black text-[#f4f4f4]">{kebun.namaKebun}</td>
                  <td className="px-5 py-4 text-[#dce6da]">{kebun.luasHektare} Ha</td>
                  <td className="px-5 py-4 font-mono text-[12px] text-[#9aa79a]">{coordSummary(kebun.koordinat)}</td>
                  <td className="px-5 py-4">
                    {kebun.mandorId ? <Badge tone="green">{kebun.namaMandor || 'Assigned'}</Badge> : <Badge>Belum</Badge>}
                  </td>
                  <td className="px-5 py-4"><Badge tone="blue">{kebun.supirIds?.length || 0} supir</Badge></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link className="rounded-[8px] bg-[#242424] px-3 py-2 text-[12px] font-black text-[#9ccfff]" to={`/kebun/${kebun.kodeKebun}`}>
                        Detail
                      </Link>
                      {isAdmin && (
                        <>
                          <Link className="rounded-[8px] bg-[#242424] px-3 py-2 text-[12px] font-black text-[#fbbf24]" to={`/kebun/${kebun.kodeKebun}/edit`}>
                            Edit
                          </Link>
                          <button className="rounded-[8px] bg-[#351717] px-3 py-2 text-[12px] font-black text-red-200 disabled:opacity-50" disabled={deleting === kebun.kodeKebun} type="button" onClick={() => handleDelete(kebun.kodeKebun)}>
                            {deleting === kebun.kodeKebun ? '...' : 'Hapus'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
