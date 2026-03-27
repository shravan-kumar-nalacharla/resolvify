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

  const iconColor = { success: '#059669', error: '#dc2626', info: '#4f46e5' };
  const borderColor = { success: '#059669', error: '#dc2626', info: '#4f46e5' };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
           <div key={toast.id} className="toast-item" style={{
             background: 'var(--surface)', 
             borderLeft: `4px solid ${borderColor[toast.type] || borderColor.info}`,
             padding: '0.875rem 1rem', 
             borderRadius: '10px', 
             boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)', 
             display: 'flex', 
             alignItems: 'center', 
             gap: '0.75rem', 
             minWidth: '280px',
             maxWidth: '400px',
           }}>
             {toast.type === 'success' && <CheckCircle color={iconColor.success} size={18}/>}
             {toast.type === 'error' && <AlertCircle color={iconColor.error} size={18}/>}
             {toast.type === 'info' && <Info color={iconColor.info} size={18}/>}
             <p style={{ margin: 0, flex: 1, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{toast.message}</p>
             <button onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.125rem', borderRadius: '4px', transition: 'color 0.2s' }}
               onMouseOver={e => e.currentTarget.style.color = '#64748b'}
               onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}
             ><X size={16}/></button>
           </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
