import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, PlusCircle, AlertCircle, List, Search, Filter } from 'lucide-react';
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

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
          <input 
            type="text" 
            placeholder="Search titles or descriptions..." 
            className="form-control" 
            style={{ paddingLeft: '2.5rem' }}
            value={searchKw}
            onChange={e => setSearchKw(e.target.value)}
          />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select className="form-control" style={{ width: 'auto' }} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
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
                <th style={{ width: '60px' }}>ID</th>
                <th style={{ width: '35%' }}>Title</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '15%' }}>Priority</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '15%' }}>Reported On</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(c => (
                <tr key={c.id} onClick={() => setSelectedComplaintId(c.id)} style={{ cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ fontWeight: '600', color: 'var(--secondary)' }}>#{c.id}</td>
                  <td style={{ fontWeight: '600', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  <td style={{ color: 'var(--secondary)' }}>{c.category}</td>
                  <td>
                    <span className="badge" style={{ 
                      backgroundColor: c.priority === 'High' ? '#fee2e2' : c.priority === 'Medium' ? '#ffedd5' : '#dcfce7',
                      color: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#f97316' : '#22c55e',
                    }}>
                      {c.priority || 'Low'}
                    </span>
                  </td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>
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
