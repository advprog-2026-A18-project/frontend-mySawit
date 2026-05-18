import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, loginWithGoogle } from '../../../api/axios';
import { persistAuthSession } from '../authStorage';
import AuthShell from '../components/AuthShell';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const roleOptions = [
  { value: 'BURUH', label: 'Buruh' },
  { value: 'MANDOR', label: 'Mandor' },
  { value: 'SUPIR', label: 'Supir' },
];

const inputClass =
  'h-12 w-full rounded-xl border border-[#1a3a22] bg-[#0a1a0f] px-4 text-[14px] text-white outline-none placeholder:text-[#3a5c42] transition focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15';

const labelClass = 'mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b8a72]';

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [googleCredential, setGoogleCredential] = useState('');
  const [needsGoogleRole, setNeedsGoogleRole] = useState(false);
  const [googleProfile, setGoogleProfile] = useState({ role: 'BURUH', nomorSertifikasi: '' });

  const finishAuth = useCallback((response) => {
    persistAuthSession(response.data?.data);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const handleGoogleCredential = useCallback(async (credential, profile = googleProfile) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await loginWithGoogle({
        idToken: credential,
        role: needsGoogleRole ? profile.role : undefined,
        nomorSertifikasi: profile.role === 'MANDOR' ? profile.nomorSertifikasi : undefined,
      });
      finishAuth(response);
    } catch (error) {
      const status = error.response?.status;
      const text = error.response?.data?.message || 'Login Google gagal.';
      if (status === 400 && text.toLowerCase().includes('role')) {
        setGoogleCredential(credential);
        setNeedsGoogleRole(true);
        setMessage({ type: 'info', text: 'Akun Google belum terdaftar. Pilih role untuk membuat akun.' });
      } else {
        setMessage({ type: 'error', text });
      }
    } finally {
      setLoading(false);
    }
  }, [finishAuth, googleProfile, needsGoogleRole]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;
    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: ({ credential }) => handleGoogleCredential(credential),
      });
      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'filled_black',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        width: googleButtonRef.current.offsetWidth || 360,
      });
    };
    if (window.google?.accounts?.id) { renderGoogleButton(); return; }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, [handleGoogleCredential]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const response = await login(form);
      if (rememberDevice) localStorage.setItem('rememberDevice', 'true');
      else localStorage.removeItem('rememberDevice');
      finishAuth(response);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Email atau password tidak valid.' });
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleRegistration = (event) => {
    event.preventDefault();
    if (!googleCredential) return;
    handleGoogleCredential(googleCredential, googleProfile);
  };

  return (
    <AuthShell>
      <div className="space-y-7">
        {/* Header */}
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a1f12] border border-[#1a3a22] text-2xl">
            🌴
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-white">
            Selamat Datang
          </h1>
          <p className="mt-2 text-[14px] text-[#4a6b52]">
            Masuk ke MySawit Control Center
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-[13px] font-medium ${
              message.type === 'error'
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label>
              <span className={labelClass}>Email Perusahaan</span>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))}
                placeholder="nama@mysawit.co.id"
                autoComplete="email"
                required
              />
            </label>
          </div>

          <div>
            <label>
              <span className={`${labelClass} flex items-center justify-between`}>
                <span>Password</span>
                <a
                  className="text-[10px] font-bold text-[#4ade80] hover:text-[#86efac] normal-case tracking-normal"
                  href="mailto:admin@mysawit.local"
                >
                  Lupa password?
                </a>
              </span>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3a5c42] hover:text-[#4ade80] transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    )}
                  </svg>
                </button>
              </div>
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                className="peer sr-only"
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              <div className="h-5 w-5 rounded-md border border-[#1a3a22] bg-[#0a1a0f] transition peer-checked:border-[#4ade80] peer-checked:bg-[#0a1f12]" />
              <svg
                className="absolute inset-0 m-auto h-3 w-3 text-[#4ade80] opacity-0 transition peer-checked:opacity-100"
                fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
              </svg>
            </div>
            <span className="text-[13px] text-[#4a6b52]">Ingat perangkat ini selama 30 hari</span>
          </label>

          <button
            className="mt-1 h-12 w-full rounded-xl bg-[#166534] text-[13px] font-black uppercase tracking-[0.15em] text-white shadow-[0_0_20px_rgba(74,222,128,0.15)] transition-all hover:bg-[#15803d] hover:shadow-[0_0_24px_rgba(74,222,128,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Authenticating...
              </span>
            ) : (
              'Masuk ke Sistem'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-[#1a2e20]" />
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#3a5c42]">
            atau masuk dengan
          </span>
          <span className="h-px flex-1 bg-[#1a2e20]" />
        </div>

        {/* Google button */}
        <div className="overflow-hidden rounded-xl border border-[#1a3a22] bg-[#0a1a0f] p-2">
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex min-h-11 w-full justify-center" />
          ) : (
            <p className="px-3 py-2 text-center text-[12px] font-medium text-[#6b8a72]">
              Set <code className="text-[#4ade80]">VITE_GOOGLE_CLIENT_ID</code> untuk mengaktifkan Login Google.
            </p>
          )}
        </div>

        {/* Google role selection */}
        {needsGoogleRole && (
          <form
            className="space-y-4 rounded-xl border border-[#1a3a22] bg-[#0a1a0f] p-4"
            onSubmit={completeGoogleRegistration}
          >
            <p className="text-[12px] font-bold text-[#4ade80]">Lengkapi Registrasi Google</p>
            <label>
              <span className={labelClass}>Role Akun</span>
              <select
                className={inputClass}
                value={googleProfile.role}
                onChange={(e) => setGoogleProfile((c) => ({ ...c, role: e.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value} style={{ background: '#0a1a0f' }}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>
            {googleProfile.role === 'MANDOR' && (
              <label>
                <span className={labelClass}>Nomor Sertifikasi</span>
                <input
                  className={inputClass}
                  value={googleProfile.nomorSertifikasi}
                  onChange={(e) => setGoogleProfile((c) => ({ ...c, nomorSertifikasi: e.target.value }))}
                  required
                />
              </label>
            )}
            <button
              className="h-11 w-full rounded-xl bg-[#166534] text-[12px] font-black uppercase tracking-widest text-white hover:bg-[#15803d] disabled:opacity-60 transition-all active:scale-[0.98]"
              type="submit"
              disabled={loading}
            >
              Selesaikan Registrasi
            </button>
          </form>
        )}

        {/* Register link */}
        <p className="text-center text-[13px] text-[#4a6b52]">
          Belum punya akun?{' '}
          <Link className="font-bold text-[#4ade80] hover:text-[#86efac] transition-colors" to="/register">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
