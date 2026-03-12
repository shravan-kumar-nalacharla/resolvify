import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'IT Support',
    priority: 'Low'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8081/api/complaints', formData);
      setLoading(false);
      navigate('/complaints');
    } catch (err) {
      console.error(err);
      alert('Failed to submit complaint. Ensure backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)', textDecoration: 'none', marginBottom: '1rem', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to List
        </Link>
        <h1 style={{ margin: 0 }}>Create New Issue</h1>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select 
              id="priority" 
              name="priority" 
              className="form-control" 
              value={formData.priority} 
              onChange={handleChange}
            >
              <option value="Low">Low (Standard SLA)</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Urgent)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/complaints" className="btn" style={{ background: '#f1f5f9', color: '#475569' }}>Cancel</Link>
          <button type="submit" className="btn" disabled={loading} style={{ minWidth: '150px', justifyContent: 'center' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Submit Issue</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateComplaint;
