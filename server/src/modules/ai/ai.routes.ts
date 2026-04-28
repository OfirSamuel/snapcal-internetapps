import express from 'express';
import { analyzeMealController } from './ai.controller';

const router = express.Router();

router.post('/analyze', analyzeMealController);

export default router;
