import express from 'express';
import multer from 'multer';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure local multer storage for documents
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const localUpload = multer({ storage: localStorage });

// Configure Cloudinary storage for avatars
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lawlink_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  } as any,
});

const cloudinaryUpload = multer({ storage: cloudinaryStorage });

// POST /api/upload
// Expects form-data with fields: complaintId, slotId, and the file(s)
router.post('/', localUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { complaintId, slotId } = req.body;

    if (!complaintId || !slotId) {
      return res.status(400).json({ success: false, error: 'complaintId and slotId are required' });
    }

    // Save to database
    const document = await prisma.document.create({
      data: {
        complaintId,
        type: slotId,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
      },
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
});

// POST /api/upload/avatar
// Expects form-data with field: avatar
router.post('/avatar', authenticate, cloudinaryUpload.single('avatar'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No avatar uploaded' });
    }

    // Cloudinary automatically returns the secure url in req.file.path
    const avatarUrl = req.file.path;
    
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { avatar: avatarUrl }
    });

    res.status(200).json({ success: true, data: { avatarUrl } });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload avatar' });
  }
});

export default router;
