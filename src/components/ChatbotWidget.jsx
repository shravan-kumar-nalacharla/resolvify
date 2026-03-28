import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import API_BASE from '../api';

const ChatbotWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [{ sender: 'bot', text: 'Hi! I am the Resolvify AI Assistant. How can I help you map a complaint or resolve an issue today?' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const SUGGESTED = [
    { label: '📋 My complaint status',  text: 'What is the status of my complaints?' },
    { label: '🆕 How to submit issue',   text: 'How do I submit a new complaint?' },
    { label: '⏱️ Resolution time',       text: 'How long does it take to resolve an issue?' },
    { label: '🔺 Escalate priority',     text: 'How can I escalate the priority of my complaint?' },
  ];

  const toggleChat = () => setIsOpen(!isOpen);

  const clearChat = () => {
    sessionStorage.removeItem('chatHistory');
    setMessages([{ sender: 'bot', text: 'Hi! I am the Resolvify AI Assistant. How can I help you map a complaint or resolve an issue today?' }]);
  };

  const sendSuggested = (text) => {
    if (loading) return;
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);
    axios.post(`${API_BASE}/api/chat`, {
      message: text,
      userId: user?.id || null,
      admin: user?.role === 'ADMIN'
    }).then(res => {
      setMessages(prev => [...prev, { sender: 'bot', text: res.data?.reply || 'No response.' }]);
    }).catch(err => {
      setMessages(prev => [...prev, { sender: 'bot', text: `Error: ${err.response?.data?.error?.message || 'Check console.'}` }]);
    }).finally(() => setLoading(false));
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/chat`, {
        message: input,
        userId: user?.id || null,
        admin: user?.role === 'ADMIN'
      });

      const botText = response.data?.reply || 'No response from AI.';
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);

    } catch (err) {
      console.error("Gemini API Error:", err.response?.data || err.message);
      setMessages(prev => [...prev, { sender: 'bot', text: `Gemini API Error: ${err.response?.data?.error?.message || 'Check browser console.'}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Floating Button */}
      {!isOpen && (
        <button 
          onClick={toggleChat}
          style={{
            width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'var(--primary)', color: 'white',
            border: 'none', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.35)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            animation: 'scaleIn 0.3s ease-out',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(79, 70, 229, 0.4)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.35)'; }}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: '380px', height: '520px', backgroundColor: 'var(--surface)', borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid var(--border)',
          animation: 'chatOpen 0.3s ease-out',
        }}>
          
          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Resolvify AI</h3>
                <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Online and ready to help</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button title="Clear Chat" onClick={clearChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.3rem', opacity: 0.7, borderRadius: '6px', transition: 'opacity 0.2s' }}
                onMouseOver={e => e.currentTarget.style.opacity = 1}
                onMouseOut={e => e.currentTarget.style.opacity = 0.7}
              >
                <Trash2 size={18} />
              </button>
              <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px' }}>
                <X size={22} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', display: 'flex', gap: '0.5rem', maxWidth: '85%' }}>
                {msg.sender === 'bot' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                    <Bot size={16} />
                  </div>
                )}
                
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '12px',
                  backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'white',
                  color: msg.sender === 'user' ? 'white' : '#1e293b',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '12px',
                  fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                  <Loader2 className="animate-spin" size={16} />
                </div>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', backgroundColor: 'white', color: '#94a3b8', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderBottomLeftRadius: '4px', fontSize: '0.9rem' }}>
                  Typing...
                </div>
              </div>
            )}
            {/* Suggested queries — only shown before first user message */}
            {messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Try asking</p>
                {SUGGESTED.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendSuggested(s.text)}
                    style={{
                      textAlign: 'left', background: 'white', border: '1px solid var(--border)',
                      borderRadius: '10px', padding: '0.55rem 0.875rem', fontSize: '0.82rem',
                      color: '#334155', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{ padding: '0.875rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Type your message..." 
              style={{ flex: 1, padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: '9999px', outline: 'none', fontSize: '0.9rem', transition: 'border-color 0.2s' }} 
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              style={{
                width: '42px', height: '42px', borderRadius: '50%',
                backgroundColor: input.trim() ? 'var(--primary)' : '#e2e8f0',
                color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'background-color 0.2s, transform 0.15s',
              }}
              onMouseOver={e => { if (input.trim()) e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Send size={18} style={{ marginLeft: '-1px' }} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
