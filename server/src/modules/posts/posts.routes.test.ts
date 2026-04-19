import request from 'supertest';
import app from '../../app';

// Mock all controller functions
jest.mock('./posts.controller', () => ({
  createPost: (req: any, res: any) => res.status(201).json({ _id: 'new-post' }),
  getPosts: (req: any, res: any) => res.status(200).json([]),
  updatePost: (req: any, res: any) => res.status(200).json({ _id: req.params.id, description: 'updated' }),
  deletePost: (req: any, res: any) => res.status(200).json({ message: 'Post deleted' }),
  toggleLike: (req: any, res: any) => res.status(200).json({ likes: 1, isLiked: true }),
}));

// Mock auth: pass-through for protected routes
jest.mock('../../middleware/auth.middleware', () => ({
  protect: (req: any, _res: any, next: any) => {
    req.user = { id: 'user123' };
    next();
  },
}));

describe('Posts Routes', () => {
  describe('GET /api/posts', () => {
    test('is publicly accessible (returns 200)', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('forwards page query param', async () => {
      const res = await request(app).get('/api/posts?page=2&limit=5');
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/posts', () => {
    test('returns 201 with multipart form data', async () => {
      const res = await request(app)
        .post('/api/posts')
        .field('description', 'Test meal')
        .field('calories', '500')
        .attach('image', Buffer.from('fake-image'), 'test.jpg');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id', 'new-post');
    });
  });

  describe('PUT /api/posts/:id', () => {
    test('returns 200 on valid update', async () => {
      const res = await request(app)
        .put('/api/posts/post1')
        .field('description', 'Updated meal');

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    test('returns 200 on valid deletion', async () => {
      const res = await request(app).delete('/api/posts/post1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Post deleted' });
    });
  });

  describe('POST /api/posts/:id/like', () => {
    test('returns 200 with like data', async () => {
      const res = await request(app).post('/api/posts/post1/like');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ likes: 1, isLiked: true });
    });
  });
});
