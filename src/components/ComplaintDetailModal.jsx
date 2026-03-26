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

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
        onClick={onClose}
      />
      
      <div style={{ position: 'relative', width: '90%', maxWidth: '900px', maxHeight: '90vh', background: 'var(--surface)', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {loading ? (
          <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="var(--primary)" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>#{complaint.id}</h2>
                  <span className={`badge ${complaint.status.toLowerCase()}`}>{complaint.status}</span>
                  <span className="badge" style={{ background: complaint.priority==='High'?'#fee2e2':complaint.priority==='Medium'?'#ffedd5':'#dcfce7', color: complaint.priority==='High'?'#ef4444':complaint.priority==='Medium'?'#f97316':'#22c55e' }}>
                    {complaint.priority}
                  </span>
                </div>
                {isEditing ? (
                  <input className="form-control" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={{ fontSize: '1.25rem', fontWeight: 600, width: '100%' }} />
                ) : (
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{complaint.title}</h3>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                {complaint.status === 'OPEN' && complaint.userId === user?.id && !isEditing && (
                  <button onClick={() => setIsEditing(true)} className="btn" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: 'var(--secondary)' }}>
                    <Edit2 size={16} /> Edit
                  </button>
                )}
                {isEditing && (
                  <button onClick={handleSaveEdit} className="btn" style={{ padding: '0.5rem 1rem' }}>
                    <Check size={16} /> Save
                  </button>
                )}
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                  <X size={24} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              
              {/* Left Column: Details & Comments */}
              <div style={{ flex: 2, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Description</h4>
                  {isEditing ? (
                    <textarea className="form-control" rows="4" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                  ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{complaint.description}</p>
                  )}
                </div>

                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <MessageSquare size={18} /> Internal Notes / Comments
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {comments.length === 0 ? (
                      <p style={{ color: 'var(--secondary)', fontStyle: 'italic' }}>No comments yet.</p>
                    ) : (
                      comments.map(c => (
                        <div key={c.id} style={{ background: c.isAdminNote ? '#fefce8' : '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: c.isAdminNote ? '1px solid #fef08a' : '1px solid var(--border)' }}>
                          <p style={{ margin: 0, fontSize: '0.95rem' }}>{c.text}</p>
                          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>User {c.userId} {c.isAdminNote && '(Admin)'}</span>
                            <span>{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment or note..." className="form-control" disabled={commentLoading} />
                    <button type="submit" className="btn" disabled={commentLoading || !newComment.trim()}>
                      {commentLoading ? <Loader2 className="animate-spin" size={18} /> : 'Post'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: History & Metadata */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', background: '#f8fafc' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', marginTop: 0 }}>Category</h4>
                  <p style={{ margin: 0, fontWeight: 500 }}>{complaint.category}</p>
                </div>

                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <Clock size={18} /> Status History
                  </h4>
                  
                  <div style={{ position: 'relative', marginTop: '1rem' }}>
                    <div style={{ position: 'absolute', top: 0, bottom: 0, left: '6px', width: '2px', background: '#e2e8f0' }}></div>
                    {history.map((h, idx) => (
                      <div key={h.id} style={{ position: 'relative', paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'absolute', left: 0, top: '4px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--primary)', border: '3px solid white', boxShadow: '0 0 0 1px #cbd5e1' }}></div>
                        <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                          {h.oldStatus ? `${h.oldStatus} ➔ ${h.newStatus}` : `Created as ${h.newStatus}`}
                        </p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--secondary)' }}>
                          {new Date(h.changedAt).toLocaleString()} • {h.changedBy}
                        </p>
                      </div>
                    ))}
                    {history.length === 0 && (
                      <p style={{ paddingLeft: '1.5rem', color: 'var(--secondary)', fontSize: '0.9rem' }}>No history recorded.</p>
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
