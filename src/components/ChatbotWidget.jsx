import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import API_BASE from '../api';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am the Resolvify AI Assistant. How can I help you map a complaint or resolve an issue today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/chat`, { message: userMsg.text });
      // The Gemini API response structure might return raw JSON string from RestTemplate if not mapped carefully,
      // but assuming the backend maps it correctly or returns a string. Let's handle chatResponse nicely.
      let botText = response.data.reply;
      
      // If the backend returns the raw Gemini JSON in the 'reply' field:
      if (typeof botText === 'string' && botText.includes('candidates')) {
        try {
           const parsed = JSON.parse(botText);
           botText = parsed.candidates[0]?.content?.parts[0]?.text || "I couldn't process that.";
        } catch { /* ignore if not JSON */ }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      
      {!isOpen && (
        <button 
          onClick={toggleChat}
          style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 10px 15px -3px rgba(59,130,246,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={32} />
        </button>
      )}

      {isOpen && (
        <div style={{ width: '380px', height: '600px', backgroundColor: 'var(--surface)', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--border)' }}>
          
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Bot size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Resolvify AI</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Online and ready to help</p>
              </div>
            </div>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.25rem' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', display: 'flex', gap: '0.5rem', maxWidth: '85%' }}>
                {msg.sender === 'bot' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                    <Bot size={18} />
                  </div>
                )}
                
                <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: msg.sender === 'user' ? 'var(--primary)' : 'white', color: msg.sender === 'user' ? 'white' : '#1e293b', boxShadow: msg.sender === 'bot' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', borderBottomRightRadius: msg.sender === 'user' ? '0.25rem' : '1rem', borderBottomLeftRadius: msg.sender === 'bot' ? '0.25rem' : '1rem', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </div>

                {msg.sender === 'user' && (
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto' }}>
                  <Loader2 className="animate-spin" size={18} />
                </div>
                <div style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: 'white', color: '#64748b', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderBottomLeftRadius: '0.25rem' }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} style={{ padding: '1rem', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Type your message..." 
              style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '9999px', outline: 'none', fontSize: '0.95rem' }} 
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()} 
              style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: input.trim() ? 'var(--primary)' : '#cbd5e1', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', transition: 'background-color 0.2s' }}
            >
              <Send size={20} style={{ marginLeft: '-2px' }} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
