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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
           <div key={toast.id} className="toast-item" style={{
             background: 'var(--surface)', 
             borderLeft: `4px solid ${toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
             padding: '1rem', 
             borderRadius: '0.5rem', 
             boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.75rem', 
             minWidth: '250px'
           }}>
             {toast.type === 'success' && <CheckCircle color="#22c55e" size={20}/>}
             {toast.type === 'error' && <AlertCircle color="#ef4444" size={20}/>}
             {toast.type === 'info' && <Info color="#3b82f6" size={20}/>}
             <p style={{ margin: 0, flex: 1, fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: 500 }}>{toast.message}</p>
             <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={16}/></button>
           </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
