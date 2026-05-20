import { useCallback, useEffect, useState } from 'react';
import { getMyBawahan, unwrapApiData } from '../../../api/axios';

export default function Bawahan() {
  const [name, setName] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchBawahan = useCallback(async (searchName = '') => {
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
  }, []);

  useEffect(() => {
    fetchBawahan('');
  }, [fetchBawahan]);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchBawahan(name);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1fr_0.45fr]">
        <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-7">
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
            Mandor Tasks
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#f4f4f4]">Field Operations & Approval</h1>
          <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#c2cec0]">
            Pantau buruh yang berada di bawah tanggung jawab mandor dan cari data bawahan secara cepat.
          </p>
        </div>
        <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-7">
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.18em] text-[#b9c3b8]">
            Active Laborers
          </p>
          <p className="mt-4 text-5xl font-black text-[#9ccfff]">{users.length}</p>
          <p className="mt-2 text-[13px] font-bold text-[#9da89b]">Buruh terdaftar sebagai bawahan</p>
        </div>
      </section>

      <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <input
            className="h-12 rounded-[8px] border border-[#303030] bg-[#202020] px-4 text-[14px] text-[#f4f4f4] outline-none placeholder:text-[#6f7a6e] focus:border-[#52ef8b]"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Search nama bawahan..."
          />
          <button className="h-12 rounded-[8px] bg-[#35d174] px-4 text-[13px] font-black text-[#06120b]" type="submit">
            Cari
          </button>
        </div>
      </form>

      {message && (
        <div className="rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">
          {message.text}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-5 text-[#9da89b]">Loading...</div>
        ) : users.length === 0 ? (
          <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-5 text-[#9da89b]">Tidak ada bawahan.</div>
        ) : (
          users.map((user) => (
            <article key={user.id} className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[#f4f4f4]">{user.fullname || user.username}</h2>
                  <p className="mt-1 text-sm text-[#9da89b]">{user.email}</p>
                </div>
                <span className="rounded-full bg-[#102518] px-3 py-1 font-mono text-[11px] font-black text-[#52ef8b]">
                  {user.role}
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#292929]">
                <div className="h-full w-[72%] rounded-full bg-[#52ef8b]" />
              </div>
              <p className="mt-2 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9da89b]">
                Productivity monitoring
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
