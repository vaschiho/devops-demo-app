const request = require('supertest');
const app     = require('../src/app');

// ─────────────────────────────────────────────────────────────────────────────
//  DevOps Demo API — Test Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /', () => {
  it('should return welcome message with version and environment', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Welcome to DevOps Demo API');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('environment');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('should return uptime and timestamp', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  it('should return list of users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return correct user count', async () => {
    const res = await request(app).get('/api/users');
    expect(res.body.count).toBe(res.body.data.length);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  it('should return a single user by ID', async () => {
    const res = await request(app).get('/api/users/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBe('Alice Johnson');
  });

  it('should return 404 for non-existent user', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User not found');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/users', () => {
  it('should create a new user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Dave Brown', role: 'tester' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Dave Brown');
    expect(res.body.data.role).toBe('tester');
    expect(res.body.data.active).toBe(true);
  });

  it('should return 400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ role: 'tester' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when role is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Dave Brown' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('should return list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return products with required fields', async () => {
    const res = await request(app).get('/api/products');
    res.body.data.forEach((product) => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('stock');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });
});
