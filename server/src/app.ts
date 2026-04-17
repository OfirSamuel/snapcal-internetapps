import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
