// server/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📁 Custom filename support
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const customName = req.body.customName?.trim();
    const originalName = file.originalname.split('.').slice(0, -1).join('.');
    
    return {
      folder: 'drop24',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      public_id: customName || originalName, // 🔁 Either custom or original
      resource_type: 'auto',
    };
  },
});

export { cloudinary, storage };
