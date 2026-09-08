import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Mail, CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './CommentSection.css';

const CommentSection = ({ targetType = 'blog', targetId, targetTitle = '' }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  // Form state
  const [userName, setUserName] = useState(() => localStorage.getItem('portfolio_commenter_name') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('portfolio_commenter_email') || '');
  const [content, setContent] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Generate dynamic avatar based on email or name
  const seed = userEmail.trim().toLowerCase() || userName.trim() || 'Visitor';
  const liveAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

  useEffect(() => {
    if (!targetId) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/comments?targetType=${targetType}&targetId=${targetId}`);
        if (Array.isArray(res.data)) {
          setComments(res.data);
        }
      } catch (err) {
        console.warn('Failed to load comments:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [targetType, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !content.trim()) {
      setStatusMessage({ text: 'Please fill in your name, email, and message.', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      setStatusMessage({ text: 'Please enter a valid email address.', type: 'error' });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ text: '', type: '' });

    if (rememberMe) {
      localStorage.setItem('portfolio_commenter_name', userName.trim());
      localStorage.setItem('portfolio_commenter_email', userEmail.trim().toLowerCase());
    }

    const payload = {
      targetType,
      targetId,
      targetTitle: targetTitle || 'Item',
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      avatar: liveAvatarUrl,
      content: content.trim()
    };

    try {
      const res = await axios.post('/api/comments', payload);
      if (res.data && res.data._id) {
        setComments(prev => [res.data, ...prev]);
        setContent('');
        setStatusMessage({ text: 'Comment posted successfully! Thank you for sharing.', type: 'success' });
        setTimeout(() => setStatusMessage({ text: '', type: '' }), 4000);
      }
    } catch (err) {
      console.error('Comment submission error:', err.response?.data || err.message);
      setStatusMessage({ 
        text: err.response?.data?.message || 'Failed to post comment. Please try again.', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCommentDate = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="comment-section-container">
      <div className="comment-section-header">
        <div className="comment-header-title">
          <MessageSquare size={22} className="comment-title-icon" />
          <h3>Discussion</h3>
          <span className="comment-count-chip">{comments.length}</span>
        </div>
        <p className="comment-header-subtitle">
          Leave your thoughts, ask questions, or provide feedback.
        </p>
      </div>

      {/* New Comment Form */}
      <form className="comment-form glass" onSubmit={handleSubmit}>
        <div className="comment-form-avatar-preview">
          <img src={liveAvatarUrl} alt="Avatar preview" className="preview-avatar" />
          <div className="avatar-badge">
            <Sparkles size={12} />
          </div>
        </div>

        <div className="comment-form-inputs">
          <div className="comment-input-row">
            <div className="comment-input-group">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Your Name *"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="comment-input"
              />
            </div>
            <div className="comment-input-group">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="Your Email (Google / Yahoo / etc.) *"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="comment-input"
              />
            </div>
          </div>

          <div className="comment-textarea-group">
            <textarea
              rows="3"
              placeholder="Write your comment or question here..."
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="comment-textarea"
            ></textarea>
          </div>

          <div className="comment-form-footer">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember my name & email</span>
            </label>

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="submit-comment-btn"
            >
              {submitting ? 'Posting...' : <><Send size={16} /> Post Comment</>}
            </motion.button>
          </div>

          <AnimatePresence>
            {statusMessage.text && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`comment-feedback ${statusMessage.type}`}
              >
                {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{statusMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <div className="empty-bubble">
              <MessageSquare size={32} />
            </div>
            <h4>No comments yet</h4>
            <p>Be the first to share your perspective on this!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="comment-card glass"
            >
              <div className="comment-author-avatar-wrap">
                <img
                  src={comment.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(comment.userEmail || comment.userName)}`}
                  alt={comment.userName}
                  className="comment-author-avatar"
                />
              </div>

              <div className="comment-body">
                <div className="comment-meta-row">
                  <div className="comment-author-info">
                    <span className="comment-author-name">{comment.userName}</span>
                    <span className="comment-author-email" title={`Verified email: ${comment.userEmail}`}>
                      <Mail size={12} /> {comment.userEmail}
                    </span>
                  </div>
                  <span className="comment-timestamp">
                    <Clock size={12} /> {formatCommentDate(comment.createdAt)}
                  </span>
                </div>

                <p className="comment-content-text">{comment.content}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
