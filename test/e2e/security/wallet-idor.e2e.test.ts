import request = require('supertest');
import { createTestApp } from '../helpers/test-app';

describe('Security - Wallet IDOR & Fund Tampering', () => {
  const API_BASE = '/api/v1';

  it('rejects unauthenticated wallet read', async () => {
    const { app } = await createTestApp();
    const server = app.getHttpServer();

    const res = await request(server).get(
      `${API_BASE}/wallet/000000000000000000000001`,
    );

    expect([401, 403, 404]).toContain(res.status);
    await app.close();
  });

  it('rejects unauthenticated wallet add', async () => {
    const { app } = await createTestApp();
    const server = app.getHttpServer();

    const res = await request(server)
      .post(`${API_BASE}/wallet/add`)
      .send({ userId: '000000000000000000000001', amount: 10 });

    expect([401, 403, 404]).toContain(res.status);
    await app.close();
  });
});

