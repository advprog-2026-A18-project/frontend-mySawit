const BadgeIcon = () => (
  <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10 text-[#8cff82]">
    <path
      fill="currentColor"
      d="M16 31a6 6 0 1 1-11.9 1.1A6 6 0 0 1 16 31Zm-4 0a2 2 0 1 0-4 .1 2 2 0 0 0 4-.1Zm31 0a6 6 0 1 1-11.9 1.1A6 6 0 0 1 43 31Zm-4 0a2 2 0 1 0-4 .1 2 2 0 0 0 4-.1ZM12.8 16.5l3-5.2h6.1v4h-3.8l-1.8 3.1 6.2 5.9h8.7l3.4-5.9h-5.9v-4h12.8l-7.9 13.9h-13L12.8 21H5v-4h7.8Z"
    />
  </svg>
);

export default function AuthShell({ children, mode = 'login' }) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950 lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(460px,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,31,24,0.52),rgba(32,55,23,0.24)_38%,rgba(8,24,18,0.82))]" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-8 xl:p-10">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <BadgeIcon />
              <span className="text-4xl font-extrabold tracking-wide text-[#98ff8e] drop-shadow">
                PLANTATION HQ
              </span>
            </div>

            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white xl:text-4xl">
              Precision management for high-density agricultural assets.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-emerald-50/80">
              Access the industrial-grade console for real-time logistics, inventory tracking,
              and employee management across your entire estate.
            </p>
          </div>

          <div className="flex gap-7 text-white">
            <div className="border-l-2 border-[#98ff8e] pl-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-[#98ff8e]">
                Global Tonnage
              </p>
              <p className="mt-1 text-2xl font-bold">124,500 MT</p>
            </div>
            <div className="border-l-2 border-[#98ff8e] pl-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-[#98ff8e]">
                Active Estates
              </p>
              <p className="mt-1 text-2xl font-bold">42 Units</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <BadgeIcon />
          <span className="text-2xl font-extrabold tracking-wide text-green-700">
            PLANTATION HQ
          </span>
        </div>

        <div className="flex flex-1 items-start justify-center pt-2 sm:pt-8 lg:items-center lg:pt-0">
          <div className="w-full max-w-xl">{children}</div>
        </div>

        <footer className="mt-8 text-center text-[11px] uppercase tracking-[0.24em] text-slate-600">
          © 2026 Estatemaster Pro • Industrial Resource Planning •{' '}
          {mode === 'register' ? 'Onboarding' : 'Authentication'}
        </footer>
      </section>
    </main>
  );
}
