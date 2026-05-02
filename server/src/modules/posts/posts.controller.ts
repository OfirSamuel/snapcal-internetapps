import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import Post from './posts.model';

export const createPost = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { description, calories, protein, carbs, fat, mealName } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Image is required' });
    if (!calories) return res.status(400).json({ message: 'Calories is required' });

    const post = await Post.create({
      description: description || undefined,
      calories: Number(calories),
      protein: protein ? Number(protein) : undefined,
      carbs: carbs ? Number(carbs) : undefined,
      fat: fat ? Number(fat) : undefined,
      mealName: mealName || undefined,
      imageUrl: `/uploads/${req.file.filename}`,
      author: req.user.id
    });

    const populated = await post.populate('author', 'username avatar');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username avatar avatarUrl');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.author) {
      filter.author = req.query.author;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar avatarUrl');

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: any, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    if (req.body.description !== undefined) post.description = req.body.description;
    if (req.body.calories !== undefined) post.calories = Number(req.body.calories);

    if (req.file) {
      const oldPath = path.join(process.cwd(), post.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      post.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await post.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: any, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    const imagePath = path.join(process.cwd(), post.imageUrl);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: any, res: Response, next: NextFunction) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId: string = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json({ likes: post.likes.length, isLiked: post.likes.includes(userId) });
  } catch (error) {
    next(error);
  }
};
