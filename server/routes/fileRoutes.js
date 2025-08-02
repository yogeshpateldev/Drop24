// server/routes/fileRoutes.js
import express from 'express';
import multer from 'multer';
import File from '../models/File.js';
import { storage, cloudinary } from '../cloudinary.js';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // ✅ saves to disk temporarily


// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { visibility, customName } = req.body;

    // Get extension and determine if raw
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1); // remove dot
    const isRaw = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'].includes(ext);

    const public_id = (customName || req.file.originalname).replace(/\s+/g, '_');

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: isRaw ? 'raw' : 'auto',
      folder: 'drop24',
      public_id,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    const fileDetail = await File.create({
      originalname: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      visibility,
    });

    res.json(fileDetail);
  } catch (err) {
    console.error('Upload error:', err.stack || err);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});


// Get all public files
router.get('/files', async (req, res) => {
  const files = await File.find({ visibility: 'public' });
  res.json(files);
});

// Delete file manually
router.delete('/upload/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: 'File not found' });

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
