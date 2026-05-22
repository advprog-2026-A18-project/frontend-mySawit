const integrationRows = [
  {
    caller: 'Kebun',
    target: 'Auth',
    rpc: 'ValidateUserRole',
    purpose: 'Validasi role MANDOR saat assign mandor dan SUPIR saat assign supir.',
    status: 'Aktif',
  },
  {
    caller: 'Panen',
    target: 'Auth',
    rpc: 'ValidateUserRole',
    purpose: 'Validasi BURUH saat membuat laporan panen dan MANDOR saat approval.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Auth',
    rpc: 'GetUserById',
    purpose: 'Menampilkan nama mandor dan supir pada response pengiriman.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Auth',
    rpc: 'ValidateUserRole',
    purpose: 'Memastikan mandor dan supir benar sebelum assignment pengiriman.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Kebun',
    rpc: 'GetKebunByMandorId',
    purpose: 'Resolusi kebun mandor untuk daftar supir satu kebun.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Kebun',
    rpc: 'GetKebunBySupirId',
    purpose: 'Resolusi kebun supir untuk detail user dan fallback data assignment.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Kebun',
    rpc: 'ValidateMandorSupirSameKebun',
    purpose: 'Validasi mandor hanya dapat menugaskan supir di kebun yang sama.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Kebun',
    rpc: 'GetSupirByKebun',
    purpose: 'Menampilkan daftar supir dalam kebun mandor.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Panen',
    rpc: 'GetPanenByIds',
    purpose: 'Mengambil detail hasil panen untuk total muatan dan response.',
    status: 'Aktif',
  },
  {
    caller: 'Pengiriman',
    target: 'Panen',
    rpc: 'ValidatePanenApproved',
    purpose: 'Memastikan panen sudah disetujui mandor sebelum dikirim.',
    status: 'Aktif',
  },
];

const serviceCards = [
  { name: 'Auth', port: '9091', role: 'Identity provider', calls: 'Provider' },
  { name: 'Kebun', port: '9092', role: 'Estate assignment provider', calls: 'Caller + Provider' },
  { name: 'Panen', port: '9093', role: 'Harvest validation provider', calls: 'Caller + Provider' },
  { name: 'Pengiriman', port: '-', role: 'Logistics orchestrator', calls: 'Caller' },
];

const flowSteps = [
  'Mandor memilih supir dan hasil panen.',
  'Pengiriman validasi role ke Auth.',
  'Pengiriman validasi assignment kebun ke Kebun.',
  'Pengiriman validasi status panen ke Panen.',
  'Pengiriman menyimpan manifest jika semua valid.',
];

function StatusBadge({ children }) {
  return (
    <span className="inline-flex h-8 items-center rounded-[8px] bg-[#102518] px-3 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
      {children}
    </span>
  );
}

export default function GrpcIntegrations() {
  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
            Internal Communication
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4f4f4] lg:text-5xl">
            gRPC Service Map
          </h1>
          <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[#c2cec0]">
            Visualisasi integrasi internal non-payment untuk Auth, Kebun, Hasil Panen, dan Pengiriman.
          </p>
        </div>
        <StatusBadge>{integrationRows.length} RPC aktif</StatusBadge>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {serviceCards.map((service) => (
          <article key={service.name} className="rounded-[8px] border border-[#303030] bg-[#181818] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[20px] font-black text-[#f4f4f4]">{service.name}</h2>
                <p className="mt-2 text-[13px] font-bold text-[#aebbad]">{service.role}</p>
              </div>
              <span className="rounded-[8px] bg-[#242424] px-3 py-2 font-mono text-[12px] font-black text-[#9ccfff]">
                {service.port}
              </span>
            </div>
            <p className="mt-5 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
              {service.calls}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <article className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <h2 className="text-2xl font-black text-[#f4f4f4]">Assignment Flow</h2>
          <div className="mt-6 space-y-3">
            {flowSteps.map((step, index) => (
              <div key={step} className="grid grid-cols-[40px_1fr] gap-3 rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#35d174] font-black text-[#06120b]">
                  {index + 1}
                </span>
                <p className="self-center text-[14px] font-bold leading-6 text-[#dce6da]">{step}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <h2 className="text-2xl font-black text-[#f4f4f4]">Runtime Topology</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
            {['Auth', 'Kebun', 'Panen'].map((target) => (
              <div key={target} className="rounded-[8px] border border-[#2b2b2b] bg-[#202020] p-5">
                <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">
                  Provider
                </p>
                <p className="mt-2 text-[22px] font-black text-[#f4f4f4]">{target}</p>
                <div className="mt-5 h-2 rounded-full bg-[#303030]">
                  <div className="h-2 rounded-full bg-[#52ef8b]" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[8px] border border-[#255b39] bg-[#102518] p-5">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#52ef8b]">
              Caller
            </p>
            <p className="mt-2 text-[22px] font-black text-[#f4f4f4]">Pengiriman</p>
            <p className="mt-3 text-[14px] leading-6 text-[#cbd6c9]">
              Mengorkestrasi validasi role, kebun, dan approval panen sebelum manifest pengiriman dibuat.
            </p>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-[8px] border border-[#303030] bg-[#171717]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b2b2b] px-6 py-5">
          <h2 className="text-2xl font-black text-[#f4f4f4]">RPC Coverage Matrix</h2>
          <StatusBadge>Payment skipped</StatusBadge>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full border-collapse text-left">
            <thead className="bg-[#202020]">
              <tr>
                {['Caller', 'Target', 'RPC', 'Tujuan', 'Status'].map((header) => (
                  <th key={header} className="px-5 py-4 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#292929]">
              {integrationRows.map((row) => (
                <tr key={`${row.caller}-${row.target}-${row.rpc}`} className="align-top">
                  <td className="px-5 py-4 text-[14px] font-black text-[#f4f4f4]">{row.caller}</td>
                  <td className="px-5 py-4 text-[14px] font-bold text-[#cbd6c9]">{row.target}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-[8px] bg-[#242424] px-3 py-2 font-mono text-[12px] font-black text-[#9ccfff]">
                      {row.rpc}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[14px] leading-6 text-[#dce6da]">{row.purpose}</td>
                  <td className="px-5 py-4">
                    <StatusBadge>{row.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
