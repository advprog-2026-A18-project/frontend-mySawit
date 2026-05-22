import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getKebunList, unassignMandor, unassignSupir } from '../../../api/axios';

export default function MoveUser() {
  const navigate = useNavigate();
  const { kode, type, userId } = useParams();
  const isMandor = type === 'mandor';
  const isSupir = type === 'supir';

  const [kebuns, setKebuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedKebun, setSelectedKebun] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchKebuns();
  }, [search]);

  const fetchKebuns = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) {
        params.searchNama = search;
      }

      console.log('Fetching kebuns with params:', params);
      const response = await getKebunList(params);
      console.log('Kebun response:', response);

      // Handle different response formats
      let kebunsData = [];
      const responseData = response.data?.data;

      if (Array.isArray(responseData)) {
        // Filter out current kebun
        kebunsData = responseData.filter(k => k.kodeKebun !== kode);
      }

      console.log('Filtered kebunsData:', kebunsData);
      setKebuns(kebunsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching kebuns:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      setError('Gagal memuat data kebun: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchKebuns();
  };

  const handleMove = async () => {
    if (!selectedKebun) return;

    try {
      setSubmitting(true);
      if (isMandor) {
        await unassignMandor(kode, selectedKebun.kodeKebun);
      } else if (isSupir && userId) {
        await unassignSupir(kode, userId, selectedKebun.kodeKebun);
      }
      navigate(`/kebun/${kode}`);
    } catch (err) {
      alert(err.response?.data?.message || `Gagal memindahkan ${isMandor ? 'mandor' : 'supir'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/kebun/${kode}`)}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Pindahkan {isMandor ? 'Mandor' : 'Supir'}
          </h1>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>Catatan:</strong> {isMandor ? 'Mandor' : 'Supir'} ini akan dipindahkan ke kebun yang Anda pilih.
            {isSupir && userId && <span className="block mt-1">ID Supir: {userId}</span>}
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari nama kebun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Cari
            </button>
            <button
              type="button"
              onClick={() => { setSearch(''); }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Kebun List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b">
            <p className="text-sm text-gray-600">
              Klik untuk memilih kebun tujuan
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : kebuns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Tidak ada kebun lain tersedia
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {kebuns.map((kebun) => (
                <div
                  key={kebun.kodeKebun}
                  onClick={() => setSelectedKebun(kebun)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selectedKebun?.kodeKebun === kebun.kodeKebun ? 'bg-green-50 border-l-4 border-green-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                      {kebun.namaKebun?.[0]?.toUpperCase() || 'K'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{kebun.namaKebun}</p>
                      <p className="text-sm text-gray-500">Kode: {kebun.kodeKebun}</p>
                      <p className="text-sm text-gray-500">Luas: {kebun.luasHektare} Ha</p>
                    </div>
                    {selectedKebun?.kodeKebun === kebun.kodeKebun && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleMove}
            disabled={!selectedKebun || submitting}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {submitting ? 'Memindahkan...' : 'Pindahkan'}
          </button>
          <button
            onClick={() => navigate(`/kebun/${kode}`)}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}