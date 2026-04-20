import request from 'supertest';
import app from './app';

// Mock the posts controller
jest.mock('./modules/posts/posts.controller', () => ({
  createPost: (req: any, res: any) => res.status(201).json({ id: '123' }),
  getPosts: (req: any, res: any) => res.status(200).json([]),
  updatePost: (req: any, res: any) => res.status(200).json({ id: req.params.id }),
  deletePost: (req: any, res: any) => res.status(200).json({ message: 'Post deleted' }),
  toggleLike: (req: any, res: any) => res.status(200).json({ likes: 1, isLiked: true }),
}));

// Mock the auth middleware
jest.mock('./middleware/auth.middleware', () => ({
  protect: (req: any, res: any, next: any) => {
    req.user = { id: 'user123' };
    next();
  },
}));

describe('App Integration', () => {
  test('/health endpoint should be defined', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('/api/posts GET route should be defined', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('/api/posts POST route should be defined', async () => {
    const res = await request(app)
      .post('/api/posts')
      .field('description', 'test')
      .field('calories', '100')
      .attach('image', Buffer.from('fake'), 'test.jpg');
    expect(res.status).toBe(201);
  });

  test('/api/posts/:id PUT route should be defined', async () => {
    const res = await request(app)
      .put('/api/posts/abc123')
      .field('description', 'updated');
    expect(res.status).toBe(200);
  });

  test('/api/posts/:id DELETE route should be defined', async () => {
    const res = await request(app).delete('/api/posts/abc123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Post deleted' });
  });

  test('/api/posts/:id/like POST route should be defined', async () => {
    const res = await request(app).post('/api/posts/abc123/like');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ likes: 1, isLiked: true });
  });

  test('/uploads serves static files', async () => {
    const res = await request(app).get('/uploads/nonexistent.jpg');
    // Static middleware returns 404 for missing files, not 500
    expect([200, 304, 404]).toContain(res.status);
  });
});
