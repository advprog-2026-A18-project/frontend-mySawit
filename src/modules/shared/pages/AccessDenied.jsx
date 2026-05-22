import { Link } from 'react-router-dom';
import { getAuthUser } from '../../auth/authStorage';

export default function AccessDenied() {
  const user = getAuthUser();

  return (
    <section className="mx-auto flex min-h-[62vh] max-w-3xl items-center">
      <div className="w-full rounded-[8px] border border-[#303030] bg-[#171717] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">
          Access Control
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-[#f4f4f4]">
          Halaman Ini Dibatasi
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#b9c3b8]">
          Role aktif kamu adalah <span className="font-black text-[#52ef8b]">{user?.role || 'UNKNOWN'}</span>.
          Route ini membutuhkan role lain, jadi aksesnya ditahan dari sisi frontend.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="inline-flex h-11 items-center rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#07130c]" to="/dashboard">
            Kembali ke Dashboard
          </Link>
          <Link className="inline-flex h-11 items-center rounded-[8px] border border-[#303030] bg-[#222] px-5 text-[13px] font-bold text-[#dfe8dd]" to="/users/me">
            Lihat Profil
          </Link>
        </div>
      </div>
    </section>
  );
}
