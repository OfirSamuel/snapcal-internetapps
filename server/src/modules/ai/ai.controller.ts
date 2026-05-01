import { Request, Response, NextFunction } from 'express';
import { analyzeMeal, analyzeMealImage } from './ai.service';

export const analyzeMealController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (description.length > 1000) {
      return res.status(400).json({ message: 'Description must be under 1000 characters' });
    }

    const result = await analyzeMeal(description.trim());
    res.json(result);
  } catch (error: any) {
    const message = error?.message || 'AI analysis failed';
    const status = error?.status || error?.httpCode || 500;
    console.error('AI analysis error:', message);
    res.status(status).json({ message });
  }
};

export const analyzeImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ message: 'Image must be under 10MB' });
    }

    const result = await analyzeMealImage(req.file.buffer, req.file.mimetype);
    res.json(result);
  } catch (error: any) {
    const message = error?.message || 'AI image analysis failed';
    const status = error?.status || error?.httpCode || 500;
    console.error('AI image analysis error:', message);
    res.status(status).json({ message });
  }
};
