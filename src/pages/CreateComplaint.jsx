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

  return (
    <div className="page-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <Link to="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', textDecoration: 'none', marginBottom: '1rem', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to List
        </Link>
        <h1 style={{ margin: 0, marginTop: '1rem' }}>Create New Issue</h1>
        <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>Fill out the form below to report a new organizational issue.</p>
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

        <div style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, color: 'var(--secondary)', fontSize: '0.875rem' }}>Auto-detected Priority</p>
          <span className={`badge ${formData.priority === 'High' ? 'rejected' : formData.priority === 'Medium' ? 'in-progress' : 'resolved'}`} style={{ 
            padding: '0.5rem 1rem', 
            fontSize: '1rem',
            backgroundColor: formData.priority === 'High' ? '#fee2e2' : formData.priority === 'Medium' ? '#ffedd5' : '#dcfce7',
            color: formData.priority === 'High' ? '#ef4444' : formData.priority === 'Medium' ? '#f97316' : '#22c55e'
          }}>
            {formData.priority === 'High' ? '🔴 High (Urgent)' : formData.priority === 'Medium' ? '🟠 Medium' : '🟢 Low (Standard SLA)'}
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

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button type="submit" className="btn" disabled={loading} style={{ width: '100%', height: '48px' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Issue</>}
          </button>
          <Link to="/complaints" className="btn" style={{ width: '100%', height: '48px', background: '#f1f5f9', color: '#475569' }}>Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
