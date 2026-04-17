import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getKebunList, deleteKebun } from '../../../api/axios';

// Helper function to get coordinate display
const getCoordDisplay = (kebun) => {
  if (!kebun.koordinat) return '-';
  // koordinat can be string (JSON) or array
  let coords = kebun.koordinat;
  if (typeof coords === 'string') {
    try { coords = JSON.parse(coords); } catch { return '-'; }
  }
  if (Array.isArray(coords) && coords.length > 0) {
    // Show bounds: min lat,min lng to max lat,max lng
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

export default function KebunList() {
  const [kebuns, setKebuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchNama, setSearchNama] = useState('');
  const [searchKode, setSearchKode] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchKebuns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchNama) params.searchNama = searchNama;
      if (searchKode) params.searchKode = searchKode;
      const response = await getKebunList(params);
      // API returns { statusCode, message, data: [...] }
      const data = response.data?.data || [];
      setKebuns(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch kebun data: ' + (err.message || 'Unknown error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKebuns();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKebuns();
  };

  const handleDelete = async (kode) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kebun ini?')) return;

    try {
      setDeleteLoading(kode);
      await deleteKebun(kode);
      fetchKebuns();
    } catch (err) {
      const message = err.response?.data?.message || 'Gagal menghapus kebun';
      alert(message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Kebun Sawit</h1>
          <Link
            to="/kebun/new"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kebun
          </Link>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari nama kebun..."
                value={searchNama}
                onChange={(e) => setSearchNama(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari kode kebun..."
                value={searchKode}
                onChange={(e) => setSearchKode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        ) : kebuns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Tidak ada data kebun
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas (Ha)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Koordinat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mandor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supir</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kebuns.map((kebun) => (
                  <tr key={kebun.kodeKebun} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{kebun.kodeKebun}</td>
                    <td className="px-6 py-4">{kebun.namaKebun}</td>
                    <td className="px-6 py-4">{kebun.luasHektare}</td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {getCoordDisplay(kebun)}
                    </td>
                    <td className="px-6 py-4">
                      {kebun.mandorId ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Assigned</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">Belum</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {kebun.supirIds?.length || 0} supir
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <Link
                        to={`/kebun/${kebun.kodeKebun}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Detail
                      </Link>
                      <Link
                        to={`/kebun/${kebun.kodeKebun}/edit`}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(kebun.kodeKebun)}
                        disabled={deleteLoading === kebun.kodeKebun}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {deleteLoading === kebun.kodeKebun ? 'Menghapus...' : 'Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}