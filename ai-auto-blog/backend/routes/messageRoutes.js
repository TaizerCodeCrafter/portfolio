const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Message = require('../models/Message');

// Persistent storage directory for large uploads
const persistentUploadDir = path.join(__dirname, '..', 'uploads', 'attachments');
try {
  if (!fs.existsSync(persistentUploadDir)) {
    fs.mkdirSync(persistentUploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create persistentUploadDir:', e.message);
}

// 5GB per file limit (supports up to 5GB setups, archives, videos, folders)
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5 GB
const MAX_FILES_COUNT = 100;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, persistentUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Sanitize filename
    const safeName = (file.originalname || 'upload').replace(/[^\w\s.-]/gi, '_');
    cb(null, uniqueSuffix + '-' + safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT
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
      return reject(new Error('Database not connected.'));
    }

    let originalName = file.originalname || 'attachment';
    try {
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
      // Remove temporary disk file once safely stored in GridFS
      fs.unlink(file.path, () => {});
      resolve({
        fileId: uploadStream.id,
        name: originalName,
        size: file.size,
        contentType: file.mimetype || 'application/octet-stream',
        extension: path.extname(originalName).toLowerCase().replace('.', ''),
        relativePath: relativePath || '',
        storageType: 'gridfs',
        localFilename: ''
      });
    });

    uploadStream.on('error', (err) => {
      reject(err);
    });

    readStream.on('error', (err) => {
      reject(err);
    });
  });
};

// Process an uploaded file into an attachment record
const processAttachment = async (file, relativePath = '') => {
  let originalName = file.originalname || 'attachment';
  try {
    originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
  } catch (e) {
    originalName = file.originalname;
  }

  const extension = path.extname(originalName).toLowerCase().replace('.', '');
  const contentType = file.mimetype || 'application/octet-stream';

  // For small files (<= 40MB), store in GridFS if database is available
  // For large files (> 40MB, up to 5GB), keep in persistent local disk to avoid exhausting MongoDB Atlas 512MB quota
  const GRIDFS_THRESHOLD = 40 * 1024 * 1024; // 40MB

  if (file.size <= GRIDFS_THRESHOLD && getBucket()) {
    try {
      return await streamToGridFS(file, relativePath);
    } catch (err) {
      console.warn('GridFS stream fallback to local storage for:', originalName, err.message);
    }
  }

  // Large file (>40MB) or GridFS fallback: store permanently on local server disk
  return {
    fileId: new mongoose.Types.ObjectId(),
    name: originalName,
    size: file.size,
    contentType,
    extension,
    relativePath: relativePath || '',
    storageType: 'local',
    localFilename: file.filename
  };
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
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID.' });
    }

    const fileObjectId = new mongoose.Types.ObjectId(fileId);
    const message = await Message.findOne({ 'attachments.fileId': fileObjectId });
    const att = message ? message.attachments.find(a => a.fileId.toString() === fileId) : null;

    // 1. If stored locally
    if (att && att.localFilename) {
      const filePath = path.join(persistentUploadDir, att.localFilename);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', att.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(att.name)}"`);
        return res.sendFile(path.resolve(filePath));
      }
    }

    // 2. If stored in GridFS
    const gridBucket = getBucket();
    if (gridBucket) {
      const files = await gridBucket.find({ _id: fileObjectId }).toArray();
      if (files && files.length > 0) {
        const fileDoc = files[0];
        res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', fileDoc.length);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileDoc.filename)}"`);

        const downloadStream = gridBucket.openDownloadStream(fileObjectId);
        downloadStream.on('error', () => {
          if (!res.headersSent) res.status(404).json({ message: 'Error streaming file.' });
        });
        return downloadStream.pipe(res);
      }
    }

    return res.status(404).json({ message: 'File not found.' });
  } catch (err) {
    console.error('View attachment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Download attachment directly
router.get('/download/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID.' });
    }

    const fileObjectId = new mongoose.Types.ObjectId(fileId);
    const message = await Message.findOne({ 'attachments.fileId': fileObjectId });
    const att = message ? message.attachments.find(a => a.fileId.toString() === fileId) : null;

    // 1. If stored locally
    if (att && att.localFilename) {
      const filePath = path.join(persistentUploadDir, att.localFilename);
      if (fs.existsSync(filePath)) {
        return res.download(path.resolve(filePath), att.name || 'attachment');
      }
    }

    // 2. If stored in GridFS
    const gridBucket = getBucket();
    if (gridBucket) {
      const files = await gridBucket.find({ _id: fileObjectId }).toArray();
      if (files && files.length > 0) {
        const fileDoc = files[0];
        res.setHeader('Content-Type', fileDoc.contentType || 'application/octet-stream');
        res.setHeader('Content-Length', fileDoc.length);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileDoc.filename)}"`);

        const downloadStream = gridBucket.openDownloadStream(fileObjectId);
        downloadStream.on('error', () => {
          if (!res.headersSent) res.status(404).json({ message: 'Error downloading file.' });
        });
        return downloadStream.pipe(res);
      }
    }

    return res.status(404).json({ message: 'File not found.' });
  } catch (err) {
    console.error('Download attachment error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Submit a new message with optional large attachments (up to 5GB)
router.post('/', (req, res, next) => {
  // Allow indefinite timeout for massive multi-gigabyte uploads
  req.setTimeout(0);
  res.setTimeout(0);

  upload.array('attachments', MAX_FILES_COUNT)(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ 
            message: 'File too large. Maximum supported file size is 5GB.' 
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({ 
            message: `Too many files. Maximum allowed is ${MAX_FILES_COUNT} files.` 
          });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ message: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required.' });
    }

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
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
          const fileRecord = await processAttachment(file, relPath);
          attachments.push(fileRecord);
        } catch (uploadErr) {
          console.error('Failed to process attachment:', file.originalname, uploadErr.message);
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

// Update message status
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

    // Clean up attachments
    if (message.attachments && message.attachments.length > 0) {
      const gridBucket = getBucket();
      for (const att of message.attachments) {
        // 1. If stored locally, delete from persistent disk
        if (att.localFilename) {
          const filePath = path.join(persistentUploadDir, att.localFilename);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
          }
        }
        // 2. If stored in GridFS, delete from bucket
        if (gridBucket && att.fileId) {
          try {
            await gridBucket.delete(new mongoose.Types.ObjectId(att.fileId));
          } catch (delErr) {
            // Ignore if already gone
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
