import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../users/users.model';
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './auth.utils';

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

interface RefreshBody {
  refreshToken?: string;
}

interface GoogleBody {
  email?: string;
  username?: string;
}

interface RawUserDoc {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  avatar?: string;
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

    const createdUser = await User.create({
      username: normalizedUsername,
      email: normalizedEmail,
      avatar: '',
    });

    const passwordHash = await hashPassword(password);
    const rawCreatedUser = await User.collection.findOne({ _id: createdUser._id });

    if (!rawCreatedUser) {
      return res.status(500).json({ message: 'Failed to create user account' });
    }

    const baseUser = rawCreatedUser as RawUserDoc;
    const accessToken = signAccessToken(buildTokenPayload(baseUser));
    const refreshToken = signRefreshToken(buildTokenPayload(baseUser));

    await User.collection.updateOne(
      { _id: createdUser._id },
      { $set: { passwordHash, refreshToken } }
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const rawUser = (await User.collection.findOne({ email: normalizedEmail })) as RawUserDoc | null;

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
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({ message: 'email and username are required for Google placeholder auth' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    if (!normalizedEmail || !normalizedUsername) {
      return res.status(400).json({ message: 'email and username must not be empty' });
    }

    let rawUser = (await User.collection.findOne({ email: normalizedEmail })) as RawUserDoc | null;

    if (!rawUser) {
      const created = await User.create({
        email: normalizedEmail,
        username: normalizedUsername,
        avatar: '',
      });
      rawUser = (await User.collection.findOne({ _id: created._id })) as RawUserDoc | null;
    }

    if (!rawUser) {
      return res.status(500).json({ message: 'Failed to complete Google placeholder auth' });
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
      note: 'Google endpoint is currently a placeholder and does not verify Google ID tokens.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to complete Google placeholder auth' });
  }
};
