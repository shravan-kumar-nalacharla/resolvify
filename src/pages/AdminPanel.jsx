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
    if(s === 'RESOLVED') return { bg: '#d1fae5', color: '#065f46' };
    if(s === 'CLOSED') return { bg: '#f1f5f9', color: '#475569' };
    return { bg: '#fee2e2', color: '#991b1b' }; // REJECTED
  };

  const getPriorityColor = (pri) => {
    const p = pri || 'Low';
    if(p === 'High') return { bg: '#fee2e2', color: '#dc2626' };
    if(p === 'Medium') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#d1fae5', color: '#059669' }; // Low
  };

  if (loading && !stats) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Loader2 className="animate-spin" size={32} color="var(--primary)" /></div>;

  const tabItems = [
    { key: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { key: 'All Complaints', icon: <List size={16} /> },
    { key: 'Users', icon: <Users size={16} /> },
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Admin Control Center</h1>
        
        {/* Pill Tabs */}
        <div style={{ display: 'inline-flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
          {tabItems.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPage(1); }} style={{ 
              padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: activeTab === tab.key ? 'var(--primary)' : 'transparent', 
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}>
              {tab.icon}
              {tab.key}
            </button>
          ))}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'Dashboard' && stats && (
        <div className="animate-fadeIn">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[{label: 'Total', val: stats.totalComplaints, color: 'var(--primary)', bg: '#eef2ff'},
              {label: 'Open', val: stats.openCount, color: '#2563eb', bg: '#dbeafe'},
              {label: 'In Progress', val: stats.inProgressCount, color: '#d97706', bg: '#fef3c7'},
              {label: 'Resolved', val: stats.resolvedCount, color: '#059669', bg: '#d1fae5'}].map((s,i) => (
                <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                  <h2 style={{ margin: 0, fontSize: '2.25rem', color: s.color, fontWeight: 700 }}>{s.val}</h2>
                </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>By Category</h3>
              {Object.entries(stats.complaintsByCategory).map(([cat, count]) => (
                <div key={cat} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--primary)', width: `${Math.max(5, (count / stats.totalComplaints) * 100)}%`, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>By Priority</h3>
              {Object.entries(stats.complaintsByPriority).map(([pri, count]) => {
                const color = pri === 'High' ? '#dc2626' : pri === 'Medium' ? '#d97706' : '#059669';
                return (
                <div key={pri} style={{ marginBottom: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{pri}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: color, width: `${Math.max(5, (count / stats.totalComplaints) * 100)}%`, borderRadius: '3px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* ALL COMPLAINTS TAB */}
      {activeTab === 'All Complaints' && (
        <div className="card animate-fadeIn" style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input type="text" placeholder="Search titles or descriptions..." className="form-control" style={{ paddingLeft: '2.5rem', width: '100%' }} value={search} onChange={e => {setSearch(e.target.value); setPage(1);}} />
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select className="form-control" style={{ flex: 1, minWidth: '140px' }} value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setPage(1);}}>
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select className="form-control" style={{ flex: 1, minWidth: '140px' }} value={filterPri} onChange={e => {setFilterPri(e.target.value); setPage(1);}}>
                <option value="">All Priorities</option>
                <option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto', margin: '0 -1.5rem', borderTop: '1px solid var(--border)' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '900px' }}>
              <thead>
                <tr>
                  <th style={{width:'50px'}}>ID</th>
                  <th style={{width:'50px'}}>User</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{width:'170px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedComplaints.map(c => {
                  const pCol = getPriorityColor(c.priority);
                  const sCol = getStatusColor(c.status);
                  return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{c.id}</td>
                    <td>
                      <div style={{width:'26px',height:'26px',background:'var(--primary)',color:'white',borderRadius:'50%',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'0.7rem',fontWeight:'bold'}}>{c.userId}</div>
                    </td>
                    <td style={{ fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{c.title}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.category}</td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: pCol.bg, color: pCol.color }}>
                        {c.priority || 'Low'}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: sCol.bg, color: sCol.color }}>
                        {c.status || 'OPEN'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {deleteConfirmId === c.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 'bold' }}>Sure?</span>
                          <button onClick={() => handleDelete(c.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer', transition: 'opacity 0.2s' }}><Check size={14}/></button>
                          <button onClick={() => setDeleteConfirmId(null)} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}><X size={14}/></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <button title="Edit" onClick={() => openEditModal(c)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--primary-light)'}
                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                          ><Edit2 size={15} /></button>
                          <select 
                            value={c.status || 'OPEN'} 
                            onChange={(e) => handleStatusChange(c.id, e.target.value)}
                            style={{ padding: '0.2rem 0.25rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem', background: 'var(--surface)', cursor: 'pointer' }}
                          >
                            <option value="OPEN">Open</option><option value="IN_PROGRESS">In_Progress</option>
                            <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                          <button title="Delete" onClick={() => setDeleteConfirmId(c.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', transition: 'background 0.2s' }}
                            onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                            onMouseOut={e => e.currentTarget.style.background = 'none'}
                          ><Trash2 size={15} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            {paginatedComplaints.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No complaints found matching criteria.</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '1rem 0 0', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Showing {(page-1)*rowsPerPage + 1} to {Math.min(page*rowsPerPage, filteredComplaints.length)} of {filteredComplaints.length}</span>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '0.35rem 0.5rem', background: page===1?'#f1f5f9':'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: page===1?'not-allowed':'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={16}/></button>
                <div style={{ padding: '0.35rem 0.75rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{page} / {totalPages}</div>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '0.35rem 0.5rem', background: page===totalPages?'#f1f5f9':'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: page===totalPages?'not-allowed':'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={16}/></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'Users' && (
        <div className="card animate-fadeIn" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr><th>ID</th><th>Username</th><th>Role</th></tr>
            </thead>
            <tbody>
              {usersList.map((u, i) => (
                <tr key={u.id || i}>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{u.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</td>
                  <td>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: u.role==='ADMIN'?'#f3e8ff':'#dbeafe', color: u.role==='ADMIN'?'#7c3aed':'#2563eb' }}>
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setEditingId(null)} />
          <div style={{ position: 'relative', width: '90%', maxWidth: '560px', background: 'var(--surface)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'scaleIn 0.25s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Edit Complaint #{editingId}</h2>
              <button onClick={() => setEditingId(null)} style={{ background: 'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding: '0.25rem', borderRadius: '6px' }}><X size={22}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display:'block', marginBottom:'0.4rem', fontWeight:500, fontSize: '0.85rem', color: '#374151' }}>Title</label>
                <input className="form-control" type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.4rem', fontWeight:500, fontSize: '0.85rem', color: '#374151' }}>Description</label>
                <textarea className="form-control" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', marginBottom:'0.4rem', fontWeight:500, fontSize: '0.85rem', color: '#374151' }}>Category</label>
                  <select className="form-control" value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}>
                    <option value="Hardware">Hardware</option><option value="Software">Software</option>
                    <option value="Network">Network</option><option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display:'block', marginBottom:'0.4rem', fontWeight:500, fontSize: '0.85rem', color: '#374151' }}>Priority</label>
                  <select className="form-control" value={editForm.priority} onChange={e => setEditForm({...editForm, priority: e.target.value})}>
                    <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display:'block', marginBottom:'0.4rem', fontWeight:500, fontSize: '0.85rem', color: '#374151' }}>Status</label>
                <select className="form-control" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option><option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setEditingId(null)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: '1px solid var(--border)' }}>Cancel</button>
                <button onClick={handleSaveEdit} className="btn" disabled={savingId === editingId} style={{ flex: 1 }}>
                  {savingId === editingId ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
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
