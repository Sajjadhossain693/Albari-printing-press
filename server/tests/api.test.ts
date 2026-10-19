import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Server API Endpoints', () => {
  it('GET /health returns online status and app name', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.app).toContain('Al-Bari Press');
  });

  it('GET /api/categories returns product categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.length).toBeGreaterThan(0);
  });

  it('GET /api/products returns products list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login succeeds with valid admin credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123'
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('OWNER');
  });

  it('GET /api/orders/track finds order with valid tracking token', async () => {
    const res = await request(app).get('/api/orders/track?token=track-pz-202601');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.tracking.orderNumber).toBe('PR-2026-0001');
    expect(res.body.tracking.productionStatus).toBe('IN_PRODUCTION');
  });
});
