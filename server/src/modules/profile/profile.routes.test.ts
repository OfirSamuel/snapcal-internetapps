import request from 'supertest';
import app from '../../app';
import User from '../users/users.model';
import { clearTestDB, connectTestDB, disconnectTestDB } from '../../test/testDb';

jest.setTimeout(15000);

const registerAndLogin = async (email: string, username: string, password: string) => {
  await request(app).post('/api/auth/register').send({ email, username, password });
  const loginRes = await request(app).post('/api/auth/login').send({ email, password });
  return loginRes.body.accessToken as string;
};

describe('Profile Routes', () => {
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

  test('GET /api/profile/me returns current user for valid token', async () => {
    const token = await registerAndLogin('profile@test.com', 'profileuser', '123456');

    const res = await request(app)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('email', 'profile@test.com');
    expect(res.body.user).toHaveProperty('username', 'profileuser');
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('refreshToken');
  });

  test('GET /api/profile/me returns 401 when token is missing', async () => {
    const res = await request(app).get('/api/profile/me');
    expect(res.status).toBe(401);
  });

  test('PUT /api/profile/me updates username and avatarUrl', async () => {
    const token = await registerAndLogin('update@test.com', 'beforeupdate', '123456');

    const res = await request(app)
      .put('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'afterupdate',
        avatarUrl: 'https://example.com/avatar.png',
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('username', 'afterupdate');
    expect(res.body.user).toHaveProperty('avatarUrl', 'https://example.com/avatar.png');
  });

  test('PUT /api/profile/me returns 400 for invalid avatarUrl', async () => {
    const token = await registerAndLogin('avatar@test.com', 'avataruser', '123456');

    const res = await request(app)
      .put('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatarUrl: 'not-a-url' });

    expect(res.status).toBe(400);
  });

  test('PUT /api/profile/me returns 400 when body has no updatable fields', async () => {
    const token = await registerAndLogin('empty@test.com', 'emptyuser', '123456');

    const res = await request(app)
      .put('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test('PUT /api/profile/me returns 409 when username already exists', async () => {
    const token = await registerAndLogin('first@test.com', 'firstuser', '123456');
    await registerAndLogin('second@test.com', 'seconduser', '123456');

    const res = await request(app)
      .put('/api/profile/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'seconduser' });

    expect(res.status).toBe(409);
  });

  test('GET /api/profile/me returns 404 when token user no longer exists', async () => {
    const token = await registerAndLogin('delete@test.com', 'deleteuser', '123456');
    await User.deleteOne({ email: 'delete@test.com' });

    const res = await request(app)
      .get('/api/profile/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
