import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../app';
import { clearTestDB, connectTestDB, disconnectTestDB } from '../../test/testDb';

const registerAndLogin = async (email: string, username: string, password: string) => {
  await request(app).post('/api/auth/register').send({ email, username, password });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  return loginRes.body.accessToken as string;
};

const createTestPost = async (token: string) => {
  const res = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .field('description', 'Post for comments')
    .field('calories', '100')
    .attach('image', Buffer.from('fake-image'), 'meal.jpg');
  expect(res.status).toBe(201);
  return res.body._id as string;
};

describe('Comments Routes', () => {
  beforeAll(async () => {
    process.env.JWT_ACCESS_SECRET = 'test_access_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    await connectTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  test('POST /api/comments returns 201 for authenticated valid comment', async () => {
    const token = await registerAndLogin('comment@test.com', 'commentuser', '123456');
    const postId = await createTestPost(token);

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId,
        text: 'Hello world',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('postId', postId);
    expect(res.body).toHaveProperty('text', 'Hello world');

    const postCheck = await request(app).get(`/api/posts/${postId}`);
    expect(postCheck.status).toBe(200);
    expect(postCheck.body.commentsCount).toBe(1);
  });

  test('POST /api/comments returns 401 when token is missing', async () => {
    const postId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post('/api/comments').send({
      postId,
      text: 'Hello world',
    });

    expect(res.status).toBe(401);
  });

  test('POST /api/comments returns 400 for invalid postId', async () => {
    const token = await registerAndLogin('badpost@test.com', 'badpostuser', '123456');

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId: 'invalid-post-id',
        text: 'Hello world',
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/comments returns 404 when post does not exist', async () => {
    const token = await registerAndLogin('nopost@test.com', 'nopostuser', '123456');
    const postId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, text: 'Hello' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ message: 'Post not found' });
  });

  test('POST /api/comments returns 400 for empty text', async () => {
    const token = await registerAndLogin('emptytext@test.com', 'emptytextuser', '123456');
    const postId = await createTestPost(token);

    const res = await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId,
        text: '   ',
      });

    expect(res.status).toBe(400);
  });

  test('GET /api/comments/post/:postId returns comments sorted newest first', async () => {
    const token = await registerAndLogin('sort@test.com', 'sortuser', '123456');
    const postId = await createTestPost(token);

    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, text: 'Older comment' });

    await new Promise((resolve) => setTimeout(resolve, 5));

    await request(app)
      .post('/api/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({ postId, text: 'Newer comment' });

    const res = await request(app).get(`/api/comments/post/${postId}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].text).toBe('Newer comment');
    expect(res.body[1].text).toBe('Older comment');
  });

  test('GET /api/comments/post/:postId returns 400 for invalid postId', async () => {
    const res = await request(app).get('/api/comments/post/not-a-valid-id');
    expect(res.status).toBe(400);
  });
});
