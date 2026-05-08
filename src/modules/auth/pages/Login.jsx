import { useEffect, useRef, useState } from 'react';
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

export default function Login() {
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [googleCredential, setGoogleCredential] = useState('');
  const [needsGoogleRole, setNeedsGoogleRole] = useState(false);
  const [googleProfile, setGoogleProfile] = useState({
    role: 'BURUH',
    nomorSertifikasi: '',
  });

  const finishAuth = (response) => {
    persistAuthSession(response.data?.data);
    navigate('/kebun', { replace: true });
  };

  const handleGoogleCredential = async (credential, profile = googleProfile) => {
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
      const text = error.response?.data?.message || 'Login Google gagal. Coba beberapa saat lagi.';

      if (status === 400 && text.toLowerCase().includes('role')) {
        setGoogleCredential(credential);
        setNeedsGoogleRole(true);
        setMessage({
          type: 'info',
          text: 'Akun Google ini belum terdaftar. Pilih role untuk membuat akun.',
        });
      } else {
        setMessage({ type: 'error', text });
      }
    } finally {
      setLoading(false);
    }
  };

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
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        width: googleButtonRef.current.offsetWidth || 360,
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await login(form);

      if (rememberDevice) {
        localStorage.setItem('rememberDevice', 'true');
      } else {
        localStorage.removeItem('rememberDevice');
      }

      finishAuth(response);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Email atau password tidak valid.',
      });
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            System Authentication
          </h1>
          <p className="mt-3 text-base text-slate-700">
            Enter your credentials to access the Admin Console.
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md border px-4 py-3 text-sm font-medium ${
              message.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
              Corporate Email
            </span>
            <input
              className="h-16 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-lg text-slate-950 outline-none placeholder:text-slate-500 focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
              type="email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              placeholder="name@estatemaster.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center justify-between gap-3 text-sm font-extrabold uppercase tracking-widest text-slate-800">
              Password
              <a className="text-green-800 hover:text-green-600" href="mailto:admin@estatemaster.com">
                Forgot Password?
              </a>
            </span>
            <input
              className="h-16 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-lg text-slate-950 outline-none placeholder:text-slate-500 focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
              type="password"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <label className="flex items-center gap-3 text-base text-slate-700">
            <input
              className="h-5 w-5 rounded border-lime-700/40 text-green-700 focus:ring-green-700"
              type="checkbox"
              checked={rememberDevice}
              onChange={(event) => setRememberDevice(event.target.checked)}
            />
            Remember device for 30 days
          </label>

          <button
            className="h-16 w-full rounded-md bg-[#007713] px-5 text-sm font-extrabold uppercase tracking-widest text-white shadow-sm hover:bg-[#00620f] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Authenticate Access'}
          </button>
        </form>

        <div className="flex items-center gap-5">
          <span className="h-px flex-1 bg-lime-700/30" />
          <span className="text-sm font-extrabold uppercase tracking-widest text-slate-950">
            Or Authorize With
          </span>
          <span className="h-px flex-1 bg-lime-700/30" />
        </div>

        <div className="rounded-md border border-lime-700/35 bg-transparent p-2">
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex min-h-11 w-full justify-center" />
          ) : (
            <p className="px-3 py-2 text-center text-sm font-medium text-amber-700">
              Set VITE_GOOGLE_CLIENT_ID untuk mengaktifkan Login with Google.
            </p>
          )}
        </div>

        {needsGoogleRole && (
          <form className="space-y-4 rounded-md border border-green-200 bg-green-50 p-4" onSubmit={completeGoogleRegistration}>
            <label className="block">
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Role Account
              </span>
              <select
                className="h-12 w-full rounded-md border border-green-700/30 bg-white px-3 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                value={googleProfile.role}
                onChange={(event) =>
                  setGoogleProfile((current) => ({ ...current, role: event.target.value }))
                }
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            {googleProfile.role === 'MANDOR' && (
              <label className="block">
                <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                  Nomor Sertifikasi
                </span>
                <input
                  className="h-12 w-full rounded-md border border-green-700/30 bg-white px-3 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                  value={googleProfile.nomorSertifikasi}
                  onChange={(event) =>
                    setGoogleProfile((current) => ({
                      ...current,
                      nomorSertifikasi: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            )}

            <button
              className="h-12 w-full rounded-md bg-[#007713] text-sm font-extrabold uppercase tracking-widest text-white hover:bg-[#00620f] disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              Complete Google Registration
            </button>
          </form>
        )}

        <p className="text-center text-base text-slate-800">
          New to the plantation network?{' '}
          <Link className="font-extrabold text-green-800 hover:text-green-600" to="/register">
            Request Account Registration
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
