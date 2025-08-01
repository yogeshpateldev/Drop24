// server/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';
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
    const fullName = customName || file.originalname;
    const ext = path.extname(fullName).toLowerCase(); // e.g. '.pdf'
    const isRaw = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar'].includes(ext);

    return {
      folder: 'drop24',
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      public_id: fullName, // includes extension
      resource_type: isRAW ? 'raw' : 'auto', // <-- key part
    };
  },
});


export { cloudinary, storage };
