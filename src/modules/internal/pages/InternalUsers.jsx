import { useState } from 'react';
import { internalGetUserDetail, internalSearchUsers, unwrapApiData } from '../../../api/axios';

const inputClass =
  'h-12 rounded-[8px] border border-[#303030] bg-[#202020] px-4 text-[14px] text-[#f4f4f4] outline-none placeholder:text-[#6f7a6e] focus:border-[#52ef8b]';

export default function InternalUsers() {
  const [filters, setFilters] = useState({ name: '', email: '', role: '' });
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);

  const search = async (event) => {
    event.preventDefault();
    setMessage(null);
    try {
      const response = await internalSearchUsers({
        name: filters.name || undefined,
        email: filters.email || undefined,
        role: filters.role || undefined,
      });
      setResult(unwrapApiData(response));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Internal search gagal.');
    }
  };

  const detail = async (event) => {
    event.preventDefault();
    if (!userId) return;
    setMessage(null);
    try {
      const response = await internalGetUserDetail(userId);
      setResult(unwrapApiData(response));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Internal detail gagal.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-7">
        <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
          Internal Communication
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-[#f4f4f4]">Auth Service Internal API</h1>
        <p className="mt-2 max-w-3xl text-[16px] leading-7 text-[#c2cec0]">
          Endpoint ini hanya untuk admin preview terhadap kontrak komunikasi internal antar service.
        </p>
      </section>

      {message && <div className="rounded-[8px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{message}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={search}>
          <h2 className="text-xl font-black text-[#f4f4f4]">Search users</h2>
          <div className="mt-5 grid gap-3">
            {['name', 'email', 'role'].map((field) => (
              <input
                key={field}
                className={inputClass}
                value={filters[field]}
                onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
                placeholder={field}
              />
            ))}
            <button className="h-12 rounded-[8px] bg-[#35d174] px-4 text-sm font-black text-[#06120b]" type="submit">
              Search
            </button>
          </div>
        </form>

        <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={detail}>
          <h2 className="text-xl font-black text-[#f4f4f4]">Get detail</h2>
          <div className="mt-5 grid gap-3">
            <input
              className={inputClass}
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User UUID"
            />
            <button className="h-12 rounded-[8px] border border-[#303030] bg-[#202020] px-4 text-sm font-black text-[#f4f4f4]" type="submit">
              Fetch
            </button>
          </div>
        </form>
      </div>

      <pre className="max-h-[520px] overflow-auto rounded-[8px] border border-[#303030] bg-[#101010] p-5 font-mono text-xs leading-6 text-[#bfffd2]">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
