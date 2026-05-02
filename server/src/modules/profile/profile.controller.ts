import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import User from '../users/users.model';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
  };
  body: {
    username?: string;
    avatarUrl?: string;
  };
  file?: Express.Multer.File;
}

const isValidAvatarUrl = (value: string): boolean => {
  try {
    // Accept full http(s) URLs only for profile avatar link.
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const getMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-passwordHash -refreshToken -__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
};

export const updateMyProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { username, avatarUrl } = req.body;

    if (username === undefined && avatarUrl === undefined && !req.file) {
      return res.status(400).json({ message: 'At least one field is required: username, avatarUrl, or avatar file' });
    }

    const updates: { username?: string; avatarUrl?: string } = {};

    if (username !== undefined) {
      const normalizedUsername = username.trim();
      if (!normalizedUsername) {
        return res.status(400).json({ message: 'username must not be empty' });
      }
      updates.username = normalizedUsername;
    }

    if (req.file) {
      // Delete old avatar file if it was a local upload
      const existingUser = await User.findById(userId).select('avatarUrl');
      if (existingUser?.avatarUrl?.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), existingUser.avatarUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.avatarUrl = `/uploads/${req.file.filename}`;
    } else if (avatarUrl !== undefined) {
      const normalizedAvatarUrl = avatarUrl.trim();
      if (normalizedAvatarUrl && !isValidAvatarUrl(normalizedAvatarUrl)) {
        return res.status(400).json({ message: 'avatarUrl must be a valid http(s) URL' });
      }
      updates.avatarUrl = normalizedAvatarUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -refreshToken -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      return res.status(409).json({ message: 'username is already in use' });
    }

    return next(error);
  }
};
