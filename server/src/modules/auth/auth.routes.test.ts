import request from 'supertest';
import app from '../../app';
import { clearTestDB, connectTestDB, disconnectTestDB } from '../../test/testDb';

describe('Auth Routes', () => {
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

  test('POST /api/auth/register returns 201 for valid payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      username: 'testuser',
      password: '123456',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject({
      email: 'test@test.com',
      username: 'testuser',
    });
  });

  test('POST /api/auth/register returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('POST /api/auth/register returns 409 for duplicate user', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      username: 'testuser',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'test@test.com',
      username: 'testuser2',
      password: '123456',
    });

    expect(res.status).toBe(409);
  });

  test('POST /api/auth/login returns 200 for valid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login@test.com',
      username: 'loginuser',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  test('POST /api/auth/login returns 401 for invalid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'login@test.com',
      username: 'loginuser',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login returns 200 when logging in with username', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'usernamelogin@test.com',
      username: 'usernameloginuser',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/login').send({
      username: 'usernameloginuser',
      password: '123456',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.username).toBe('usernameloginuser');
  });

  test('POST /api/auth/refresh returns new tokens for valid refresh token', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'refresh@test.com',
      username: 'refreshuser',
      password: '123456',
    });

    const res = await request(app).post('/api/auth/refresh').send({
      refreshToken: registerRes.body.refreshToken,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  test('POST /api/auth/refresh returns 400 when refresh token is missing', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/google returns 200 in placeholder mode', async () => {
    const res = await request(app).post('/api/auth/google').send({
      email: 'google@test.com',
      username: 'googleuser',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('note');
  });

  test('POST /api/auth/google returns 400 for missing fields', async () => {
    const res = await request(app).post('/api/auth/google').send({
      email: 'google@test.com',
    });

    expect(res.status).toBe(400);
  });
});
