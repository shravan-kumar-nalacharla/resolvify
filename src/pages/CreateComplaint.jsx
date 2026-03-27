import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import API_BASE from '../api';
import { useToast } from '../components/Toast';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Support',
    priority: 'Low'
  });

  React.useEffect(() => {
    const text = (formData.title + ' ' + formData.description).toLowerCase();
    const highKeywords = ["urgent", "critical", "down", "breach", "outage", "emergency", "blocked", "severe", "crash", "not working", "failure", "immediate"];
    const mediumKeywords = ["slow", "delay", "issue", "error", "problem", "intermittent", "degraded", "partial", "unstable"];
    
    let detected = 'Low';
    if (highKeywords.some(kw => text.includes(kw))) {
      detected = 'High';
    } else if (mediumKeywords.some(kw => text.includes(kw))) {
      detected = 'Medium';
    }

    if (detected !== formData.priority) {
      setFormData(prev => ({ ...prev, priority: detected }));
    }
  }, [formData.title, formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (formData.title.length < 5) {
      showToast('Title must be at least 5 characters', 'error');
      setLoading(false); return;
    }
    if (formData.description.length < 10) {
      showToast('Description must be at least 10 characters', 'error');
      setLoading(false); return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(`${API_BASE}/api/complaints`, { ...formData, userId: user?.id });
      setLoading(false);
      showToast('Complaint submitted successfully!', 'success');
      navigate('/complaints');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit complaint. Ensure backend is running.', 'error');
      setLoading(false);
    }
  };

  const priorityConfig = {
    High: { bg: '#fee2e2', color: '#dc2626', label: '🔴 High (Urgent)' },
    Medium: { bg: '#fef3c7', color: '#d97706', label: '🟠 Medium' },
    Low: { bg: '#d1fae5', color: '#059669', label: '🟢 Low (Standard SLA)' },
  };
  const pCfg = priorityConfig[formData.priority];

  return (
    <div className="page-container" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={16} /> Back to List
        </Link>
        <h1 style={{ margin: '1rem 0 0.25rem' }}>Create New Issue</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Fill out the form below to report a new organizational issue.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Issue Summary (Title)</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="form-control" 
            required 
            placeholder="E.g., Unable to access VPN"
            value={formData.title} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Detailed Description</label>
          <textarea 
            id="description" 
            name="description" 
            className="form-control" 
            rows="5" 
            required 
            placeholder="Please provide as much detail as possible..."
            value={formData.description} 
            onChange={handleChange} 
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)', background: '#f8fafc' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Auto-detected Priority</p>
          <span style={{ 
            display: 'inline-block',
            padding: '0.4rem 1rem', 
            fontSize: '0.9rem',
            fontWeight: 600,
            borderRadius: '9999px',
            backgroundColor: pCfg.bg,
            color: pCfg.color,
            transition: 'all 0.3s ease',
          }}>
            {pCfg.label}
          </span>
        </div>

        <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              name="category" 
              className="form-control" 
              value={formData.category} 
              onChange={handleChange}
            >
              <option value="IT Support">IT Support</option>
              <option value="HR">HR / Employee Relations</option>
              <option value="Facilities">Facilities Maintenance</option>
              <option value="Payroll">Payroll</option>
              <option value="Other">Other</option>
            </select>
          </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
          <Link to="/complaints" className="btn" style={{ flex: 1, height: '46px', background: '#f1f5f9', color: '#475569', border: '1px solid var(--border)' }}>Cancel</Link>
          <button type="submit" className="btn" disabled={loading} style={{ flex: 2, height: '46px' }}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} /> Submit Issue</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
