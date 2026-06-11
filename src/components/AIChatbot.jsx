import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Bot } from 'lucide-react';
import axios from 'axios';
import './AIChatbot.css';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your AI assistant. How can I help you learn more about my creator\'s services today?' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');

    // Add a temporary "Thinking..." message
    setMessages(prev => [...prev, { role: 'bot', text: 'Thinking...', isThinking: true }]);

    try {
      const res = await axios.post('/api/ai/chat', { message: currentInput });
      
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, { role: 'bot', text: res.data.reply }];
      });
    } catch (err) {
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered, { role: 'bot', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }];
      });
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="chatbot-toggle-btn"
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="chatbot-window glass"
          >
            <div className="chatbot-header">
              <div className="bot-info">
                <div className="bot-avatar"><Bot size={18} /></div>
                <div>
                  <h4>AI Assistant</h4>
                  <span className="online-status">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="close-bot"><X size={20} /></button>
            </div>

            <div className="chatbot-messages" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`message-wrapper ${msg.role}`}>
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="chatbot-input-area">
              <input 
                type="text" 
                placeholder="Ask me something..." 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="send-btn"><Send size={18} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
