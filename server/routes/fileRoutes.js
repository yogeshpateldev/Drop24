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
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, 
}); // ✅ saves to disk temporarily

// Upload file (requires authentication)
router.post('/upload', authenticateUser, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { visibility, customName } = req.body;
    const userId = req.user.id; // From Supabase auth

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
    console.error('Upload error:', err.stack || err);
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
          { userId: req.user.id, visibility: 'private' }
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
    const files = await File.find({ userId: req.user.id }).sort({ uploadedAt: -1 });
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
    if (file.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete from Cloudinary if needed
    if (file.public_id) {
      await cloudinary.uploader.destroy(file.public_id);
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
    if (file.userId !== req.user.id) {
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
  const expired = new Date(Date.now() - 1 * 60 * 60 * 1000);
  const oldFiles = await File.find({ uploadedAt: { $lt: expired } });
  for (const file of oldFiles) {
    await cloudinary.uploader.destroy(file.public_id);
    await file.deleteOne();
  }
});

export default router;
