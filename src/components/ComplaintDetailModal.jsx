import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock, MessageSquare, Edit2, Check, Loader2 } from 'lucide-react';
import { useToast } from './Toast';
import API_BASE from '../api';

const ComplaintDetailModal = ({ complaintId, onClose, onUpdate }) => {
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (complaintId) fetchData();
  }, [complaintId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, histRes, commRes] = await Promise.all([
        axios.get(`${API_BASE}/api/complaints/${complaintId}`),
        axios.get(`${API_BASE}/api/complaints/${complaintId}/history`),
        axios.get(`${API_BASE}/api/complaints/${complaintId}/comments`)
      ]);
      setComplaint(compRes.data);
      setEditForm({ title: compRes.data.title, description: compRes.data.description });
      setHistory(histRes.data);
      setComments(commRes.data);
    } catch (err) {
      showToast('Failed to load complaint details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_BASE}/api/complaints/${complaintId}`, editForm);
      showToast('Complaint updated successfully', 'success');
      setIsEditing(false);
      fetchData();
      if(onUpdate) onUpdate();
    } catch (err) {
      showToast('Failed to update complaint', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await axios.post(`${API_BASE}/api/complaints/${complaintId}/comments`, { text: newComment, userId: user?.id, isAdminNote: user?.role === 'ADMIN' });
      setNewComment('');
      showToast('Comment added', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to add comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  if (!complaintId) return null;

  const getPriorityStyle = (p) => {
    if (p === 'High') return { background: '#fee2e2', color: '#dc2626' };
    if (p === 'Medium') return { background: '#fef3c7', color: '#d97706' };
    return { background: '#d1fae5', color: '#059669' };
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out' }}>
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose}
      />
      
      <div style={{ position: 'relative', width: '90%', maxWidth: '900px', maxHeight: '90vh', background: 'var(--surface)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'scaleIn 0.25s ease-out' }}>
        
        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={36} color="var(--primary)" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>#{complaint.id}</span>
                  <span className={`badge ${complaint.status.toLowerCase().replace('_', '-')}`}>{complaint.status}</span>
                  <span className="badge" style={getPriorityStyle(complaint.priority)}>
                    {complaint.priority}
                  </span>
                </div>
                {isEditing ? (
                  <input className="form-control" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ fontSize: '1.1rem', fontWeight: 600, width: '100%' }} />
                ) : (
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{complaint.title}</h3>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0, marginLeft: '1rem' }}>
                {complaint.status === 'OPEN' && complaint.userId === user?.id && !isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn" style={{ padding: '0.4rem 0.75rem', height: 'auto', minWidth: 'auto', background: '#f1f5f9', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                {isEditing && (
                  <button onClick={handleSaveEdit} className="btn" style={{ padding: '0.4rem 0.75rem', height: 'auto', minWidth: 'auto', fontSize: '0.8rem' }}>
                    <Check size={14} /> Save
                  </button>
                )}
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', borderRadius: '6px', transition: 'color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Column: Details & Comments */}
              <div style={{ flex: 2, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</h4>
                  {isEditing ? (
                    <textarea className="form-control" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{complaint.description}</p>
                  )}
                </div>

                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <MessageSquare size={16} /> Internal Notes / Comments
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {comments.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No comments yet.</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} style={{ background: c.isAdminNote ? '#fefce8' : '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: c.isAdminNote ? '1px solid #fde68a' : '1px solid var(--border)' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>{c.text}</p>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>User {c.userId} {c.isAdminNote && <span style={{ color: '#d97706', fontWeight: 600 }}>(Admin)</span>}</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment or note..." className="form-control" disabled={commentLoading} style={{ fontSize: '0.875rem' }} />
                    <button type="submit" className="btn" disabled={commentLoading || !newComment.trim()} style={{ minWidth: '70px', fontSize: '0.8rem' }}>
                      {commentLoading ? <Loader2 className="animate-spin" size={16} /> : 'Post'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: History & Metadata */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</h4>
                  <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.925rem' }}>{complaint.category}</p>
                </div>

                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <Clock size={16} /> Status History
                  </h4>
                  
                  <div style={{ position: 'relative', marginTop: '1rem' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6px', width: '2px', background: '#e2e8f0' }}></div>
                    {history.map((h, idx) => (
                      <div key={h.id} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>
                        <div style={{ position: 'absolute', left: 0, top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {h.oldStatus ? `${h.oldStatus} → ${h.newStatus}` : `Created as ${h.newStatus}`}
                        </p>
                        <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(h.changedAt).toLocaleString()} • {h.changedBy}
                        </p>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No history recorded.</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
