const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  attachments: [{
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    size: { type: Number, default: 0 },
    contentType: { type: String, default: 'application/octet-stream' },
    extension: { type: String, default: '' },
    relativePath: { type: String, default: '' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
