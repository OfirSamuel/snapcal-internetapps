import { Request, Response } from 'express';
import Post from './posts.model';

export const createPost = async (req: any, res: Response) => {
  const { description, calories } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Image is required' });

  const post = await Post.create({
    description,
    calories,
    imageUrl: `/uploads/${req.file.filename}`,
    author: req.user.id
  });

  res.status(201).json(post);
};

export const getPosts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'username avatar');

  res.json(posts);
};
