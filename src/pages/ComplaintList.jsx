import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, PlusCircle, AlertCircle, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await axios.get(`${API_BASE}/api/complaints`, { params: { userId: user?.id } });
      setComplaints(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load complaints. Ensure backend is running.');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'open';
    if(s.includes('resolv')) return <span className="badge resolved">{status}</span>;
    if(s.includes('progress')) return <span className="badge in-progress">{status}</span>;
    return <span className="badge open">{status || 'Open'}</span>;
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>All Complaints</h1>
        <Link to="/create" className="btn">
          <PlusCircle size={20} />
          New Complaint
        </Link>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" color="var(--primary)" size={32} />
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: 'var(--danger)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!loading && !error && complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--secondary)', background: '#f8fafc', borderRadius: '0.5rem' }}>
          <div style={{ marginBottom: '1rem' }}><List size={48} color="#cbd5e1" /></div>
          <h3>No complaints found</h3>
          <p>Everything looks good. No issues have been reported yet.</p>
        </div>
      )}

      {!loading && complaints.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported On</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '500', color: 'var(--secondary)' }}>#{c.id}</td>
                  <td style={{ fontWeight: '500' }}>{c.title}</td>
                  <td>{c.category}</td>
                  <td>
                    <span style={{ 
                      color: c.priority === 'High' ? 'var(--danger)' : 
                             c.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      fontWeight: '600'
                    }}>
                      {c.priority}
                    </span>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComplaintList;
