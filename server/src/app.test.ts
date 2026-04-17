import request from 'supertest';
import app from './app';

// Mock the posts controller
jest.mock('./modules/posts/posts.controller', () => ({
  createPost: (req: any, res: any) => res.status(201).json({ id: '123' }),
  getPosts: (req: any, res: any) => res.status(200).json([]),
}));

// Mock the AI controller
jest.mock('./modules/ai/ai.controller', () => ({
  analyze: (req: any, res: any) => res.status(200).json({ calories: 100, confidence: 'high' }),
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

  test('/api/posts routes should be defined in the app', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('/api/ai/analyze route should be defined in the app', async () => {
    const res = await request(app)
      .post('/api/ai/analyze')
      .send({ description: 'test' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('calories', 100);
  });
});
