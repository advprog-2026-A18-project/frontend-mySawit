import React, { useState } from 'react';
import api from '../../../api/axios'; 

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buruh' // Default value
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/auth/register', formData);
      
      const { name, email, role } = response.data;

      
      const successText = `Registrasi berhasil! Akun atas nama ${name} telah terdaftar sebagai ${role} dengan email ${email}.`;

      setMessage({ type: 'success', text: successText });
      
    } catch (error) {
        console.log(error)
        const errorMsg = error.response?.data?.message || 'Terjadi kesalahan saat menghubungi server.';
        setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{margin: 'auto'}}>
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
            <h2>Daftar Akun My Sawit</h2>
            
            {message.text && (
                <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                backgroundColor: message.type === 'error' ? '#ffebee' : '#e8f5e9',
                color: message.type === 'error' ? '#c62828' : '#2e7d32',
                borderRadius: '4px',
                lineHeight: '1.5' 
                }}>
                {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nama Lengkap</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
                </div>

                <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
                </div>

                <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
                </div>

                <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Role Pekerjaan</label>
                <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="Buruh">Buruh</option>
                    <option value="Mandor">Mandor</option>
                    <option value="Manajer">Manajer</option>
                </select>
                </div>

                <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                    padding: '10px', 
                    backgroundColor: isLoading ? '#9e9e9e' : '#1976d2', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                }}
                >
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                </button>
            </form>

        </div>

    </div>

    
  );
};

export default Register;