import express from 'express';
import multer from 'multer';
import path from 'path';
import { createPost, getPosts } from './posts.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

router.route('/')
  .post(protect, upload.single('image'), createPost)
  .get(getPosts);

export default router;
