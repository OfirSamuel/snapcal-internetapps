import express from 'express';
import { google, login, refresh, register } from './auth.controller';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/google', google);

export default router;
