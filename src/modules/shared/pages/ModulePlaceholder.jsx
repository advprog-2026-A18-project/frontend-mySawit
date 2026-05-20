import { Link } from 'react-router-dom';

export default function ModulePlaceholder({ title, eyebrow = 'Module Base', description, checklist = [] }) {
  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4f4f4] lg:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-[17px] leading-7 text-[#c2cec0]">{description}</p>
        </div>
        <Link className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#35d174] px-6 text-[14px] font-black text-[#06120b]" to="/dashboard">
          Back to Dashboard
        </Link>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_0.48fr]">
        <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#f4f4f4]">Operational Scope</h2>
            <span className="rounded-full bg-[#102518] px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
              Base Ready
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {checklist.map((item) => (
              <div key={item} className="rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-4">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
                  Requirement
                </p>
                <p className="mt-2 text-[15px] font-bold text-[#e8eee6]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.18em] text-[#b9c3b8]">
            Logic Preview
          </p>
          <div className="mt-5 space-y-4">
            {['Accepted', 'Pending', 'Rejected'].map((status, index) => (
              <div key={status} className="flex items-center justify-between rounded-[8px] border border-[#292929] bg-[#202020] px-4 py-3">
                <span className="font-bold text-[#f4f4f4]">{status}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-[#52ef8b]' : index === 1 ? 'bg-[#ffbd59]' : 'bg-[#ff9b9b]'}`} />
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
