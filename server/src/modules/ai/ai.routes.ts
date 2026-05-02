import express from 'express';
import multer from 'multer';
import { analyzeMealController, analyzeImageController, getRecipeOfTheDayController } from './ai.controller';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/recipe-of-the-day', getRecipeOfTheDayController);
router.post('/analyze', analyzeMealController);
router.post('/analyze-image', upload.single('image'), analyzeImageController);

export default router;
