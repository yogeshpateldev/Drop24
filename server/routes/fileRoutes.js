// server/routes/fileRoutes.js
import express from 'express';
import multer from 'multer';
import File from '../models/File.js';
import { storage, cloudinary } from '../cloudinary.js';
import cron from 'node-cron';

const router = express.Router();
const upload = multer({ storage });

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { visibility } = req.body;
    console.log('Uploaded file:', req.file); // debug

    const fileDetail = await File.create({
      originalname: req.file.originalname,
      url: req.file.path,
      public_id: req.file.filename,
      visibility,
    });
    console.log('Uploaded file info:', req.file);


    res.json(fileDetail);
  } catch (err) {
    console.error('Upload error:',err.stack || err);
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
