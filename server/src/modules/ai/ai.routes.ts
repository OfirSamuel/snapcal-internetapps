import express from 'express';
import multer from 'multer';
import { analyzeMealController, analyzeImageController } from './ai.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/analyze', analyzeMealController);
router.post('/analyze-image', upload.single('image'), analyzeImageController);

export default router;
