import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../../api/axios';
import { persistAuthSession } from '../authStorage';
import AuthShell from '../components/AuthShell';

const roleOptions = [
  { value: 'BURUH', label: 'Buruh' },
  { value: 'MANDOR', label: 'Mandor' },
  { value: 'SUPIR', label: 'Supir' },
];

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
      navigate('/kebun', { replace: true });
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
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Account Registration
          </h1>
          <p className="mt-3 text-base text-slate-700">
            Create worker access for the plantation management console.
          </p>
        </div>

        {message && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {message.text}
          </div>
        )}

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Username
              </span>
              <input
                className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                name="username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Full Name
              </span>
              <input
                className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
              Corporate Email
            </span>
            <input
              className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
              Password
            </span>
            <input
              className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <span className="mt-2 block text-xs font-medium text-slate-500">
              Minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka.
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                Role
              </span>
              <select
                className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </label>

            {form.role === 'MANDOR' && (
              <label>
                <span className="mb-2 block text-sm font-extrabold uppercase tracking-widest text-slate-800">
                  Nomor Sertifikasi
                </span>
                <input
                  className="h-13 w-full rounded-md border border-lime-700/35 bg-transparent px-4 text-slate-950 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                  name="nomorSertifikasi"
                  value={form.nomorSertifikasi}
                  onChange={handleChange}
                  required
                />
              </label>
            )}
          </div>

          <button
            className="mt-2 h-16 w-full rounded-md bg-[#007713] px-5 text-sm font-extrabold uppercase tracking-widest text-white shadow-sm hover:bg-[#00620f] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Request Registration'}
          </button>
        </form>

        <p className="text-center text-base text-slate-800">
          Already registered?{' '}
          <Link className="font-extrabold text-green-800 hover:text-green-600" to="/login">
            Authenticate Access
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
