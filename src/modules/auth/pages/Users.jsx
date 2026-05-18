import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  assignUserMandor,
  deleteUser,
  searchUsers,
  unassignUserMandor,
  unwrapApiData,
} from '../../../api/axios';

const roleOptions = ['', 'ADMIN', 'MANDOR', 'BURUH', 'SUPIR'];

const roleBadge = {
  ADMIN: 'bg-[#2a1f0a] text-[#fbbf24] border border-[#3a2f0a]',
  MANDOR: 'bg-[#0a1520] text-[#60a5fa] border border-[#0a2030]',
  BURUH: 'bg-[#0a1f12] text-[#4ade80] border border-[#0a2a12]',
  SUPIR: 'bg-[#1f0a16] text-[#f472b6] border border-[#2f0a20]',
};

const getUsersContent = (payload) => {
  if (Array.isArray(payload)) return payload;
  return payload?.content || [];
};

const inputClass =
  'h-11 rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-3 text-[13px] text-white outline-none placeholder:text-[#3a5c42] transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15';

const initialFilters = { name: '', email: '', role: '', page: 0, size: 10 };

export default function Users() {
  const [filters, setFilters] = useState(initialFilters);
  const [users, setUsers] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [assignForm, setAssignForm] = useState({ buruhId: '', mandorId: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const mandorUsers = useMemo(() => users.filter((u) => u.role === 'MANDOR'), [users]);
  const buruhUsers = useMemo(() => users.filter((u) => u.role === 'BURUH'), [users]);

  const fetchUsers = useCallback(async (nextFilters) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await searchUsers({
        name: nextFilters.name || undefined,
        email: nextFilters.email || undefined,
        role: nextFilters.role || undefined,
        page: nextFilters.page,
        size: nextFilters.size,
      });
      const data = unwrapApiData(response);
      setUsers(getUsersContent(data));
      setPaging(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengambil daftar pengguna.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(initialFilters); }, [fetchUsers]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((c) => ({ ...c, [name]: value, page: 0 }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchUsers({ ...filters, page: 0 });
  };

  const handleAssign = async (event) => {
    event.preventDefault();
    if (!assignForm.buruhId || !assignForm.mandorId) return;
    setLoading(true);
    setMessage(null);
    try {
      const response = await assignUserMandor(assignForm.buruhId, assignForm.mandorId);
      setMessage({ type: 'success', text: response.data?.message || 'Mandor berhasil diassign.' });
      await fetchUsers(filters);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal assign mandor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassign = async (userId) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await unassignUserMandor(userId);
      setMessage({ type: 'success', text: response.data?.message || 'Mandor berhasil dilepas.' });
      await fetchUsers(filters);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal unassign mandor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setLoading(true);
    setMessage(null);
    setDeleteConfirm(null);
    try {
      const response = await deleteUser(userId);
      setMessage({ type: 'success', text: response.data?.message || 'Pengguna berhasil dihapus.' });
      await fetchUsers(filters);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal menghapus pengguna.' });
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    const nextFilters = { ...filters, page };
    setFilters(nextFilters);
    fetchUsers(nextFilters);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="relative overflow-hidden rounded-2xl border border-[#1a3a22] bg-[#060d09] p-6">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4ade80]/40 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#4a6b52]">Admin</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white">Manajemen Pengguna</h1>
          </div>
          <div className="rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">Total</p>
            <p className="mt-1 text-2xl font-black text-[#4ade80]">
              {paging?.totalElements ?? users.length}
            </p>
            <p className="text-[10px] text-[#3a5c42]">pengguna</p>
          </div>
        </div>
      </section>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-[13px] font-semibold transition-all ${
            message.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Search */}
      <form className="rounded-xl border border-[#1a3a22] bg-[#080f0a] p-4" onSubmit={handleSearch}>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#3a5c42]">Filter Pengguna</p>
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_180px_100px]">
          <input
            className={inputClass}
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Cari nama..."
          />
          <input
            className={inputClass}
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            placeholder="Cari email..."
          />
          <select
            className={`${inputClass} cursor-pointer`}
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            style={{ background: '#0a1a0f' }}
          >
            {roleOptions.map((role) => (
              <option key={role || 'ALL'} value={role} style={{ background: '#0a1a0f' }}>
                {role || 'Semua role'}
              </option>
            ))}
          </select>
          <button
            className="h-11 rounded-xl bg-[#166534] text-[12px] font-black uppercase tracking-widest text-white shadow-[0_0_12px_rgba(74,222,128,0.15)] transition-all hover:bg-[#15803d] disabled:opacity-60 active:scale-[0.98]"
            disabled={loading}
            type="submit"
          >
            Cari
          </button>
        </div>
      </form>

      {/* Assignment */}
      <section className="rounded-xl border border-[#1a3a22] bg-[#080f0a] p-5">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#3a5c42]">Assignment</p>
        <h2 className="text-[15px] font-black text-white">Assign Buruh ke Mandor</h2>
        <form className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_120px]" onSubmit={handleAssign}>
          <select
            className={`${inputClass} cursor-pointer`}
            value={assignForm.buruhId}
            onChange={(e) => setAssignForm((c) => ({ ...c, buruhId: e.target.value }))}
            style={{ background: '#0a1a0f' }}
          >
            <option value="" style={{ background: '#0a1a0f' }}>Pilih buruh</option>
            {buruhUsers.map((u) => (
              <option key={u.id} value={u.id} style={{ background: '#0a1a0f' }}>
                {u.fullname || u.username} {u.namaMandor ? `— ${u.namaMandor}` : ''}
              </option>
            ))}
          </select>
          <select
            className={`${inputClass} cursor-pointer`}
            value={assignForm.mandorId}
            onChange={(e) => setAssignForm((c) => ({ ...c, mandorId: e.target.value }))}
            style={{ background: '#0a1a0f' }}
          >
            <option value="" style={{ background: '#0a1a0f' }}>Pilih mandor</option>
            {mandorUsers.map((u) => (
              <option key={u.id} value={u.id} style={{ background: '#0a1a0f' }}>
                {u.fullname || u.username}
              </option>
            ))}
          </select>
          <button
            className="h-11 rounded-xl bg-[#1a2e20] border border-[#2a4a2a] text-[12px] font-black uppercase tracking-widest text-[#4ade80] transition-all hover:bg-[#1a3a22] disabled:opacity-60 active:scale-[0.98]"
            type="submit"
            disabled={loading || !assignForm.buruhId || !assignForm.mandorId}
          >
            Assign
          </button>
        </form>
      </section>

      {/* Table */}
      <section className="overflow-hidden rounded-xl border border-[#1a3a22] bg-[#080f0a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="border-b border-[#1a3a22] bg-[#0a1a0f]">
              <tr>
                {['Nama', 'Email', 'Role', 'Mandor', 'Sertifikasi', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#3a5c42]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0f1f17]">
              {loading ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[#3a5c42]" colSpan="6">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-[#4ade80]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-[#3a5c42]" colSpan="6">
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[#0a1a0f]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0a1f12] text-[11px] font-black text-[#4ade80]">
                          {(user.fullname || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{user.fullname || user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#4a6b52]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${roleBadge[user.role] || 'bg-[#1a1a1a] text-[#8a9a8e]'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4a6b52]">{user.namaMandor || '—'}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#4a6b52]">
                      {user.nomorSertifikasi || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.role === 'BURUH' && user.namaMandor && (
                          <button
                            className="rounded-lg border border-[#1a3a22] px-3 py-1.5 text-[11px] font-bold text-[#4a6b52] transition-all hover:border-[#4ade80] hover:text-[#4ade80] active:scale-[0.97]"
                            type="button"
                            onClick={() => handleUnassign(user.id)}
                          >
                            Unassign
                          </button>
                        )}
                        {deleteConfirm === user.id ? (
                          <div className="flex gap-1.5">
                            <button
                              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-[11px] font-bold text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.97]"
                              type="button"
                              onClick={() => handleDelete(user.id)}
                            >
                              Konfirmasi
                            </button>
                            <button
                              className="rounded-lg border border-[#1a3a22] px-2 py-1.5 text-[11px] text-[#4a6b52] hover:text-white transition-colors"
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            className="rounded-lg border border-red-500/20 px-3 py-1.5 text-[11px] font-bold text-red-500/70 transition-all hover:border-red-500/50 hover:text-red-400 active:scale-[0.97]"
                            type="button"
                            onClick={() => setDeleteConfirm(user.id)}
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      {paging && (
        <div className="flex items-center justify-end gap-3">
          <button
            className="h-9 rounded-lg border border-[#1a3a22] bg-[#080f0a] px-4 text-[12px] font-bold text-[#4a6b52] transition-all hover:border-[#2a5a32] hover:text-white disabled:opacity-40 active:scale-[0.97]"
            disabled={filters.page <= 0 || loading}
            type="button"
            onClick={() => goToPage(filters.page - 1)}
          >
            ← Prev
          </button>
          <span className="text-[12px] font-semibold text-[#4a6b52]">
            {(paging.currentPage ?? filters.page) + 1} / {paging.totalPages || 1}
          </span>
          <button
            className="h-9 rounded-lg border border-[#1a3a22] bg-[#080f0a] px-4 text-[12px] font-bold text-[#4a6b52] transition-all hover:border-[#2a5a32] hover:text-white disabled:opacity-40 active:scale-[0.97]"
            disabled={filters.page + 1 >= (paging.totalPages || 1) || loading}
            type="button"
            onClick={() => goToPage(filters.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
