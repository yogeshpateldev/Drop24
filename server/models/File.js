// server/models/File.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  originalname: String,
  url: String,
  public_id: String,
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  uploadedAt: { type: Date, default: Date.now },
  accessToken: { type: String, unique: true, sparse: true }
});

export default mongoose.model('File', fileSchema);
