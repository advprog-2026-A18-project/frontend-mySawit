import React, { useState, useEffect } from 'react';
import api from '../../../api/axios'; 

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal mengambil data pengguna dari server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ textAlign: 'center' }}>Daftar Pengguna My Sawit</h2>



      {!isLoading && !error && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ color: 'blackwhite', textAlign: 'left' }}>
                <th style={{ padding: '12px', border: '1px solid #333' }}>No.</th>
                <th style={{ padding: '12px', border: '1px solid #333' }}>ID Pengguna</th>
                <th style={{ padding: '12px', border: '1px solid #333' }}>Nama Lengkap</th>
                <th style={{ padding: '12px', border: '1px solid #333' }}>Email</th>
                <th style={{ padding: '12px', border: '1px solid #333' }}>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr key={user.id} style={{color: 'white'}}>
                    <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center' }}>{index + 1}</td>
                    <td style={{ padding: '12px', border: '1px solid #333', fontSize: '12px', color: '#555' }}>
                      {user.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #333', fontWeight: 'bold' }}>{user.name}</td>
                    <td style={{ padding: '12px', border: '1px solid #333' }}>{user.email}</td>
                    <td style={{ padding: '12px', border: '1px solid #333' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#e3f2fd', 
                        color: '#1565c0', 
                        borderRadius: '12px',
                        fontSize: '13px'
                      }}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>
                    Belum ada pengguna yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;