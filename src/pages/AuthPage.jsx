import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import API_BASE from '../api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const { data } = await axios.post(`${API_BASE}${endpoint}`, { username, password });
      
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      console.error('Auth error:', err);
      const msg = err.response?.data || 'Connection failed. Is the backend running?';
      setError(typeof msg === 'string' ? msg : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '1rem',
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '400px',
        animation: 'scaleIn 0.4s ease-out',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4f46e5', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            ✦ Resolvify
          </div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: '#94a3b8', fontSize: '0.875rem' }}>
            {isLogin ? 'Sign in to continue to your dashboard' : 'Get started with Resolvify today'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              placeholder="Enter username"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#4f46e5'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              placeholder="Enter password"
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background-color 0.2s, transform 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
            onMouseOver={e => { if (!loading) e.target.style.backgroundColor = '#4338ca'; }}
            onMouseOut={e => { e.target.style.backgroundColor = '#4f46e5'; }}
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#4f46e5', fontWeight: 600, cursor: 'pointer' }}
            onMouseOver={e => e.target.style.textDecoration = 'underline'}
            onMouseOut={e => e.target.style.textDecoration = 'none'}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
