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

  const toggleChat = () => setIsOpen(!isOpen);

  const clearChat = () => {
    sessionStorage.removeItem('chatHistory');
    setMessages([{ sender: 'bot', text: 'Hi! I am the Resolvify AI Assistant. How can I help you map a complaint or resolve an issue today?' }]);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let complaintsContext = "";
      if (user?.id && user.role !== 'ADMIN') {
        try {
          const dbRes = await axios.get(`${API_BASE}/api/complaints`, { params: { userId: user.id } });
          if (dbRes.data && dbRes.data.length > 0) {
            complaintsContext = "User has the following complaints in the system: " + JSON.stringify(dbRes.data.map(c => ({ id: c.id, title: c.title, status: c.status, priority: c.priority })));
          }
        } catch (err) { /* ignore db context errors */ }
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Missing API Key. Please add VITE_GEMINI_API_KEY to .env.local to activate the chatbot.' }]);
        setLoading(false);
        return;
      }
      
      const promptText = `You are Resolvify AI, a smart assistant for a Complaint Management System. 
Keep responses strictly under 3 short sentences. 
${complaintsContext ? 'CONTEXT: ' + complaintsContext : ''}
User Input: "${userMsg.text}"`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: promptText }] }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const botText = response.data.candidates[0].content.parts[0].text;
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
