import { Request, Response, NextFunction } from 'express';
import { analyzeMeal } from './ai.service';

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
  } catch (error) {
    next(error);
  }
};
