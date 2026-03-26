import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, List, BotMessageSquare, Activity } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

const Home = () => {
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE}/api/complaints`, { params: { userId: user.id } })
        .then(res => {
          const complaints = res.data;
          setStats({
            total: complaints.length,
            open: complaints.filter(c => c.status === 'OPEN').length,
            resolved: complaints.filter(c => c.status === 'RESOLVED').length
          });
        })
        .catch(err => console.error(err));
    }
  }, [user?.id]);
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
        Welcome to Resolvify
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
        A modern standard for raising, tracking, and resolving organizational issues effortlessly. 
        Powered by our advanced AI integration for instant support.
      </p>

      {user && (
        <div className="card-grid-3" style={{ marginBottom: '3rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Activity color="var(--primary)" size={32} />
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>Total Submitted</p>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.total}</h3>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#3b82f6' }}></div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>Open Issues</p>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.open}</h3>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#22c55e' }}></div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--secondary)' }}>Resolved</p>
            <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.resolved}</h3>
          </div>
        </div>
      )}

      <div className="card-grid-3" style={{ alignItems: 'stretch' }}>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <MessageSquarePlus color="var(--primary)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Raise Issues Quickly</h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>Submit detailed complaints with categories and priority assignments.</p>
          </div>
          <Link to="/create" className="btn" style={{ width: '100%', justifyContent: 'center' }}>Create Ticket</Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <List color="var(--primary)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Track Progress</h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>View the live status of all your organizational complaints in one place.</p>
          </div>
          <Link to="/complaints" className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>View All Issues</Link>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
               <BotMessageSquare color="var(--primary)" size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Resolvify AI Bot</h3>
            <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>Get immediate help mapping priority or resolving generalized inquiries.</p>
          </div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', color: 'var(--secondary)', cursor: 'default' }}>Chat in bottom right</button>
        </div>

      </div>
    </div>
  );
};

export default Home;
