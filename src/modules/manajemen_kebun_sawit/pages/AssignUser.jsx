import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUsers, getKebunList, assignMandor, assignSupir } from '../../../api/axios';

export default function AssignUser() {
  const navigate = useNavigate();
  const { kode, type } = useParams();
  const isMandor = type === 'mandor';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [kode, type, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setSelectedUser(null);
      const params = {
        role: isMandor ? 'MANDOR' : 'BURUH'
      };
      if (search) {
        params.name = search;
      }

      const response = await getUsers(params);

      // Handle different response formats
      let usersData = [];
      const responseData = response.data?.data;

      if (Array.isArray(responseData)) {
        usersData = responseData;
      } else if (responseData?.content && Array.isArray(responseData.content)) {
        usersData = responseData.content;
      } else if (response.data?.data?.data?.content) {
        usersData = response.data.data.data.content;
      } else if (response.data?.content && Array.isArray(response.data.content)) {
        usersData = response.data.content;
      }

      // Filter out users that are already assigned to OTHER kebun
      try {
        const kebunRes = await getKebunList({});
        const allKebun = kebunRes.data?.data || [];
        const assignedUserIds = allKebun
          .filter(k => k.kodeKebun !== kode)
          .map(k => isMandor ? k.mandorId : (k.supirIds || []))
          .flat()
          .filter(id => id);
        usersData = usersData.filter(u => !assignedUserIds.includes(u.id));
      } catch (err) {
        console.error('Error fetching kebun list for filter:', err);
      }

      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
      setError('Gagal memuat data: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleAssign = async () => {
    if (!selectedUser) return;

    const userId = selectedUser.id || selectedUser.userId;
    const namaSupir = selectedUser.fullname || selectedUser.username;
    console.log('Assigning:', { kode, userId, namaSupir, isMandor });

    try {
      setSubmitting(true);
      if (isMandor) {
        await assignMandor(kode, userId, selectedUser.fullname || selectedUser.username);
      } else {
        await assignSupir(kode, userId, namaSupir);
      }
      navigate(`/kebun/${kode}`);
    } catch (err) {
      console.error('Assign error:', err);
      alert(err.response?.data?.message || `Gagal assign ${isMandor ? 'mandor' : 'supir'}`);
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
            Assign {isMandor ? 'Mandor' : 'Supir'} ke Kebun
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={`Cari nama ${isMandor ? 'mandor' : 'supir'}...`}
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

        {/* User List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-100 border-b">
            <p className="text-sm text-gray-600">
              Klik untuk memilih {isMandor ? 'mandor' : 'supir'} yang akan diassign
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isMandor ? 'Mandor' : 'Supir'} tidak ditemukan
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => {
                const userId = user.id;
                const selectedId = selectedUser ? (selectedUser.id || selectedUser.userId) : null;
                const isSelected = selectedId === userId;
                console.log('Comparing selectedId:', selectedId, 'with userId:', userId, 'result:', isSelected);
                return (
                <div
                  key={userId}
                  onClick={() => {
                    console.log('Setting selectedUser to:', user);
                    setSelectedUser(user);
                  }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${isSelected ? 'bg-green-50 border-l-4 border-green-600' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isMandor ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {user.fullname?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {user.fullname || user.username}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">ID: {user.id || user.userId}</p>
                    </div>
                    {isSelected && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleAssign}
            disabled={!selectedUser || submitting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {submitting ? 'Mengassign...' : `Assign ${isMandor ? 'Mandor' : 'Supir'}`}
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