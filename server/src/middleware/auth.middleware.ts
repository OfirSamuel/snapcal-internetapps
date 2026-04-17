import { Request, Response, NextFunction } from 'express';

export const protect = (req: any, res: Response, next: NextFunction) => {
  // Temporary mock user until Mishelle finishes Auth
  req.user = { id: '650af3b2e4b0a1a2b3c4d5e6', username: 'ofir_dev' };
  next();
};
