import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ComplaintList from './pages/ComplaintList';
import CreateComplaint from './pages/CreateComplaint';
import ChatbotWidget from './components/ChatbotWidget';
import AuthPage from './pages/AuthPage';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const location = useLocation();

  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-container">
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="nav-brand">💡 Resolvify CMS</div>
        <div className="nav-links" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/complaints" className={location.pathname === '/complaints' ? 'active' : ''}>Complaints</Link>
          <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>New Complaint</Link>
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/create" element={<CreateComplaint />} />
        </Routes>
      </main>
      
      <ChatbotWidget user={user} />
    </div>
  );
}

export default App;
