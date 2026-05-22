import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../../api/axios';
import { persistAuthSession } from '../authStorage';
import AuthShell from '../components/AuthShell';

const roleOptions = [
  { value: 'BURUH', label: 'Buruh', desc: 'Personel pemanen lapangan', code: 'BR' },
  { value: 'MANDOR', label: 'Mandor', desc: 'Pengawas operasional kebun', code: 'MD' },
  { value: 'SUPIR', label: 'Supir', desc: 'Armada transportasi hasil panen', code: 'SP' },
];

const inputClass =
  'h-12 w-full rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-4 text-[14px] text-white outline-none placeholder:text-[#3a5c42] transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15';

const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b8a72]';

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    role: 'BURUH',
    nomorSertifikasi: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await register({
        username: form.username,
        fullname: form.fullname,
        email: form.email,
        password: form.password,
        role: form.role,
        nomorSertifikasi: form.role === 'MANDOR' ? form.nomorSertifikasi : undefined,
      });
      persistAuthSession(response.data?.data);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Registrasi gagal. Periksa data lalu coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell mode="register">
      <div className="space-y-7">
        {/* Header */}
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[8px] border border-[#255b39] bg-[#102518] text-[13px] font-black text-[#52ef8b]">
            MS
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-white">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-[14px] text-[#4a6b52]">
            Daftarkan akses ke MySawit Control Center
          </p>
        </div>

        {message && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[13px] font-medium text-red-400">
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username + Fullname */}
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Username</span>
              <input
                className={inputClass}
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder="username_anda"
                required
              />
            </label>
            <label>
              <span className={labelClass}>Nama Lengkap</span>
              <input
                className={inputClass}
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Nama lengkap Anda"
                required
              />
            </label>
          </div>

          {/* Email */}
          <label>
            <span className={labelClass}>Email Perusahaan</span>
            <input
              className={inputClass}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="nama@mysawit.co.id"
              required
            />
          </label>

          {/* Password */}
          <label>
            <span className={labelClass}>Password</span>
            <input
              className={inputClass}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Min. 8 karakter"
              minLength={8}
              required
            />
            <span className="mt-2 block text-[11px] text-[#3a5c42]">
              Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.
            </span>
          </label>

          {/* Role selection */}
          <div>
            <span className={labelClass}>Role Akun</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, role: role.value }))}
                  className={`rounded-xl border p-3 text-left transition-all duration-150 ${
                    form.role === role.value
                      ? 'border-[#4ade80] bg-[#0a1f12] shadow-[0_0_12px_rgba(74,222,128,0.15)]'
                      : 'border-[#1a3a22] bg-[#080f0a] hover:border-[#2a5a32] hover:bg-[#0a1a0f]'
                  }`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#102518] text-[11px] font-black text-[#52ef8b]">
                    {role.code}
                  </span>
                  <p className={`mt-1 text-[13px] font-black ${form.role === role.value ? 'text-[#4ade80]' : 'text-white'}`}>
                    {role.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#3a5c42]">{role.desc}</p>
                </button>
              ))}
            </div>
            {/* Hidden select for form submit */}
            <select name="role" value={form.role} onChange={handleChange} className="sr-only" required>
              {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Nomor sertifikasi (Mandor only) */}
          {form.role === 'MANDOR' && (
            <label>
              <span className={labelClass}>Nomor Sertifikasi Mandor</span>
              <input
                className={inputClass}
                name="nomorSertifikasi"
                value={form.nomorSertifikasi}
                onChange={handleChange}
                placeholder="Masukkan nomor sertifikasi"
                required
              />
            </label>
          )}

          <button
            className="mt-2 h-12 w-full rounded-xl bg-[#166534] text-[13px] font-black uppercase tracking-[0.15em] text-white shadow-[0_0_20px_rgba(74,222,128,0.15)] transition-all hover:bg-[#15803d] hover:shadow-[0_0_24px_rgba(74,222,128,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Mendaftarkan...
              </span>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        <p className="text-center text-[13px] text-[#4a6b52]">
          Sudah punya akun?{' '}
          <Link className="font-bold text-[#4ade80] hover:text-[#86efac] transition-colors" to="/login">
            Masuk ke Sistem
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
