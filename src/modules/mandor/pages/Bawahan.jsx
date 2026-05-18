import { useEffect, useState } from 'react';
import { getMyBawahan, unwrapApiData } from '../../../api/axios';

export default function Bawahan() {
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchBawahan = async (searchName = name) => {
    setLoading(true);
    try {
      const response = await getMyBawahan({ name: searchName || undefined });
      setUsers(unwrapApiData(response) || []);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengambil daftar bawahan.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBawahan('');
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchBawahan(name);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Mandor</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Daftar Bawahan</h1>
      </section>

      <form className="rounded-md border border-slate-200 bg-white p-4" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <input
            className="h-11 rounded-md border border-slate-300 px-3 text-sm"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Search nama bawahan"
          />
          <button className="h-11 rounded-md bg-emerald-900 px-4 text-sm font-bold text-white" type="submit">
            Cari
          </button>
        </div>
      </form>

      {message && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message.text}
        </div>
      )}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-md border border-slate-200 bg-white p-5 text-slate-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-5 text-slate-500">Tidak ada bawahan.</div>
        ) : (
          users.map((user) => (
            <article key={user.id} className="rounded-md border border-slate-200 bg-white p-5">
              <h2 className="font-black text-slate-950">{user.fullname || user.username}</h2>
              <p className="mt-1 text-sm text-slate-600">{user.email}</p>
              <p className="mt-3 inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                {user.role}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
