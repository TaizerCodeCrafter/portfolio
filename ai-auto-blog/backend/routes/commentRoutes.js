const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Get comments for a target (blog or project)
router.get('/', async (req, res) => {
  try {
    const { targetType, targetId } = req.query;
    if (!targetType || !targetId) {
      return res.status(400).json({ message: 'targetType and targetId are required' });
    }

    const comments = await Comment.find({ 
      targetType, 
      targetId,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all comments
router.get('/admin/all', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching all comments for admin:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Post new comment
router.post('/', async (req, res) => {
  try {
    const { targetType, targetId, targetTitle, userName, userEmail, content, avatar } = req.body;

    if (!targetType || !targetId || !userName || !userEmail || !content) {
      return res.status(400).json({ message: 'Name, email, and comment message are required.' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const resolvedAvatar = avatar && avatar.trim() 
      ? avatar.trim() 
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;

    const newComment = new Comment({
      targetType,
      targetId,
      targetTitle: targetTitle || '',
      userName: userName.trim(),
      userEmail: cleanEmail,
      avatar: resolvedAvatar,
      content: content.trim(),
      status: 'approved'
    });

    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating comment:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Admin: Update comment status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Comment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Comment not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete comment
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Comment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
