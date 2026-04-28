import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { createComment, getCommentsByPost } from './comments.controller';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/post/:postId', getCommentsByPost);

export default router;
