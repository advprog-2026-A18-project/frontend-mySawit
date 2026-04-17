import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getKebunDetail, getKebunList, createKebun, updateKebun } from '../../../api/axios';

// Helper to parse koordinat from JSON string or array
const parseKoordinat = (koordinat) => {
  if (!koordinat) return null;
  if (typeof koordinat === 'string') {
    try {
      return JSON.parse(koordinat);
    } catch { return null; }
  }
  if (Array.isArray(koordinat)) return koordinat;
  return null;
};

// Check if rectangles overlap
function checkOverlap(newCoords, existingKebuns, excludeKode = null) {
  if (!newCoords || newCoords.length === 0) return null;

  // newCoords is array of {lat, lng} points - calculate bounds
  const newLats = newCoords.map(c => c.lat);
  const newLngs = newCoords.map(c => c.lng);
  const newMinLat = Math.min(...newLats);
  const newMaxLat = Math.max(...newLats);
  const newMinLng = Math.min(...newLngs);
  const newMaxLng = Math.max(...newLngs);

  for (const kebun of existingKebuns) {
    if (excludeKode && kebun.kodeKebun === excludeKode) continue;

    const existingCoords = parseKoordinat(kebun.koordinat);
    if (!existingCoords || existingCoords.length === 0) continue;

    const existLats = existingCoords.map(c => c.lat);
    const existLngs = existingCoords.map(c => c.lng);
    const existMinLat = Math.min(...existLats);
    const existMaxLat = Math.max(...existLats);
    const existMinLng = Math.min(...existLngs);
    const existMaxLng = Math.max(...existLngs);

    // Check if rectangles overlap
    if (!(newMaxLat < existMinLat || newMinLat > existMaxLat ||
          newMaxLng < existMinLng || newMinLng > existMaxLng)) {
      return kebun.namaKebun;
    }
  }
  return null;
}

export default function KebunForm() {
  const navigate = useNavigate();
  const { kode } = useParams();
  const isEdit = kode && kode !== 'new';

  const [formData, setFormData] = useState({
    kodeKebun: '',
    namaKebun: '',
    luasHektare: '',
    koordinat: '', // JSON string input
  });
  const [existingKebuns, setExistingKebuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const listRes = await getKebunList({});
        // Handle wrapper response: { statusCode, message, data: [...] }
        setExistingKebuns(listRes.data?.data || []);

        if (isEdit) {
          const detailRes = await getKebunDetail(kode);
          const data = detailRes.data?.data || detailRes.data;
          const coords = parseKoordinat(data.koordinat);
          setFormData({
            kodeKebun: data.kodeKebun || '',
            namaKebun: data.namaKebun || '',
            luasHektare: data.luasHektare || '',
            koordinat: coords ? JSON.stringify(coords) : '',
          });
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [kode, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const validateCoords = () => {
    if (!formData.koordinat) return true;

    let newCoords;
    try {
      newCoords = JSON.parse(formData.koordinat);
    } catch {
      setValidationError('Format koordinat harus JSON array');
      return false;
    }

    if (!Array.isArray(newCoords) || newCoords.length < 3) {
      setValidationError('Koordinat minimal harus 3 titik (polygon)');
      return false;
    }

    const overlapping = checkOverlap(newCoords, existingKebuns, isEdit ? kode : null);
    if (overlapping) {
      setValidationError(`Koordinat overlapping dengan "${overlapping}"`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCoords()) return;

    const payload = {
      kodeKebun: formData.kodeKebun,
      namaKebun: formData.namaKebun,
      luasHektare: parseFloat(formData.luasHektare),
      koordinat: formData.koordinat || null,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await updateKebun(kode, payload);
      } else {
        await createKebun(payload);
      }
      navigate('/kebun');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save kebun';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/kebun')}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Kebun' : 'Tambah Kebun'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Kebun <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="kodeKebun"
              value={formData.kodeKebun}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kebun <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaKebun"
              value={formData.namaKebun}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Luas (Hektare) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="luasHektare"
              value={formData.luasHektare}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Koordinat (JSON Array)
            </label>
            <textarea
              name="koordinat"
              value={formData.koordinat}
              onChange={handleChange}
              placeholder='[{"lat":0,"lng":0},{"lat":200,"lng":0},{"lat":200,"lng":200},{"lat":0,"lng":200}]'
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-1">Format: JSON array of {`{lat, lng}`} points</p>
          </div>

          {validationError && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              {validationError}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : isEdit ? 'Update Kebun' : 'Simpan Kebun'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/kebun')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}