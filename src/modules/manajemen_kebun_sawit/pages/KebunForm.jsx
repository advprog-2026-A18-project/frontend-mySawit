import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createKebun, getKebunDetail, getKebunList, unwrapApiData, updateKebun } from '../../../api/axios';

const inputClass =
  'h-11 rounded-[8px] border border-[#2d2d2d] bg-[#101f15] px-3 text-[13px] text-white outline-none placeholder:text-[#6d796d] focus:border-[#52ef8b] focus:ring-2 focus:ring-[#52ef8b]/15';

const initialForm = {
  kodeKebun: '',
  namaKebun: '',
  luasHektare: '',
  originLat: '',
  originLng: '',
  height: '',
  width: '',
};

function parseCoords(koordinat) {
  if (!koordinat) return [];
  if (Array.isArray(koordinat)) return koordinat;
  try {
    return JSON.parse(koordinat);
  } catch {
    return [];
  }
}

function coordsFromForm(form) {
  const lat = Number(form.originLat);
  const lng = Number(form.originLng);
  const height = Number(form.height);
  const width = Number(form.width);
  if ([lat, lng, height, width].some((value) => Number.isNaN(value))) return [];
  return [
    { lat, lng },
    { lat, lng: lng + width },
    { lat: lat + height, lng: lng + width },
    { lat: lat + height, lng },
  ];
}

function bounds(coords) {
  const lats = coords.map((item) => Number(item.lat));
  const lngs = coords.map((item) => Number(item.lng));
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

function overlaps(a, b) {
  return !(a.maxLat <= b.minLat || a.minLat >= b.maxLat || a.maxLng <= b.minLng || a.minLng >= b.maxLng);
}

function formFromCoords(data) {
  const coords = parseCoords(data.koordinat);
  if (coords.length !== 4) {
    return {
      kodeKebun: data.kodeKebun || '',
      namaKebun: data.namaKebun || '',
      luasHektare: data.luasHektare || '',
      originLat: '',
      originLng: '',
      height: '',
      width: '',
    };
  }

  const rect = bounds(coords);
  return {
    kodeKebun: data.kodeKebun || '',
    namaKebun: data.namaKebun || '',
    luasHektare: data.luasHektare || '',
    originLat: rect.minLat,
    originLng: rect.minLng,
    height: rect.maxLat - rect.minLat,
    width: rect.maxLng - rect.minLng,
  };
}

function getErrorMessage(error, fallback) {
  if (error.response?.status === 401) {
    return 'Sesi login sudah habis. Silakan login ulang lalu coba simpan lagi.';
  }
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === 'Network Error') {
    return 'Tidak bisa menghubungi service Kebun melalui gateway. Pastikan Docker Compose masih berjalan.';
  }
  return error.message || fallback;
}

