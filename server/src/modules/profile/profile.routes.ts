import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../../middleware/auth.middleware';
import { getMyProfile, updateMyProfile } from './profile.controller';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `avatar-${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

router.get('/me', protect, getMyProfile);
router.put('/me', protect, upload.single('avatar'), updateMyProfile);

export default router;
