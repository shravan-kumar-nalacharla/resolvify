import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const toastConfig = {
    success: { color: 'var(--success)', icon: <CheckCircle color="var(--success)" size={18}/> },
    error: { color: 'var(--danger)', icon: <AlertCircle color="var(--danger)" size={18}/> },
    info: { color: 'var(--primary)', icon: <Info color="var(--primary)" size={18}/> },
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => {
           const cfg = toastConfig[toast.type] || toastConfig.info;
           return (
           <div key={toast.id} className="toast-item" style={{
             background: 'var(--surface)', 
             borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--primary)'}`,
             padding: '0.875rem 1rem', 
             borderRadius: '10px', 
             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.75rem', 
             minWidth: '280px',
             maxWidth: '400px',
           }}>
             {cfg.icon}
             <p style={{ margin: 0, flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{toast.message}</p>
             <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.125rem', borderRadius: '4px', transition: 'color 0.2s' }}
               onMouseOver={e => e.currentTarget.style.color = '#64748b'}
               onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
             ><X size={16}/></button>
           </div>
        );})}
      </div>
    </ToastContext.Provider>
  );
};
