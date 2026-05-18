import { Link } from 'react-router-dom';

export default function ModulePlaceholder({ title, description, checklist = [] }) {
  return (
    <div className="space-y-5">
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Module Base</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{description}</p>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-black text-slate-950">Base scope</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item} className="rounded-md bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              {item}
            </div>
          ))}
        </div>
      </section>

      <Link className="inline-flex h-11 items-center rounded-md bg-emerald-900 px-4 text-sm font-bold text-white" to="/dashboard">
        Back to dashboard
      </Link>
    </div>
  );
}
