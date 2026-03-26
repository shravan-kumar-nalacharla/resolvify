import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useToast } from '../components/Toast';
import { Search, Trash2, Edit2, ChevronLeft, ChevronRight, LayoutDashboard, List, Users, Check, X, Loader2 } from 'lucide-react';
import API_BASE from '../api';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterPri, setFilterPri] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Edit Modal
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Delete Confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stRes, cpRes, usRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats`),
        axios.get(`${API_BASE}/api/admin/complaints`),
        axios.get(`${API_BASE}/api/admin/users`)
      ]);
      setStats(stRes.data);
      setComplaints(cpRes.data);
      setUsersList(usRes.data);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/admin/complaints/${id}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/complaints/${id}`);
      showToast('Complaint deleted', 'success');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      showToast('Failed to delete complaint', 'error');
    }
  };

  const handleSaveEdit = async () => {
    setSavingId(editingId);
    try {
      await axios.put(`${API_BASE}/api/complaints/${editingId}`, editForm);
      showToast('Complaint updated successfully', 'success');
      setEditingId(null);
      fetchData();
    } catch (err) {
      showToast('Failed to save edits', 'error');
    } finally {
      setSavingId(null);
    }
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setEditForm({ title: c.title, description: c.description, category: c.category, priority: c.priority, status: c.status });
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      let match = true;
      if (search && !(c.title?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))) match = false;
      if (filterStatus && c.status !== filterStatus) match = false;
      if (filterPri && c.priority !== filterPri) match = false;
      if (filterCat && c.category !== filterCat) match = false;
      return match;
    });
  }, [complaints, search, filterStatus, filterPri, filterCat]);

  const paginatedComplaints = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredComplaints.slice(start, start + rowsPerPage);
  }, [filteredComplaints, page]);

  const totalPages = Math.ceil(filteredComplaints.length / rowsPerPage);

  const getStatusColor = (status) => {
    const s = status || 'OPEN';
    if(s === 'OPEN') return { bg: '#dbeafe', color: '#1e40af' };
    if(s === 'IN_PROGRESS') return { bg: '#fef3c7', color: '#b45309' };
    if(s === 'RESOLVED') return { bg: '#dcfce7', color: '#166534' };
    if(s === 'CLOSED') return { bg: '#f1f5f9', color: '#475569' };
    return { bg: '#fee2e2', color: '#991b1b' }; // REJECTED
  };

  const getPriorityColor = (pri) => {
    const p = pri || 'Low';
    if(p === 'High') return { bg: '#fee2e2', color: '#ef4444' };
    if(p === 'Medium') return { bg: '#ffedd5', color: '#f97316' };
    return { bg: '#dcfce7', color: '#22c55e' }; // Low
  };

  if (loading && !stats) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>Admin Control Center</h1>
        
        {/* Pill Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          {['Dashboard', 'All Complaints', 'Users'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }} style={{ 
              padding: '0.5rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: activeTab === tab ? 'var(--primary)' : 'transparent', 
              color: activeTab === tab ? 'white' : 'var(--secondary)' 
            }}>
              {tab === 'Dashboard' && <LayoutDashboard size={18} />}
              {tab === 'All Complaints' && <List size={18} />}
              {tab === 'Users' && <Users size={18} />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'Dashboard' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[{label: 'Total Complaints', val: stats.totalComplaints, color: 'var(--primary)'},
              {label: 'Open', val: stats.openCount, color: '#3b82f6'},
              {label: 'In Progress', val: stats.inProgressCount, color: '#f59e0b'},
              {label: 'Resolved', val: stats.resolvedCount, color: '#22c55e'}].map((s,i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.5rem', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{s.label}</p>
                  <h2 style={{ margin: 0, fontSize: '2.5rem', color: s.color }}>{s.val}</h2>
                </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--secondary)' }}>By Category</h3>
              {Object.entries(stats.complaintsByCategory).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    <span>{cat}</span>
                    <span>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.max(5, (count / stats.totalComplaints) * 100)}%`, borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--secondary)' }}>By Priority</h3>
              {Object.entries(stats.complaintsByPriority).map(([pri, count]) => {
                const color = pri === 'High' ? '#ef4444' : pri === 'Medium' ? '#f97316' : '#22c55e';
                return (
                <div key={pri} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 500 }}>
                    <span>{pri}</span>
                    <span>{count}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--background)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: color, width: `${Math.max(5, (count / stats.totalComplaints) * 100)}%`, borderRadius: '4px' }}></div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* ALL COMPLAINTS TAB */}
      {activeTab === 'All Complaints' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
              <input type="text" placeholder="Search titles or descriptions..." className="form-control" style={{ paddingLeft: '2.5rem', width: '100%' }} value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select className="form-control" style={{ flex: 1, minWidth: '150px' }} value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setPage(1);}}>
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select className="form-control" style={{ flex: 1, minWidth: '150px' }} value={filterPri} onChange={e => {setFilterPri(e.target.value); setPage(1);}}>
                <option value="">All Priorities</option>
                <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', margin: '0 -1.5rem' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{width:'60px'}}>ID</th>
                  <th>User</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{width:'180px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.map(c => {
                  const pCol = getPriorityColor(c.priority);
                  const sCol = getStatusColor(c.status);
                  return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>#{c.id}</td>
                    <td><div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><div style={{width:'24px',height:'24px',background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'0.7rem',fontWeight:'bold'}}>{c.userId}</div></div></td>
                    <td style={{ fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</td>
                    <td>{c.category}</td>
                    <td>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: pCol.bg, color: pCol.color }}>
                        {c.priority || 'Low'}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: sCol.bg, color: sCol.color }}>
                        {c.status || 'OPEN'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {deleteConfirmId === c.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>Sure?</span>
                          <button onClick={() => handleDelete(c.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}><Check size={14}/></button>
                          <button onClick={() => setDeleteConfirmId(null)} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}><X size={14}/></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button title="Edit" onClick={() => openEditModal(c)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.25rem' }}><Edit2 size={16} /></button>
                          <select 
                            value={c.status || 'OPEN'} 
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            style={{ padding: '0.25rem', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', background: 'var(--surface)' }}
                          >
                            <option value="OPEN">Open</option><option value="IN_PROGRESS">In_Progress</option>
                            <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          <button title="Delete" onClick={() => setDeleteConfirmId(c.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {paginatedComplaints.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary)' }}>No complaints found matching criteria.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', padding: '1rem 0 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Showing {(page-1)*rowsPerPage + 1} to {Math.min(page*rowsPerPage, filteredComplaints.length)} of {filteredComplaints.length}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn" style={{ padding: '0.25rem 0.5rem', background: page===1?'#e2e8f0':'var(--surface)', color: 'var(--secondary)', border: '1px solid var(--border)' }}><ChevronLeft size={16}/></button>
                <div style={{ padding: '0.25rem 0.75rem', fontWeight: 600 }}>{page} / {totalPages}</div>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn" style={{ padding: '0.25rem 0.5rem', background: page===totalPages?'#e2e8f0':'var(--surface)', color: 'var(--secondary)', border: '1px solid var(--border)' }}><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'Users' && (
        <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>Username</th><th>Role</th></tr>
            </thead>
            <tbody>
              {usersList.map((u, i) => (
                <tr key={u.id || i}>
                  <td style={{ fontWeight: 600, color: 'var(--secondary)' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: u.role==='ADMIN'?'#f3e8ff':'#dbeafe', color: u.role==='ADMIN'?'#7e22ce':'#1d4ed8' }}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingId && editForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setEditingId(null)} />
          <div style={{ position: 'relative', width: '90%', maxWidth: '600px', background: 'var(--surface)', borderRadius: '16px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              Edit Complaint #{editingId}
              <button onClick={() => setEditingId(null)} style={{ background: 'none', border:'none', cursor:'pointer', color:'var(--secondary)' }}><X size={24}/></button>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:500 }}>Title</label>
                <input className="form-control" type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:500 }}>Description</label>
                <textarea className="form-control" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:500 }}>Category</label>
                  <select className="form-control" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    <option value="Hardware">Hardware</option><option value="Software">Software</option>
                    <option value="Network">Network</option><option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:500 }}>Priority</label>
                  <select className="form-control" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:500 }}>Status</label>
                <select className="form-control" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option><option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setEditingId(null)} className="btn" style={{ flex: 1, background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}>Cancel</button>
                <button onClick={handleSaveEdit} className="btn" disabled={savingId === editingId} style={{ flex: 1 }}>
                  {savingId === editingId ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminPanel;
