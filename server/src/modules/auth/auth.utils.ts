import bcrypt from 'bcryptjs';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

type TokenKind = 'access' | 'refresh';

export interface AuthTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

const DEFAULT_ACCESS_EXPIRES_IN = '15m';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';
const PASSWORD_SALT_ROUNDS = 12;

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getTokenSecret = (kind: TokenKind): string => {
  return kind === 'access'
    ? getRequiredEnv('JWT_ACCESS_SECRET')
    : getRequiredEnv('JWT_REFRESH_SECRET');
};

const getTokenExpiration = (kind: TokenKind): string => {
  if (kind === 'access') {
    return process.env.JWT_ACCESS_EXPIRES_IN ?? DEFAULT_ACCESS_EXPIRES_IN;
  }
  return process.env.JWT_REFRESH_EXPIRES_IN ?? DEFAULT_REFRESH_EXPIRES_IN;
};

const signToken = (payload: AuthTokenPayload, kind: TokenKind): string => {
  const options: SignOptions = {
    expiresIn: getTokenExpiration(kind) as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, getTokenSecret(kind), options);
};

const verifyToken = (token: string, kind: TokenKind): AuthTokenPayload => {
  const decoded = jwt.verify(token, getTokenSecret(kind));

  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload format');
  }

  if (!decoded.userId || !decoded.email) {
    throw new Error('Invalid token payload data');
  }

  return decoded as AuthTokenPayload;
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
  return bcrypt.hash(plainPassword, PASSWORD_SALT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  passwordHash: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, passwordHash);
};

export const signAccessToken = (payload: AuthTokenPayload): string => {
  return signToken(payload, 'access');
};

export const signRefreshToken = (payload: AuthTokenPayload): string => {
  return signToken(payload, 'refresh');
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return verifyToken(token, 'access');
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return verifyToken(token, 'refresh');
};
