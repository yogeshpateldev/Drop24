// server/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import fileRoutes from './routes/fileRoutes.js';

dotenv.config();
const app = express();
app.use(cors({
  origin: 'https://drop24-26rcehdcu-yogeshs-projects-a551ca33.vercel.app', // replace with actual frontend domain
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api', fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
