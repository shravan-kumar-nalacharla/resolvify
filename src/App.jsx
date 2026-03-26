import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ComplaintList from './pages/ComplaintList';
import CreateComplaint from './pages/CreateComplaint';
import ChatbotWidget from './components/ChatbotWidget';
import AuthPage from './pages/AuthPage';
import AdminPanel from './pages/AdminPanel';
import { ToastProvider } from './components/Toast';
import { Menu, X } from 'lucide-react';

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ToastProvider>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">💡 Resolvify CMS</div>
          <button className="hamburger" onClick={() => setIsNavOpen(!isNavOpen)}>
            {isNavOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={`nav-links ${isNavOpen ? 'open' : ''}`} onClick={() => setIsNavOpen(false)}>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/complaints" className={location.pathname === '/complaints' ? 'active' : ''}>Complaints</Link>
            <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>New Complaint</Link>
            {user.role === 'ADMIN' && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''} style={{color: 'var(--warning)', fontWeight: 'bold'}}>Admin Panel</Link>
            )}
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); setIsNavOpen(false); }} className="btn" style={{ minWidth: '80px', height: '32px', fontSize: '0.85rem' }}>Logout</button>
          </div>
        </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/create" element={<CreateComplaint />} />
          <Route 
             path="/admin" 
             element={user?.role === 'ADMIN' ? <AdminPanel /> : <Navigate to="/home" replace />} 
          />
        </Routes>
      </main>
      
      <ChatbotWidget user={user} />
    </div>
    </ToastProvider>
  );
}

export default App;
