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
  const botWindowRef = useRef(null);
  const toggleBtnRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Listen for external close requests (e.g. when mobile menu opens)
  useEffect(() => {
    const handleCloseChat = () => setIsOpen(false);
    window.addEventListener('close-ai-chat', handleCloseChat);
    return () => window.removeEventListener('close-ai-chat', handleCloseChat);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        botWindowRef.current &&
        !botWindowRef.current.contains(e.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    // Close mobile menu if open to avoid clutter
    window.dispatchEvent(new Event('close-mobile-menu'));
  };

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
        ref={toggleBtnRef}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleOpen}
        className="chatbot-toggle-btn"
        title="Chat with AI Assistant"
        aria-label="Open AI Assistant"
      >
        <Sparkles size={24} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={botWindowRef}
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="chatbot-window"
          >
            <div className="chatbot-header">
              <div className="bot-info">
                <div className="bot-avatar"><Bot size={18} /></div>
                <div>
                  <h4>AI Assistant</h4>
                  <span className="online-status">Online</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsOpen(false)} 
                className="close-bot"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
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
              <button onClick={handleSend} className="send-btn" title="Send message" aria-label="Send">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
