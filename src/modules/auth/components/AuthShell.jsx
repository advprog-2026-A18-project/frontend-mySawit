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
    <main className="min-h-screen bg-[#0b0b0b] text-[#f4f4f4] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#101010] lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.22),rgba(10,10,10,0.64)_45%,rgba(10,10,10,0.94))]" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-8 xl:p-10">
          <div>
            <div className="mb-10 flex items-center gap-4">
              <BadgeIcon />
              <span className="text-4xl font-black tracking-tight text-[#52ef8b] drop-shadow">
                MySawit
              </span>
            </div>

            <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
              Auth Service
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-white">
              Plantation OS access for field operations.
            </h1>

            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#d8e2d6]">
              Kelola autentikasi, otorisasi, dan profil operasional untuk buruh, mandor,
              supir, dan admin utama.
            </p>
          </div>

          <div className="flex gap-7 text-white">
            <div className="border-l-2 border-[#98ff8e] pl-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-[#98ff8e]">
                Auth Service
              </p>
              <p className="mt-1 text-2xl font-bold">Gateway 8080</p>
            </div>
            <div className="border-l-2 border-[#98ff8e] pl-5">
              <p className="text-sm font-extrabold uppercase tracking-widest text-[#98ff8e]">
                RBAC
              </p>
              <p className="mt-1 text-2xl font-bold">4 Roles</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col border-l border-[#282828] bg-[#141414] px-5 py-6 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <BadgeIcon />
          <span className="text-2xl font-black tracking-wide text-[#52ef8b]">
            MySawit
          </span>
        </div>

        <div className="flex flex-1 items-start justify-center pt-2 sm:pt-8 lg:items-center lg:pt-0">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="mt-8 text-center text-[11px] uppercase tracking-[0.24em] text-[#899588]">
          2026 MySawit • Plantation Resource Planning •{' '}
          {mode === 'register' ? 'Onboarding' : 'Authentication'}
        </footer>
      </section>
    </main>
  );
}
