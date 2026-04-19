import { Request, Response, NextFunction } from 'express';
import { createPost, getPosts, updatePost, deletePost, toggleLike } from './posts.controller';
import Post from './posts.model';
import fs from 'fs';

jest.mock('./posts.model');
jest.mock('fs');

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

const mockNext: NextFunction = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createPost', () => {
  test('returns 201 with the created post on valid input', async () => {
    const postData = {
      _id: 'post123',
      description: 'Test meal',
      calories: 500,
      imageUrl: '/uploads/1234-image.jpg',
      author: 'user123',
    };
    (Post.create as jest.Mock).mockResolvedValue(postData);

    const req = {
      body: { description: 'Test meal', calories: '500' },
      file: { filename: '1234-image.jpg' },
      user: { id: 'user123' },
    } as any;
    const res = mockResponse();

    await createPost(req, res, mockNext);

    expect(Post.create).toHaveBeenCalledWith({
      description: 'Test meal',
      calories: 500,
      imageUrl: '/uploads/1234-image.jpg',
      author: 'user123',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(postData);
  });

  test('returns 400 when no image file is attached', async () => {
    const req = {
      body: { description: 'Test meal', calories: '500' },
      file: undefined,
      user: { id: 'user123' },
    } as any;
    const res = mockResponse();

    await createPost(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Image is required' });
  });

  test('casts calories from string to number', async () => {
    (Post.create as jest.Mock).mockResolvedValue({});

    const req = {
      body: { description: 'Test', calories: '750' },
      file: { filename: 'img.jpg' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await createPost(req, res, mockNext);

    expect(Post.create).toHaveBeenCalledWith(
      expect.objectContaining({ calories: 750 })
    );
  });

  test('calls next(error) on database failure', async () => {
    const dbError = new Error('DB error');
    (Post.create as jest.Mock).mockRejectedValue(dbError);

    const req = {
      body: { description: 'Test', calories: '500' },
      file: { filename: 'img.jpg' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await createPost(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});

describe('getPosts', () => {
  const createMockQuery = () => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockResolvedValue([]),
  });

  test('returns paginated posts sorted by createdAt desc', async () => {
    const mockQuery = createMockQuery();
    (Post.find as jest.Mock).mockReturnValue(mockQuery);

    const req = { query: { page: '2', limit: '5' } } as any;
    const res = mockResponse();

    await getPosts(req, res, mockNext);

    expect(Post.find).toHaveBeenCalledWith({});
    expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(mockQuery.skip).toHaveBeenCalledWith(5);
    expect(mockQuery.limit).toHaveBeenCalledWith(5);
    expect(mockQuery.populate).toHaveBeenCalledWith('author', 'username avatar');
    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('defaults to page=1, limit=10 when no query params', async () => {
    const mockQuery = createMockQuery();
    (Post.find as jest.Mock).mockReturnValue(mockQuery);

    const req = { query: {} } as any;
    const res = mockResponse();

    await getPosts(req, res, mockNext);

    expect(mockQuery.skip).toHaveBeenCalledWith(0);
    expect(mockQuery.limit).toHaveBeenCalledWith(10);
  });

  test('filters by author when query param is provided', async () => {
    const mockQuery = createMockQuery();
    (Post.find as jest.Mock).mockReturnValue(mockQuery);

    const req = { query: { author: 'user123' } } as any;
    const res = mockResponse();

    await getPosts(req, res, mockNext);

    expect(Post.find).toHaveBeenCalledWith({ author: 'user123' });
  });

  test('calls next(error) on database failure', async () => {
    const dbError = new Error('DB error');
    (Post.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockRejectedValue(dbError),
    });

    const req = { query: {} } as any;
    const res = mockResponse();

    await getPosts(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});

describe('updatePost', () => {
  test('returns 200 with updated post on valid input', async () => {
    const mockPost = {
      _id: 'post1',
      author: { toString: () => 'user1' },
      description: 'Old desc',
      calories: 300,
      imageUrl: '/uploads/old.jpg',
      save: jest.fn().mockResolvedValue({
        _id: 'post1',
        description: 'New desc',
        calories: 400,
        imageUrl: '/uploads/old.jpg',
      }),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      body: { description: 'New desc', calories: '400' },
      user: { id: 'user1' },
      file: undefined,
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(mockPost.description).toBe('New desc');
    expect(mockPost.calories).toBe(400);
    expect(mockPost.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test('returns 404 when post does not exist', async () => {
    (Post.findById as jest.Mock).mockResolvedValue(null);

    const req = {
      params: { id: 'nonexistent' },
      body: {},
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  test('returns 403 when user is not the post author', async () => {
    const mockPost = {
      _id: 'post1',
      author: { toString: () => 'other-user' },
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      body: { description: 'Hack' },
      user: { id: 'attacker' },
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to update this post' });
  });

  test('allows partial update (description only)', async () => {
    const mockPost = {
      author: { toString: () => 'user1' },
      description: 'Old',
      calories: 300,
      imageUrl: '/uploads/img.jpg',
      save: jest.fn().mockResolvedValue({}),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      body: { description: 'Updated' },
      user: { id: 'user1' },
      file: undefined,
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(mockPost.description).toBe('Updated');
    expect(mockPost.calories).toBe(300); // unchanged
  });

  test('replaces image file when new file is uploaded', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

    const mockPost = {
      author: { toString: () => 'user1' },
      description: 'Meal',
      calories: 300,
      imageUrl: '/uploads/old.jpg',
      save: jest.fn().mockResolvedValue({}),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      body: {},
      user: { id: 'user1' },
      file: { filename: 'new.jpg' },
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(mockPost.imageUrl).toBe('/uploads/new.jpg');
  });

  test('calls next(error) on database failure', async () => {
    const dbError = new Error('DB error');
    (Post.findById as jest.Mock).mockRejectedValue(dbError);

    const req = {
      params: { id: 'post1' },
      body: {},
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await updatePost(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});

describe('deletePost', () => {
  test('returns 200 on successful deletion', async () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

    const mockPost = {
      author: { toString: () => 'user1' },
      imageUrl: '/uploads/img.jpg',
      deleteOne: jest.fn().mockResolvedValue({}),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await deletePost(req, res, mockNext);

    expect(mockPost.deleteOne).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ message: 'Post deleted' });
  });

  test('returns 404 when post does not exist', async () => {
    (Post.findById as jest.Mock).mockResolvedValue(null);

    const req = {
      params: { id: 'nonexistent' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await deletePost(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('returns 403 when user is not the post author', async () => {
    const mockPost = {
      author: { toString: () => 'owner' },
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      user: { id: 'attacker' },
    } as any;
    const res = mockResponse();

    await deletePost(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized to delete this post' });
  });

  test('calls next(error) on database failure', async () => {
    const dbError = new Error('DB error');
    (Post.findById as jest.Mock).mockRejectedValue(dbError);

    const req = {
      params: { id: 'post1' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await deletePost(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});

describe('toggleLike', () => {
  test('adds user ID to likes array when not already liked', async () => {
    const mockPost = {
      likes: [] as string[],
      save: jest.fn().mockResolvedValue({}),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await toggleLike(req, res, mockNext);

    expect(mockPost.likes).toContain('user1');
    expect(res.json).toHaveBeenCalledWith({ likes: 1, isLiked: true });
  });

  test('removes user ID from likes array when already liked', async () => {
    const mockPost = {
      likes: ['user1'],
      save: jest.fn().mockResolvedValue({}),
    };
    (Post.findById as jest.Mock).mockResolvedValue(mockPost);

    const req = {
      params: { id: 'post1' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await toggleLike(req, res, mockNext);

    expect(mockPost.likes).not.toContain('user1');
    expect(res.json).toHaveBeenCalledWith({ likes: 0, isLiked: false });
  });

  test('returns 404 when post does not exist', async () => {
    (Post.findById as jest.Mock).mockResolvedValue(null);

    const req = {
      params: { id: 'nonexistent' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await toggleLike(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Post not found' });
  });

  test('calls next(error) on database failure', async () => {
    const dbError = new Error('DB error');
    (Post.findById as jest.Mock).mockRejectedValue(dbError);

    const req = {
      params: { id: 'post1' },
      user: { id: 'user1' },
    } as any;
    const res = mockResponse();

    await toggleLike(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});
