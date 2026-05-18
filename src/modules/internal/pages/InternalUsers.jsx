import { useState } from 'react';
import { internalGetUserDetail, internalSearchUsers, unwrapApiData } from '../../../api/axios';

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
    <div className="space-y-5">
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Internal Communication</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Auth Service Internal API</h1>
      </section>

      {message && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>}

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="rounded-md border border-slate-200 bg-white p-5" onSubmit={search}>
          <h2 className="text-lg font-black text-slate-950">Search users</h2>
          <div className="mt-4 grid gap-3">
            {['name', 'email', 'role'].map((field) => (
              <input
                key={field}
                className="h-11 rounded-md border border-slate-300 px-3 text-sm"
                value={filters[field]}
                onChange={(event) => setFilters((current) => ({ ...current, [field]: event.target.value }))}
                placeholder={field}
              />
            ))}
            <button className="h-11 rounded-md bg-emerald-900 px-4 text-sm font-bold text-white" type="submit">
              Search
            </button>
          </div>
        </form>

        <form className="rounded-md border border-slate-200 bg-white p-5" onSubmit={detail}>
          <h2 className="text-lg font-black text-slate-950">Get detail</h2>
          <div className="mt-4 grid gap-3">
            <input
              className="h-11 rounded-md border border-slate-300 px-3 text-sm"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="User UUID"
            />
            <button className="h-11 rounded-md bg-slate-900 px-4 text-sm font-bold text-white" type="submit">
              Fetch
            </button>
          </div>
        </form>
      </div>

      <pre className="overflow-auto rounded-md border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-emerald-100">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
