import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getKebunDetail, assignMandor, unassignMandor, assignSupir, unassignSupir, getKebunList } from '../../../api/axios';

// Helper function to display coordinates
const getCoordDisplay = (koordinat) => {
  if (!koordinat) return '-';
  let coords = koordinat;
  if (typeof coords === 'string') {
    try { coords = JSON.parse(coords); } catch { return '-'; }
  }
  if (Array.isArray(coords) && coords.length > 0) {
    const lats = coords.map(c => c.lat);
    const lngs = coords.map(c => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return `${minLat},${minLng} - ${maxLat},${maxLng}`;
  }
  return '-';
};

// Helper to normalize kebun data from different response formats
const normalizeKebun = (data) => {
  // Handle wrapper { statusCode, message, data: {...} }
  const rawData = data.data || data;

  // Parse koordinat if it's a JSON string
  let koordinat = rawData.koordinat;
  if (typeof koordinat === 'string') {
    try {
      koordinat = JSON.parse(koordinat);
    } catch (e) {
      koordinat = null;
    }
  }

  return {
    kodeKebun: rawData.kodeKebun || rawData.kode || '',
    namaKebun: rawData.namaKebun || rawData.nama || '',
    luasHektare: rawData.luasHektare || rawData.luas || 0,
    koordinat: koordinat,
    mandorId: rawData.mandorId || rawData.mandor || null,
    supirIds: rawData.supirIds || rawData.supir || [],
    createdAt: rawData.createdAt || rawData.created_at,
  };
};

export default function KebunDetail() {
  const navigate = useNavigate();
  const { kode } = useParams();

  const [kebun, setKebun] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchSupirNama, setSearchSupirNama] = useState('');

  // Modal states
  const [showMandorModal, setShowMandorModal] = useState(false);
  const [showSupirModal, setShowSupirModal] = useState(false);
  const [availableMandor, setAvailableMandor] = useState([]);
  const [availableSupir, setAvailableSupir] = useState([]);
  const [selectedMandorId, setSelectedMandorId] = useState('');
  const [selectedSupirId, setSelectedSupirId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchSupirNama) params.searchSupirNama = searchSupirNama;
      const response = await getKebunDetail(kode, params);
      setKebun(normalizeKebun(response.data));
      setError(null);
    } catch (err) {
      setError('Failed to load kebun detail');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [kode]);

  const handleSearchSupir = (e) => {
    e.preventDefault();
    fetchDetail();
  };

  const openMandorModal = async () => {
    try {
      // Get all kebun to find available mandor (not assigned to any kebun)
      const response = await getKebunList({});
      const allKebun = response.data?.data || [];

      // Find mandor that's not assigned to any kebun
      const assignedMandorIds = allKebun
        .filter(k => k.mandorId && k.kodeKebun !== kode)
        .map(k => k.mandorId);

      // For demo, we'll show a mock list. In real app, you'd have a mandor API
      // Here we'll simulate by showing available mandor option
      setAvailableMandor([
        { id: 'mandor-1', nama: 'Budi Santoso' },
        { id: 'mandor-2', nama: 'Ahmad Wijaya' },
        { id: 'mandor-3', nama: 'Hendra Pratama' },
      ].filter(m => !assignedMandorIds.includes(m.id)));

      setShowMandorModal(true);
    } catch (err) {
      alert('Failed to load mandor data');
    }
  };

  const openSupirModal = async () => {
    try {
      // Get all supir not assigned to THIS kebun
      const response = await getKebunList({});
      const allKebun = response.data?.data || [];

      const currentSupirIds = allKebun.find(k => k.kodeKebun === kode)?.supirIds || [];

      // Mock data - in real app, you'd have supir API
      setAvailableSupir([
        { id: 'supir-1', nama: 'Soleh' },
        { id: 'supir-2', nama: 'Joko' },
        { id: 'supir-3', nama: 'Rudi' },
        { id: 'supir-4', nama: 'Hadi' },
      ].filter(s => !currentSupirIds.includes(s.id)));

      setShowSupirModal(true);
    } catch (err) {
      alert('Failed to load supir data');
    }
  };

  const handleAssignMandor = async () => {
    if (!selectedMandorId) return;
    try {
      setSubmitting(true);
      await assignMandor(kode, selectedMandorId);
      setShowMandorModal(false);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign mandor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignMandor = async (target) => {
    if (!confirm(`Apakah Anda yakin ingin melepaskan mandor dari kebun ini${target ? ` dan dipindahkan ke ${target}` : ''}?`)) return;
    try {
      setSubmitting(true);
      await unassignMandor(kode, target || undefined);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign mandor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignSupir = async () => {
    if (!selectedSupirId) return;
    try {
      setSubmitting(true);
      await assignSupir(kode, selectedSupirId);
      setShowSupirModal(false);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign supir');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignSupir = async (supirId, target) => {
    if (!confirm(`Apakah Anda yakin ingin melepaskan supir ini${target ? ` dan dipindahkan ke ${target}` : ''}?`)) return;
    try {
      setSubmitting(true);
      await unassignSupir(kode, supirId, target || undefined);
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unassign supir');
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

  if (error || !kebun) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Kebun tidak ditemukan'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate('/kebun')} className="text-gray-600 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Detail Kebun</h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Kebun</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Kode</p>
              <p className="font-medium">{kebun.kodeKebun}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nama</p>
              <p className="font-medium">{kebun.namaKebun}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Luas</p>
              <p className="font-medium">{kebun.luasHektare} Ha</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Koordinat</p>
              <p className="font-medium text-sm">
                {getCoordDisplay(kebun.koordinat)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              to={`/kebun/${kode}/edit`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Edit Kebun
            </Link>
          </div>
        </div>

        {/* Mandor Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Mandor</h2>
            <div className="flex gap-2">
              <button
                onClick={openMandorModal}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Assign Mandor
              </button>
              {kebun.mandorId && (
                <button
                  onClick={() => handleUnassignMandor('')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Unassign
                </button>
              )}
            </div>
          </div>
          {kebun.mandorId ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-green-800">Mandor Assigned (ID: {kebun.mandorId})</span>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-500">Belum ada mandor assigned</div>
          )}
        </div>

        {/* Supir Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Supir ({kebun.supirIds?.length || 0})</h2>
            <div className="flex gap-2">
              <button
                onClick={openSupirModal}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Tambah Supir
              </button>
            </div>
          </div>

          {/* Search Supir */}
          <form onSubmit={handleSearchSupir} className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Cari nama supir..."
              value={searchSupirNama}
              onChange={(e) => setSearchSupirNama(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Cari
            </button>
          </form>

          {kebun.supirIds && kebun.supirIds.length > 0 ? (
            <div className="space-y-2">
              {kebun.supirIds.map((supirId) => (
                <div key={supirId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Supir ID: {supirId}</span>
                  <button
                    onClick={() => handleUnassignSupir(supirId, '')}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">Belum ada supir assigned</div>
          )}
        </div>

        {/* Mandor Modal */}
        {showMandorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Assign Mandor</h3>
              {availableMandor.length === 0 ? (
                <p className="text-gray-500">Semua mandor sudah terassign ke kebun lain</p>
              ) : (
                <select
                  value={selectedMandorId}
                  onChange={(e) => setSelectedMandorId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="">Pilih Mandor</option>
                  {availableMandor.map((m) => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowMandorModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignMandor}
                  disabled={!selectedMandorId || submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Supir Modal */}
        {showSupirModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Tambah Supir</h3>
              {availableSupir.length === 0 ? (
                <p className="text-gray-500">Semua supir sudah terassign ke kebun ini</p>
              ) : (
                <select
                  value={selectedSupirId}
                  onChange={(e) => setSelectedSupirId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                >
                  <option value="">Pilih Supir</option>
                  {availableSupir.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowSupirModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSupir}
                  disabled={!selectedSupirId || submitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}