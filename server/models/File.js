// server/models/File.js
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  originalname: String,
  url: String,
  public_id: String,
  userId: { type: String, required: true }, // Supabase user ID
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  uploadedAt: { type: Date, default: Date.now },
  accessToken: { type: String, unique: true, sparse: true },
  resource_type: { type: String, enum: ['image', 'raw'], required: true }
});

export default mongoose.model('File', fileSchema);
