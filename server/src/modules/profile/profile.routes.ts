import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { getMyProfile, updateMyProfile } from './profile.controller';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

export default router;
