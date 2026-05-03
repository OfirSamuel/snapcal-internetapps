import { Request, Response } from 'express';
import type { TokenPayload } from 'google-auth-library';
import mongoose from 'mongoose';
import User from '../users/users.model';
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './auth.utils';
import { verifyGoogleIdToken } from './googleVerify';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  username?: string;
  password?: string;
}

interface RefreshBody {
  refreshToken?: string;
}

interface GoogleBody {
  credential?: string;
}

interface RawUserDoc {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  googleId?: string;
  passwordHash?: string;
  refreshToken?: string;
}

const buildTokenPayload = (user: RawUserDoc) => ({
  userId: user._id.toString(),
  email: user.email,
});

const sanitizeUser = (user: RawUserDoc) => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  avatar: user.avatar ?? '',
  avatarUrl: user.avatarUrl ?? '',
});

const baseUsernameFromGoogle = (name: string | undefined, email: string): string => {
  const cleaned = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24);
  if (cleaned.length >= 2) return cleaned;
  const local = email
    .split('@')[0]
    ?.replace(/[^a-z0-9_]/gi, '')
    .toLowerCase()
    .slice(0, 24);
  if (local && local.length >= 2) return local;
  return `user_${email.split('@')[0]?.slice(0, 8) || 'snapcal'}`.replace(/[^a-z0-9_]/g, '_').toLowerCase();
};

const ensureUniqueUsername = async (name: string | undefined, email: string): Promise<string> => {
  const base = baseUsernameFromGoogle(name, email).slice(0, 28);
  let candidate = base;
  let counter = 0;
  while (await User.exists({ username: candidate })) {
    counter += 1;
    candidate = `${base.slice(0, 20)}_${counter}`;
    if (counter > 200) {
      candidate = `${base.slice(0, 10)}_${Date.now().toString(36)}`;
      break;
    }
  }
  return candidate;
};

const rawUserFromMongoose = (u: {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  googleId?: string;
  passwordHash?: string;
  refreshToken?: string;
}): RawUserDoc => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  avatar: u.avatar,
  avatarUrl: u.avatarUrl,
  googleId: u.googleId,
  passwordHash: u.passwordHash,
  refreshToken: u.refreshToken,
});

export const register = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    if (!normalizedUsername || !normalizedEmail) {
      return res.status(400).json({ message: 'username and email must not be empty' });
    }

    const existing = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existing) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }

    const passwordHash = await hashPassword(password);

    const createdUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      avatar: '',
    });

    const baseUser: RawUserDoc = {
      _id: createdUser._id as mongoose.Types.ObjectId,
      username: createdUser.username,
      email: createdUser.email,
      avatar: createdUser.avatar,
      passwordHash: createdUser.passwordHash,
    };

    let accessToken: string;
    let refreshToken: string;
    try {
      accessToken = signAccessToken(buildTokenPayload(baseUser));
      refreshToken = signRefreshToken(buildTokenPayload(baseUser));
    } catch {
      await User.deleteOne({ _id: createdUser._id });
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    await User.updateOne(
      { _id: createdUser._id },
      { $set: { refreshToken } }
    );

    return res.status(201).json({
      user: sanitizeUser(baseUser),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user' });
  }
};

export const login = async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if ((!email && !username) || !password) {
      return res.status(400).json({ message: 'email or username, and password are required' });
    }

    let rawUser: RawUserDoc | null = null;

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      rawUser = (await User.collection.findOne({ email: normalizedEmail })) as RawUserDoc | null;
    } else if (username) {
      const normalizedUsername = username.trim();
      rawUser = (await User.collection.findOne({ username: normalizedUsername })) as RawUserDoc | null;
    }

    if (!rawUser || !rawUser.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await comparePassword(password, rawUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken(buildTokenPayload(rawUser));
    const refreshToken = signRefreshToken(buildTokenPayload(rawUser));

    await User.collection.updateOne(
      { _id: rawUser._id },
      { $set: { refreshToken } }
    );

    return res.status(200).json({
      user: sanitizeUser(rawUser),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login' });
  }
};

export const refresh = async (req: Request<unknown, unknown, RefreshBody>, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'refreshToken is required' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!mongoose.Types.ObjectId.isValid(payload.userId)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const rawUser = (await User.collection.findOne({
      _id: new mongoose.Types.ObjectId(payload.userId),
    })) as RawUserDoc | null;

    if (!rawUser || rawUser.email !== payload.email || rawUser.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = signAccessToken(buildTokenPayload(rawUser));
    const newRefreshToken = signRefreshToken(buildTokenPayload(rawUser));

    await User.collection.updateOne(
      { _id: rawUser._id },
      { $set: { refreshToken: newRefreshToken } }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const google = async (req: Request<unknown, unknown, GoogleBody>, res: Response) => {
  try {
    const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!googleClientId) {
      return res.status(500).json({ message: 'Google sign-in is not configured' });
    }

    const credential =
      typeof req.body?.credential === 'string' ? req.body.credential.trim() : '';
    if (!credential) {
      return res.status(400).json({ message: 'credential is required' });
    }

    let payload: TokenPayload;
    try {
      payload = await verifyGoogleIdToken(credential, googleClientId);
    } catch {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    if (!payload.email || !payload.sub || payload.email_verified !== true) {
      return res.status(401).json({ message: 'Invalid Google account' });
    }

    const normalizedEmail = payload.email.toLowerCase().trim();
    const picture = payload.picture?.trim() || undefined;

    let userDoc =
      (await User.findOne({ googleId: payload.sub })) ||
      (await User.findOne({ email: normalizedEmail }));

    if (userDoc) {
      if (userDoc.googleId && userDoc.googleId !== payload.sub) {
        return res
          .status(409)
          .json({ message: 'This email is linked to a different Google account' });
      }
      if (!userDoc.googleId) {
        userDoc.googleId = payload.sub;
      }
      if (!userDoc.avatarUrl && picture) {
        userDoc.avatarUrl = picture;
      }
      await userDoc.save();
    } else {
      const username = await ensureUniqueUsername(payload.name, normalizedEmail);
      try {
        userDoc = await User.create({
          email: normalizedEmail,
          username,
          googleId: payload.sub,
          avatarUrl: picture,
          avatar: '',
        });
      } catch (err: unknown) {
        const code = (err as { code?: number })?.code;
        if (code === 11000) {
          return res.status(409).json({ message: 'Unable to create account. Try again.' });
        }
        throw err;
      }
    }

    const rawUser = rawUserFromMongoose(userDoc);

    let accessToken: string;
    let refreshToken: string;
    try {
      accessToken = signAccessToken(buildTokenPayload(rawUser));
      refreshToken = signRefreshToken(buildTokenPayload(rawUser));
    } catch {
      return res.status(500).json({ message: 'Failed to issue tokens' });
    }

    await User.collection.updateOne({ _id: rawUser._id }, { $set: { refreshToken } });

    const persisted = (await User.collection.findOne({ _id: rawUser._id })) as RawUserDoc | null;
    if (!persisted) {
      return res.status(500).json({ message: 'Failed to complete Google sign-in' });
    }

    return res.status(200).json({
      user: sanitizeUser(persisted),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete Google sign-in' });
  }
};
