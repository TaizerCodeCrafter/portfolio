import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './LikeButton.css';

const LikeButton = ({ targetType = 'blog', targetId, initialLikes = 0, size = 18, showCount = true, className = '' }) => {
  const storageKey = `portfolio_liked_${targetType}_${targetId}`;
  const [likes, setLikes] = useState(initialLikes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLikes(initialLikes || 0);
  }, [initialLikes]);

  useEffect(() => {
    if (targetId) {
      const stored = localStorage.getItem(storageKey);
      setIsLiked(stored === 'true');
    }
  }, [targetId, storageKey]);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!targetId || isLoading) return;

    setIsLoading(true);
    const nextState = !isLiked;
    const action = nextState ? 'like' : 'unlike';
    
    // Optimistic UI update
    setIsLiked(nextState);
    setLikes(prev => Math.max(0, prev + (nextState ? 1 : -1)));
    if (nextState) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }

    try {
      const endpoint = targetType === 'project' 
        ? `/api/projects/${targetId}/like` 
        : `/api/blogs/${targetId}/like`;
      const res = await axios.post(endpoint, { action });
      if (typeof res.data?.likes === 'number') {
        setLikes(res.data.likes);
      }
    } catch (err) {
      console.warn('Like request failed, reverting state:', err.message);
      // Revert if error
      setIsLiked(!nextState);
      setLikes(prev => Math.max(0, prev + (nextState ? -1 : 1)));
      if (!nextState) {
        localStorage.setItem(storageKey, 'true');
      } else {
        localStorage.removeItem(storageKey);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.88 }}
      onClick={handleToggleLike}
      className={`like-btn ${isLiked ? 'liked' : ''} ${className}`}
      title={isLiked ? 'Unlike' : 'Like'}
      aria-label="Like button"
    >
      <motion.div
        animate={isLiked ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="like-icon-wrap"
      >
        <Heart 
          size={size} 
          fill={isLiked ? '#ef4444' : 'transparent'} 
          stroke={isLiked ? '#ef4444' : 'currentColor'} 
          className="like-heart-icon"
        />
      </motion.div>
      {showCount && (
        <span className="like-count-badge">
          {likes > 0 ? likes : ''}
        </span>
      )}
    </motion.button>
  );
};

export default LikeButton;
