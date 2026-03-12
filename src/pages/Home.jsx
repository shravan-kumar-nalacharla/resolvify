import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, List, BotMessageSquare } from 'lucide-react';

const Home = () => {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>
        Welcome to Resolvify
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'var(--secondary)', maxWidth: '600px', margin: '0 auto 3rem' }}>
        A modern standard for raising, tracking, and resolving organizational issues effortlessly. 
        Powered by our advanced AI integration for instant support.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '1rem', backgroundColor: '#fff', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
             <MessageSquarePlus color="var(--primary)" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Raise Issues Quickly</h3>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>Submit detailed complaints with categories and priority assignments.</p>
          <Link to="/create" className="btn" style={{ width: '100%', justifyContent: 'center' }}>Create Ticket</Link>
        </div>

        <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '1rem', backgroundColor: '#fff', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
             <List color="var(--primary)" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Track Progress</h3>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>View the live status of all your organizational complaints in one place.</p>
          <Link to="/complaints" className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--primary)' }}>View All Issues</Link>
        </div>

        <div style={{ padding: '2rem', border: '1px solid var(--border)', borderRadius: '1rem', backgroundColor: '#fff', textAlign: 'left', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
             <BotMessageSquare color="var(--primary)" size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Resolvify AI Bot</h3>
          <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem' }}>Get immediate help mapping priority or resolving generalized inquiries.</p>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', backgroundColor: '#f8fafc', color: 'var(--secondary)', cursor: 'default' }}>Chat in bottom right</button>
        </div>

      </div>
    </div>
  );
};

export default Home;
