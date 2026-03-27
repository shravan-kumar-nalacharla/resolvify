import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, PlusCircle, AlertCircle, List, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE from '../api';
import ComplaintDetailModal from '../components/ComplaintDetailModal';
import { useToast } from '../components/Toast';

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchKw, setSearchKw] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  
  const { showToast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, [searchKw, filterStatus, filterPriority]);

  const fetchComplaints = async (retries = 3) => {
    try {
      setLoading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user'));
      const params = { userId: user?.id };
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      
      const response = await axios.get(`${API_BASE}/api/complaints`, { params });
      let data = response.data;
      // Client-side keyword filter
      if (searchKw) {
        const kw = searchKw.toLowerCase();
        data = data.filter(c => c.title?.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw));
      }
      setComplaints(data);
      setLoading(false);
    } catch (err) {
      if (retries > 0) {
        setError('Backend is waking up, retrying...');
        setTimeout(() => fetchComplaints(retries - 1), 3000);
      } else {
        setError('Failed to load complaints. Ensure backend is running.');
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const s = status ? status.toLowerCase() : 'open';
    if(s.includes('resolv')) return <span className="badge resolved">{status}</span>;
    if(s.includes('progress')) return <span className="badge in-progress">{status}</span>;
    if(s.includes('closed')) return <span className="badge closed">{status}</span>;
    if(s.includes('reject')) return <span className="badge rejected">{status}</span>;
    return <span className="badge open">{status || 'Open'}</span>;
  };

  const getPriorityBadge = (priority) => {
    const bg = priority === 'High' ? '#fee2e2' : priority === 'Medium' ? '#fef3c7' : '#d1fae5';
    const color = priority === 'High' ? '#dc2626' : priority === 'Medium' ? '#d97706' : '#059669';
    return <span className="badge" style={{ backgroundColor: bg, color }}>{priority || 'Low'}</span>;
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>All Complaints</h1>
        <Link to="/create" className="btn">
          <PlusCircle size={18} />
          New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search titles or descriptions..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchKw}
            onChange={e => setSearchKw(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto', minWidth: '140px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select className="form-control" style={{ width: 'auto', minWidth: '140px' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" color="var(--primary)" size={32} />
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fecaca', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {!loading && !error && complaints.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ marginBottom: '1rem' }}><List size={48} color="#cbd5e1" /></div>
          <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>No complaints found</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Everything looks good. No issues have been reported yet.</p>
        </div>
      )}

      {!loading && complaints.length > 0 && (
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ width: '35%' }}>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported On</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id} onClick={() => setSelectedComplaintId(c.id)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{c.id}</td>
                  <td style={{ fontWeight: 600, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{c.title}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.category}</td>
                  <td>{getPriorityBadge(c.priority)}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {selectedComplaintId && (
        <ComplaintDetailModal 
          complaintId={selectedComplaintId} 
          onClose={() => setSelectedComplaintId(null)} 
          onUpdate={fetchComplaints}
        />
      )}
    </div>
  );
};

export default ComplaintList;
