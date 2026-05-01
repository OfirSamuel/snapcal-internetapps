import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../modules/auth/auth.utils';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: missing bearer token' });
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: missing bearer token' });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token' });
  }
};
