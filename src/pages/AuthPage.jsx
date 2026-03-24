import React, { useState } from 'react';
import axios from 'axios';
import API_BASE from '../api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`${API_BASE}${endpoint}`, { username, password });
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('An error occurred on the server.');
        }
      } else {
        setError('Network Error: The backend is still starting up or offline.');
      }
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' }}>
          {isLogin ? 'Login to Resolvify' : 'Create an Account'}
        </h2>
        {error && <p style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem' }}>{error}</p>}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>Username</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '1rem' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '500', cursor: 'pointer', marginBottom: '1rem' }}>
          {isLogin ? 'Login' : 'Register'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline' }}>
            {isLogin ? 'Register here' : 'Login here'}
          </span>
        </p>
      </form>
    </div>
  );
};
export default AuthPage;
