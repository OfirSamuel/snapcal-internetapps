import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createPost, getPosts, updatePost, deletePost, toggleLike } from './posts.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(getPosts);

router.route('/:id')
  .put(protect, upload.single('image'), updatePost)
  .delete(protect, deletePost);

router.post('/:id/like', protect, toggleLike);

export default router;
