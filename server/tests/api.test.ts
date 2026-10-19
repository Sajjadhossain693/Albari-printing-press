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

  it('PUT /api/products/:id updates product base price', async () => {
    // Login to get token
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.body.token;

    // Get a product
    const prodRes = await request(app).get('/api/products');
    const firstProduct = prodRes.body.products[0];

    // Update base price
    const updateRes = await request(app)
      .put(`/api/products/${firstProduct.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        basePrice: 550,
        unitBn: 'পিস'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.product.basePrice).toBe(550);
  });

  it('PATCH /api/orders/:id/payment-status updates payment status and records payment if due', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'admin',
      password: 'admin123'
    });
    const token = loginRes.body.token;

    // Get orders
    const ordersRes = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    const order = ordersRes.body.orders.find((o: any) => o.amountDue > 0) || ordersRes.body.orders[0];

    const patchRes = await request(app)
      .patch(`/api/orders/${order.id}/payment-status`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        paymentStatus: 'PAID',
        method: 'CASH'
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.order.paymentStatus).toBe('PAID');
    expect(patchRes.body.order.amountDue).toBe(0);
  });
});
