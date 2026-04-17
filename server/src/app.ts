import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/error.middleware';
import postRoutes from './modules/posts/posts.routes';
import './modules/users/users.model'; // Register User schema

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the server root uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/api/posts', postRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
