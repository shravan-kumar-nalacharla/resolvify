import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, List, BotMessageSquare, Activity, ArrowRight } from 'lucide-react';
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

  const statItems = [
    { icon: <Activity size={24} />, label: 'Total Submitted', value: stats.total, color: 'var(--primary)', bg: 'var(--primary-light)' },
    { icon: null, label: 'Open Issues', value: stats.open, color: 'var(--primary)', bg: '#dbeafe', dot: 'var(--primary)' },
    { icon: null, label: 'Resolved', value: stats.resolved, color: 'var(--success)', bg: '#d1fae5', dot: 'var(--success)' },
  ];

  const features = [
    {
      icon: <MessageSquarePlus size={22} />,
      title: 'Raise Issues Quickly',
      desc: 'Submit detailed complaints with categories and priority assignments.',
      link: '/create',
      btnText: 'Create Ticket',
      btnVariant: 'primary',
    },
    {
      icon: <List size={22} />,
      title: 'Track Progress',
      desc: 'View the live status of all your organizational complaints in one place.',
      link: '/complaints',
      btnText: 'View Issues',
      btnVariant: 'outline',
    },
    {
      icon: <BotMessageSquare size={22} />,
      title: 'Resolvify AI Bot',
      desc: 'Get immediate help mapping priority or resolving generalized inquiries.',
      link: null,
      btnText: 'Chat in bottom right',
      btnVariant: 'muted',
    },
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Hero */}
      <div className="animate-slideUp" style={{ textAlign: 'center', padding: '3rem 1rem 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Welcome to <span style={{ color: 'var(--primary)' }}>Resolvify</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
          A modern standard for raising, tracking, and resolving organizational issues effortlessly.
        </p>
      </div>

      {/* Stats */}
      {user && (
        <div className="card-grid-3 animate-slideUp" style={{ marginBottom: '2.5rem' }}>
          {statItems.map((s, i) => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem' }}>
              {s.icon ? (
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  {s.icon}
                </div>
              ) : (
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: s.dot }}></div>
              )}
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
              <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Feature Cards */}
      <div className="card-grid-3 animate-slideUp" style={{ alignItems: 'stretch', animationDelay: '0.2s' }}>
        {features.map((f, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', cursor: f.link ? 'pointer' : 'default', transition: 'transform 0.25s ease, box-shadow 0.25s ease' }}
            onMouseOver={e => { if (f.link) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}}
            onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
            <div style={{ flex: 1 }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--primary)' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 600 }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
            {f.link ? (
              <Link to={f.link} className="btn" style={{
                width: '100%', justifyContent: 'center',
                ...(f.btnVariant === 'outline' ? { backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' } : {})
              }}>
                {f.btnText} <ArrowRight size={16} />
              </Link>
            ) : (
              <button className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f1f5f9', color: 'var(--text-secondary)', cursor: 'default', boxShadow: 'none' }} disabled>
                {f.btnText}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
