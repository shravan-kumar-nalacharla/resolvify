import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ComplaintList from './pages/ComplaintList';
import CreateComplaint from './pages/CreateComplaint';
import ChatbotWidget from './components/ChatbotWidget';

function App() {
  const location = useLocation();
  
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">💡 Resolvify CMS</div>
        <div className="nav-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/complaints" className={location.pathname === '/complaints' ? 'active' : ''}>Complaints</Link>
          <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>New Complaint</Link>
        </div>
      </nav>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/create" element={<CreateComplaint />} />
        </Routes>
      </main>
      
      <ChatbotWidget />
    </div>
  );
}

export default App;
