const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Message = require('../models/Message');

// Temporary disk storage for uploads before streaming to MongoDB GridFS
const tempUploadDir = path.join(os.tmpdir(), 'portfolio-msg-uploads');
try {
  if (!fs.existsSync(tempUploadDir)) {
    fs.mkdirSync(tempUploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create tempUploadDir:', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + (file.originalname || 'upload'));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB per file
    files: 50 // Up to 50 files
  }
});

// Helper to get or initialize GridFSBucket
let bucket = null;
const getBucket = () => {
  if (!bucket && mongoose.connection.readyState === 1 && mongoose.connection.db) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'messageAttachments'
    });
  }
  return bucket;
};

// Stream file to GridFS
const streamToGridFS = (file, relativePath = '') => {
  return new Promise((resolve, reject) => {
    const gridBucket = getBucket();
    if (!gridBucket) {
      return reject(new Error('Database not connected. Cannot store attachments.'));
    }

    let originalName = file.originalname || 'attachment';
    try {
      // Fix potential latin1 encoding issue with special chars/emojis in multer
      originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      originalName = file.originalname;
    }

    const uploadStream = gridBucket.openUploadStream(originalName, {
      contentType: file.mimetype || 'application/octet-stream',
      metadata: {
        originalName,
        relativePath: relativePath || '',
        size: file.size,
        uploadDate: new Date()
      }
    });

    const readStream = fs.createReadStream(file.path);
    readStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      // Clean up temp file
      fs.unlink(file.path, () => {});
      resolve({
        fileId: uploadStream.id,
        name: originalName,
        size: file.size,
        contentType: file.mimetype || 'application/octet-stream',
        extension: path.extname(originalName).toLowerCase().replace('.', ''),
        relativePath: relativePath || ''
      });
    });

    uploadStream.on('error', (err) => {
      fs.unlink(file.path, () => {});
      reject(err);
    });

    readStream.on('error', (err) => {
      fs.unlink(file.path, () => {});
      reject(err);
    });
  });
};

// Get all messages (for admin)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// View / Preview attachment inline
router.get('/file/:fileId', async (req, res) => {
  try {
    const gridBucket = getBucket();
    if (!gridBucket) {
      return res.status(503).json({ message: 'Database storage not ready.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ message: 'Invalid file ID.' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const files = await gridBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const fileDoc = files[0];
    res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', fileDoc.length);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileDoc.filename)}"`);

    const downloadStream = gridBucket.openDownloadStream(fileId);
    downloadStream.on('error', (err) => {
      if (!res.headersSent) res.status(404).json({ message: 'Error streaming file.' });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Download attachment directly
router.get('/download/:fileId', async (req, res) => {
  try {
    const gridBucket = getBucket();
    if (!gridBucket) {
      return res.status(503).json({ message: 'Database storage not ready.' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.fileId)) {
      return res.status(400).json({ message: 'Invalid file ID.' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    const files = await gridBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found.' });
    }

    const fileDoc = files[0];
    res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', fileDoc.length);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileDoc.filename)}"`);

    const downloadStream = gridBucket.openDownloadStream(fileId);
    downloadStream.on('error', (err) => {
      if (!res.headersSent) res.status(404).json({ message: 'Error downloading file.' });
    });
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit a new message with optional attachments
router.post('/', upload.array('attachments', 50), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
    }

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      // Relative paths can be sent as JSON string or individual fields
      let relativePathsMap = {};
      if (req.body.relativePaths) {
        try {
          relativePathsMap = JSON.parse(req.body.relativePaths);
        } catch (e) {}
      }

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const relPath = relativePathsMap[file.originalname] || req.body[`relativePath_${i}`] || '';
        try {
          const fileRecord = await streamToGridFS(file, relPath);
          attachments.push(fileRecord);
        } catch (uploadErr) {
          console.error('Failed to upload file to GridFS:', file.originalname, uploadErr.message);
        }
      }
    }

    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      attachments
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Create Message Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update message status (e.g. read/replied)
router.patch('/:id/status', async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a message and its attachments
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Delete attached files from GridFS
    if (message.attachments && message.attachments.length > 0) {
      const gridBucket = getBucket();
      if (gridBucket) {
        for (const att of message.attachments) {
          if (att.fileId) {
            try {
              await gridBucket.delete(new mongoose.Types.ObjectId(att.fileId));
            } catch (delErr) {
              console.warn('GridFS delete warning:', delErr.message);
            }
          }
        }
      }
    }

    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: 'Message and attachments deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
