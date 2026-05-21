import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  assignMandor,
  assignSupir,
  getKebunDetail,
  searchUsers,
  unassignMandor,
  unassignSupir,
  unwrapApiData,
} from '../../../api/axios';
import { getAuthUser } from '../../auth/authStorage';

const inputClass =
  'h-11 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] px-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b] focus:ring-2 focus:ring-[#52ef8b]/15';

const messageClass = {
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
};

const normalizeUsers = (payload) => (Array.isArray(payload) ? payload : payload?.content || []);

const unwrapKebun = (response) => unwrapApiData(response) || {};

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
  if (!coords.length) return '-';
  const lats = coords.map((item) => Number(item.lat));
  const lngs = coords.map((item) => Number(item.lng));
  return `${Math.min(...lats)}, ${Math.min(...lngs)} -> ${Math.max(...lats)}, ${Math.max(...lngs)}`;
}

function getUserLabel(user) {
  return user?.fullname || user?.nama || user?.username || user?.email || user?.id;
}

export default function KebunDetail() {
  const navigate = useNavigate();
  const { kode } = useParams();
  const currentUser = getAuthUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [kebun, setKebun] = useState(null);
  const [users, setUsers] = useState({ mandor: [], supir: [] });
  const [searchSupirNama, setSearchSupirNama] = useState('');
  const [form, setForm] = useState({ mandorId: '', supirId: '', targetMandor: '', targetSupir: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const supirRows = useMemo(() => {
    const ids = kebun?.supirIds || [];
    const names = kebun?.listSupir || [];
    return ids.map((id, index) => ({ id, nama: names[index] || id }));
  }, [kebun]);

  const loadKebun = useCallback(async () => {
    const params = searchSupirNama ? { searchSupirNama } : undefined;
    const response = await getKebunDetail(kode, params);
    setKebun(unwrapKebun(response));
  }, [kode, searchSupirNama]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    const [mandorRes, supirRes] = await Promise.all([
      searchUsers({ role: 'MANDOR', page: 0, size: 100 }),
      searchUsers({ role: 'SUPIR', page: 0, size: 100 }),
    ]);
    setUsers({
      mandor: normalizeUsers(unwrapApiData(mandorRes)),
      supir: normalizeUsers(unwrapApiData(supirRes)),
    });
  }, [isAdmin]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      await Promise.all([loadKebun(), loadUsers()]);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memuat detail kebun.' });
    } finally {
      setLoading(false);
    }
  }, [loadKebun, loadUsers]);

  useEffect(() => { refresh(); }, [refresh]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const runAction = async (action, successText) => {
    setSaving(true);
    setMessage(null);
    try {
      await action();
      setMessage({ type: 'success', text: successText });
      await loadKebun();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Aksi gagal diproses.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssignMandor = (event) => {
    event.preventDefault();
    const mandor = users.mandor.find((item) => item.id === form.mandorId);
    runAction(
      () => assignMandor(kode, form.mandorId, getUserLabel(mandor)),
      'Mandor berhasil diassign ke kebun.',
    );
  };

  const handleAssignSupir = (event) => {
    event.preventDefault();
    const supir = users.supir.find((item) => item.id === form.supirId);
    runAction(
      () => assignSupir(kode, form.supirId, getUserLabel(supir)),
      'Supir berhasil ditambahkan ke kebun.',
    );
  };

  const handleUnassignMandor = () => {
    if (!form.targetMandor) {
      setMessage({ type: 'error', text: 'Target kebun wajib diisi untuk memindahkan mandor.' });
      return;
    }
    runAction(() => unassignMandor(kode, form.targetMandor), 'Mandor berhasil dipindahkan.');
  };

  const handleUnassignSupir = (supirId) => {
    if (!form.targetSupir) {
      setMessage({ type: 'error', text: 'Target kebun wajib diisi untuk memindahkan supir.' });
      return;
    }
    runAction(() => unassignSupir(kode, supirId, form.targetSupir), 'Supir berhasil dipindahkan.');
  };

  if (loading) {
    return <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-8 text-[#cbd6c9]">Memuat detail kebun...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button className="mb-3 text-[13px] font-bold text-[#9aa79a] hover:text-[#52ef8b]" type="button" onClick={() => navigate('/kebun')}>
            Kembali ke daftar
          </button>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Field Assets</p>
          <h1 className="mt-2 text-4xl font-black text-[#f4f4f4]">{kebun?.namaKebun || kode}</h1>
          <p className="mt-2 text-[15px] text-[#c2cec0]">{kebun?.kodeKebun} · {kebun?.luasHektare || 0} hektare</p>
        </div>
        {isAdmin && (
          <Link className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b]" to={`/kebun/${kode}/edit`}>
            Edit Kebun
          </Link>
        )}
      </section>

      {message && (
        <div className={`rounded-[8px] border px-4 py-3 text-[13px] font-bold ${messageClass[message.type]}`}>
          {message.text}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Kode', kebun?.kodeKebun],
          ['Luas', `${kebun?.luasHektare || 0} Ha`],
          ['Mandor', kebun?.namaMandor || kebun?.mandorId || 'Belum assigned'],
          ['Supir', `${supirRows.length} orang`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[8px] border border-[#303030] bg-[#181818] p-5">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#9aa79a]">{label}</p>
            <p className="mt-3 break-words text-[18px] font-black text-[#f4f4f4]">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
        <h2 className="text-xl font-black text-[#f4f4f4]">Koordinat Area</h2>
        <p className="mt-3 font-mono text-[13px] text-[#cbd6c9]">{coordSummary(kebun?.koordinat)}</p>
      </section>

      {isAdmin && (
        <section className="grid gap-5 xl:grid-cols-2">
          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleAssignMandor}>
            <h2 className="text-lg font-black text-[#f4f4f4]">Assign Mandor</h2>
            <select className={`${inputClass} mt-4 w-full`} name="mandorId" value={form.mandorId} onChange={updateForm}>
              <option value="">Pilih mandor</option>
              {users.mandor.map((user) => <option key={user.id} value={user.id}>{getUserLabel(user)}</option>)}
            </select>
            <button className="mt-3 h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={!form.mandorId || saving} type="submit">
              Assign
            </button>
          </form>

          <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleAssignSupir}>
            <h2 className="text-lg font-black text-[#f4f4f4]">Tambah Supir</h2>
            <select className={`${inputClass} mt-4 w-full`} name="supirId" value={form.supirId} onChange={updateForm}>
              <option value="">Pilih supir</option>
              {users.supir.map((user) => <option key={user.id} value={user.id}>{getUserLabel(user)}</option>)}
            </select>
            <button className="mt-3 h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={!form.supirId || saving} type="submit">
              Tambah
            </button>
          </form>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
          <h2 className="text-lg font-black text-[#f4f4f4]">Mandor Kebun</h2>
          <div className="mt-4 rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-4">
            <p className="text-[15px] font-black text-[#f4f4f4]">{kebun?.namaMandor || 'Belum ada mandor'}</p>
            <p className="mt-2 break-all font-mono text-[12px] text-[#9aa79a]">{kebun?.mandorId || '-'}</p>
          </div>
          {isAdmin && kebun?.mandorId && (
            <div className="mt-4 flex gap-2">
              <input className={inputClass} name="targetMandor" value={form.targetMandor} onChange={updateForm} placeholder="Kode target kebun" />
              <button className="h-11 rounded-[8px] bg-[#3a1616] px-4 text-[12px] font-black text-red-200 disabled:opacity-50" disabled={saving} type="button" onClick={handleUnassignMandor}>
                Pindahkan
              </button>
            </div>
          )}
        </article>

        <article className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-[#f4f4f4]">Supir Kebun</h2>
            <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); loadKebun(); }}>
              <input className={inputClass} value={searchSupirNama} onChange={(event) => setSearchSupirNama(event.target.value)} placeholder="Cari supir" />
              <button className="h-11 rounded-[8px] bg-[#242424] px-4 text-[12px] font-black text-[#52ef8b]" type="submit">Cari</button>
            </form>
          </div>
          <div className="mt-4 space-y-3">
            {supirRows.length === 0 ? (
              <p className="rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-4 text-[#9aa79a]">Belum ada supir pada kebun ini.</p>
            ) : supirRows.map((supir) => (
              <div key={supir.id} className="flex flex-col gap-3 rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[15px] font-black text-[#f4f4f4]">{supir.nama}</p>
                  <p className="mt-1 break-all font-mono text-[12px] text-[#9aa79a]">{supir.id}</p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <input className={inputClass} name="targetSupir" value={form.targetSupir} onChange={updateForm} placeholder="Target kebun" />
                    <button className="h-11 rounded-[8px] bg-[#3a1616] px-4 text-[12px] font-black text-red-200 disabled:opacity-50" disabled={saving} type="button" onClick={() => handleUnassignSupir(supir.id)}>
                      Pindahkan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