export default function KebunForm() {
  const navigate = useNavigate();
  const { kode } = useParams();
  const isEdit = Boolean(kode);

  const [form, setForm] = useState(initialForm);
  const [existingKebuns, setExistingKebuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const koordinat = useMemo(() => coordsFromForm(form), [form]);
  const koordinatJson = useMemo(() => (koordinat.length === 4 ? JSON.stringify(koordinat) : ''), [koordinat]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const listResponse = await getKebunList({});
      setExistingKebuns(unwrapApiData(listResponse) || []);

      if (isEdit) {
        const detailResponse = await getKebunDetail(kode);
        setForm(formFromCoords(unwrapApiData(detailResponse) || {}));
      }
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Gagal memuat data kebun.') });
    } finally {
      setLoading(false);
    }
  }, [isEdit, kode]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage(null);
  };

  const validate = (kebuns = existingKebuns) => {
    if (!form.kodeKebun.trim()) return 'Kode kebun wajib diisi.';
    if (!form.namaKebun.trim()) return 'Nama kebun wajib diisi.';
    if (!form.luasHektare || Number(form.luasHektare) <= 0) return 'Luas hektare harus lebih dari 0.';
    if (koordinat.length !== 4) return 'Koordinat wajib membentuk persegi panjang 4 titik.';
    if (Number(form.height) <= 0 || Number(form.width) <= 0) return 'Panjang dan lebar area harus lebih dari 0.';

    const duplicateCode = kebuns.find((item) => item.kodeKebun === form.kodeKebun.trim());
    if (!isEdit && duplicateCode) return `Kode ${form.kodeKebun.trim()} sudah digunakan oleh ${duplicateCode.namaKebun}.`;

    const currentBounds = bounds(koordinat);
    const overlapping = kebuns.find((item) => {
      if (isEdit && item.kodeKebun === kode) return false;
      const itemCoords = parseCoords(item.koordinat);
      return itemCoords.length === 4 && overlaps(currentBounds, bounds(itemCoords));
    });
    if (overlapping) return `Koordinat overlap dengan ${overlapping.namaKebun}.`;
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const latestListResponse = await getKebunList({});
      const latestKebuns = unwrapApiData(latestListResponse) || [];
      setExistingKebuns(latestKebuns);

      const latestValidationMessage = validate(latestKebuns);
      if (latestValidationMessage) {
        setMessage({ type: 'error', text: latestValidationMessage });
        return;
      }

      const payload = {
        kodeKebun: form.kodeKebun.trim(),
        namaKebun: form.namaKebun.trim(),
        luasHektare: Number(form.luasHektare),
        koordinat: koordinatJson,
      };
      if (isEdit) {
        await updateKebun(kode, payload);
      } else {
        await createKebun(payload);
      }
      navigate('/kebun');
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Gagal menyimpan kebun.') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="rounded-[8px] border border-[#303030] bg-[#171717] p-8 text-[#cbd6c9]">Memuat form kebun...</div>;
  }

  return (
    <div className="space-y-6">
      <section>
        <button className="mb-3 text-[13px] font-bold text-[#9aa79a] hover:text-[#52ef8b]" type="button" onClick={() => navigate('/kebun')}>
          Kembali ke daftar
        </button>
        <p className="font-mono text-[12px] font-black uppercase tracking-[0.24em] text-[#52ef8b]">Field Assets</p>
        <h1 className="mt-2 text-4xl font-black text-[#f4f4f4]">{isEdit ? 'Edit Kebun' : 'Tambah Kebun'}</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[#c2cec0]">
          Area kebun harus berbentuk persegi panjang dan tidak overlap dengan kebun lain.
        </p>
      </section>

      {message && (
        <div className={`rounded-[8px] border px-4 py-3 text-[13px] font-bold ${message.type === 'error' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
          {message.text}
        </div>
      )}

      <form className="grid gap-5 xl:grid-cols-[1fr_0.85fr]" onSubmit={handleSubmit}>
        <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <h2 className="text-xl font-black text-[#f4f4f4]">Informasi Kebun</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Kode</span>
              <input className={inputClass} disabled={isEdit} name="kodeKebun" value={form.kodeKebun} onChange={updateForm} placeholder="KB001" />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Nama</span>
              <input className={inputClass} name="namaKebun" value={form.namaKebun} onChange={updateForm} placeholder="Kebun Sawit Utara" />
            </label>
            <label className="grid gap-2 md:col-span-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Luas Hektare</span>
              <input className={inputClass} min="1" name="luasHektare" type="number" value={form.luasHektare} onChange={updateForm} placeholder="120" />
            </label>
          </div>
        </section>

        <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-6">
          <h2 className="text-xl font-black text-[#f4f4f4]">Area Rectangle</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Lat Awal</span>
              <input className={inputClass} name="originLat" type="number" value={form.originLat} onChange={updateForm} placeholder="0" />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Lng Awal</span>
              <input className={inputClass} name="originLng" type="number" value={form.originLng} onChange={updateForm} placeholder="0" />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Tinggi</span>
              <input className={inputClass} min="1" name="height" type="number" value={form.height} onChange={updateForm} placeholder="100" />
            </label>
            <label className="grid gap-2">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[#9aa79a]">Lebar</span>
              <input className={inputClass} min="1" name="width" type="number" value={form.width} onChange={updateForm} placeholder="100" />
            </label>
          </div>
        </section>

        <section className="rounded-[8px] border border-[#303030] bg-[#171717] p-6 xl:col-span-2">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#f4f4f4]">Preview Koordinat</h2>
              <p className="mt-2 font-mono text-[12px] leading-6 text-[#9aa79a]">{koordinatJson || 'Lengkapi input area untuk melihat koordinat.'}</p>
            </div>
            <div className="flex gap-3">
              <button className="h-11 rounded-[8px] border border-[#303030] px-5 text-[13px] font-black text-[#cbd6c9]" type="button" onClick={() => navigate('/kebun')}>
                Batal
              </button>
              <button className="h-11 rounded-[8px] bg-[#35d174] px-5 text-[13px] font-black text-[#06120b] disabled:opacity-50" disabled={submitting} type="submit">
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}
