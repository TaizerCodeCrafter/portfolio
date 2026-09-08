const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['blog', 'project'],
    required: true
  },
  targetId: {
    type: String,
    required: true,
    index: true
  },
  targetTitle: {
    type: String,
    default: ''
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  avatar: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'spam'],
    default: 'approved'
  }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
