import { useCallback, useEffect, useState } from 'react';
import { getMyProfile, getWallet, updateMyProfile, unwrapApiData } from '../../../api/axios';
import { persistAuthSession } from '../authStorage';

const inputClass =
  'h-11 w-full rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-3 text-[14px] text-white outline-none placeholder:text-[#3a5c42] transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15';

const roleBadge = {
  ADMIN: 'bg-[#2a1f0a] text-[#fbbf24] border-[#3a2f0a]',
  MANDOR: 'bg-[#0a1520] text-[#60a5fa] border-[#0a2030]',
  BURUH: 'bg-[#0a1f12] text-[#4ade80] border-[#0a2a12]',
  SUPIR: 'bg-[#1f0a16] text-[#f472b6] border-[#2f0a20]',
};

const money = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const resolveWalletOwnerId = (user) => {
  if (!user) return null;
  if (user.role === 'ADMIN') return 'admin-default';
  return user.id || user.userId || null;
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletStatus, setWalletStatus] = useState('loading');
  const [form, setForm] = useState({ fullname: '', username: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setWalletStatus('loading');
    try {
      const response = await getMyProfile();
      const data = unwrapApiData(response);
      setProfile(data);
      setForm({ fullname: data?.fullname || '', username: data?.username || '' });
      setMessage(null);

      const walletOwnerId = resolveWalletOwnerId(data);
      if (!walletOwnerId) {
        setWallet(null);
        setWalletStatus('missing-owner');
        return;
      }

      try {
        const walletResponse = await getWallet(walletOwnerId);
        setWallet(unwrapApiData(walletResponse));
        setWalletStatus('ready');
      } catch {
        setWallet(null);
        setWalletStatus('not-found');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal mengambil profil.' });
      setWallet(null);
      setWalletStatus('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await updateMyProfile(form);
      const data = unwrapApiData(response);
      setProfile(data);
      persistAuthSession({
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
        user: data,
      });
      setMessage({ type: 'success', text: response.data?.message || 'Profil berhasil diperbarui.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally {
      setLoading(false);
    }
  };

  const roleStyle = roleBadge[profile?.role] || 'bg-[#1a1a1a] text-[#8a9a8e] border-[#2a2a2a]';
  const walletOwnerId = resolveWalletOwnerId(profile);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-7">
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[8px] border border-[#255b39] bg-[#102518] text-3xl font-black text-[#52ef8b]">
            {(profile?.fullname || profile?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Profil Saya</p>
            <h1 className="mt-1 text-3xl font-black text-[#f4f4f4]">
              {profile?.fullname || profile?.username || '—'}
            </h1>
            {profile?.role && (
              <span className={`mt-1.5 inline-block rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${roleStyle}`}>
                {profile.role}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl border px-4 py-3 text-[13px] font-semibold ${
            message.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-400'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Wallet balance */}
      <section className="overflow-hidden rounded-[8px] border border-[#255b39] bg-[#07110b]">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#52ef8b]">
              Wallet Balance
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">
              {walletStatus === 'loading' && loading
                ? 'Memuat saldo...'
                : money.format(Number(wallet?.balance || 0))}
            </h2>
            <p className="mt-3 max-w-2xl text-[13px] font-semibold leading-6 text-[#8a9a8e]">
              {walletStatus === 'ready'
                ? 'Saldo wallet dari modul Manajemen Pembayaran untuk akun ini.'
                : 'Wallet akun ini belum tersedia di modul pembayaran atau belum pernah menerima payroll.'}
            </p>
          </div>
          <div className="border-t border-[#163522] bg-[#0b1b10] p-6 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">Owner ID</p>
            <p className="mt-2 break-all font-mono text-[13px] font-bold text-[#d8e7d6]">
              {wallet?.ownerId || walletOwnerId || '—'}
            </p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">Owner Role</p>
            <p className="mt-2 text-[13px] font-black text-[#52ef8b]">
              {wallet?.ownerRole || profile?.role || '—'}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* Account details */}
        <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-5">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">Detail Akun</p>
          <h2 className="text-[15px] font-black text-white">Informasi</h2>
          <dl className="mt-5 space-y-4">
            {[
              { label: 'User ID', value: profile?.id || profile?.userId, mono: true },
              { label: 'Email', value: profile?.email, mono: true },
              { label: 'Role', value: profile?.role },
              { label: 'Mandor', value: profile?.namaMandor },
              { label: 'Nomor Sertifikasi', value: profile?.nomorSertifikasi, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="rounded-xl border border-[#0f1f17] bg-[#060d09] px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">{label}</dt>
                <dd
                  className={`mt-1 text-[13px] font-semibold text-[#8a9a8e] ${mono ? 'font-mono' : ''} ${value ? 'text-white' : ''}`}
                >
                  {value || '—'}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Edit form */}
        <form className="rounded-[8px] border border-[#303030] bg-[#171717] p-5" onSubmit={handleSubmit}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#3a5c42]">Edit Profil</p>
          <h2 className="text-[15px] font-black text-white">Ubah Data</h2>
          <div className="mt-5 space-y-4">
            <label>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b8a72]">
                Nama Lengkap
              </span>
              <input
                className={inputClass}
                value={form.fullname}
                onChange={(e) => setForm((c) => ({ ...c, fullname: e.target.value }))}
                placeholder="Nama lengkap Anda"
                required
              />
            </label>
            <label>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b8a72]">
                Username
              </span>
              <input
                className={inputClass}
                value={form.username}
                onChange={(e) => setForm((c) => ({ ...c, username: e.target.value }))}
                placeholder="username_anda"
                required
              />
            </label>

            <div className="pt-2">
              <button
                className="h-11 w-full rounded-xl bg-[#166534] text-[13px] font-black uppercase tracking-[0.15em] text-white shadow-[0_0_16px_rgba(74,222,128,0.15)] transition-all hover:bg-[#15803d] hover:shadow-[0_0_20px_rgba(74,222,128,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Menyimpan...
                  </span>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
