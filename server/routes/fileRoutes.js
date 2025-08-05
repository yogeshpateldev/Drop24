// server/routes/fileRoutes.js
import express from 'express';
import multer from 'multer';
import File from '../models/File.js';
import { storage, cloudinary } from '../cloudinary.js';
import { authenticateUser, optionalAuth } from '../middleware/auth.js';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Configure multer with better error handling
const upload = multer({ 
  dest: 'uploads/',
  limits: { 
    fileSize: 10 * 1024 * 1024, // 50MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, documents, and archives are allowed.'), false);
    }
  }
});

// Upload file (requires authentication)
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { visibility, customName } = req.body;
    const userId = req.user._id; // From JWT auth

    // Validate visibility
    if (visibility && !['public', 'private'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility value' });
    }

    // Get extension and determine if raw
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1); // remove dot
    const isRaw = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'].includes(ext);

    const fullName = (customName || req.file.originalname).replace(/\s+/g, '_');
    const baseName = path.basename(fullName, path.extname(fullName));

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: isRaw ? 'raw' : 'auto',
      folder: 'drop24',
      public_id: baseName,
      unique_filename: false,
      overwrite: true,
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const fileDetail = await File.create({
      originalname: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      userId: userId,
      visibility: visibility || 'public',
      resource_type: result.resource_type,
    });

    res.json(fileDetail);
  } catch (err) {
    // Clean up temp file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', err.stack || err);
    
    if (err.message.includes('Invalid file type')) {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

// Get files (public files for all users, private files for authenticated users)
router.get('/files', optionalAuth, async (req, res) => {
  try {
    let query = { visibility: 'public' };
    
    // If user is authenticated, also include their private files
    if (req.user) {
      query = {
        $or: [
          { visibility: 'public' },
          { userId: req.user._id, visibility: 'private' }
        ]
      };
    }

    const files = await File.find(query).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's own files (requires authentication)
router.get('/my-files', authenticateUser, async (req, res) => {
  try {
    const files = await File.find({ userId: req.user._id }).sort({ uploadedAt: -1 });
    res.json(files);
  } catch (err) {
    console.error('Error fetching user files:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file (requires authentication and ownership)
router.delete('/upload/:id', authenticateUser, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if user owns the file
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete from Cloudinary if needed
    if (file.public_id) {
      try {
        await cloudinary.uploader.destroy(file.public_id);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from MongoDB
    await file.deleteOne();

    res.status(200).json({ message: 'File deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update file visibility (requires authentication and ownership)
router.patch('/upload/:id', authenticateUser, async (req, res) => {
  try {
    const { visibility } = req.body;
    const file = await File.findById(req.params.id);
    
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Check if user owns the file
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (visibility && ['public', 'private'].includes(visibility)) {
      file.visibility = visibility;
      await file.save();
      res.json(file);
    } else {
      res.status(400).json({ message: 'Invalid visibility value' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Auto-delete after 24 hours
cron.schedule('0 * * * *', async () => {
  try {
    const expired = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    const oldFiles = await File.find({ uploadedAt: { $lt: expired } });
    
    for (const file of oldFiles) {
      try {
        // Delete from Cloudinary
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
        // Delete from MongoDB
        await file.deleteOne();
        console.log(`Auto-deleted file: ${file.originalname}`);
      } catch (error) {
        console.error(`Error auto-deleting file ${file.originalname}:`, error);
      }
    }
  } catch (error) {
    console.error('Auto-delete cron job error:', error);
  }
});

export default router;
