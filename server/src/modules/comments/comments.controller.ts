import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Comment from './comments.model';

interface CreateCommentBody {
  postId?: string;
  text?: string;
}

interface AuthenticatedRequest extends Request<unknown, unknown, CreateCommentBody> {
  user?: {
    id: string;
    email: string;
  };
}

export const createComment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { postId, text } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Valid postId is required' });
    }

    const normalizedText = text?.trim();
    if (!normalizedText) {
      return res.status(400).json({ message: 'text is required' });
    }

    const comment = await Comment.create({
      postId: new mongoose.Types.ObjectId(postId),
      author: new mongoose.Types.ObjectId(authorId),
      text: normalizedText,
    });

    const populatedComment = await Comment.findById(comment._id).populate('author', 'username avatar avatarUrl');

    return res.status(201).json(populatedComment ?? comment);
  } catch (error) {
    return next(error);
  }
};

export const getCommentsByPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Valid postId is required' });
    }

    const comments = await Comment.find({ postId: new mongoose.Types.ObjectId(postId) })
      .sort({ createdAt: -1 })
      .populate('author', 'username avatar avatarUrl');

    return res.status(200).json(comments);
  } catch (error) {
    return next(error);
  }
};
