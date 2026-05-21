import request = require('supertest');
import { createTestApp } from '../helpers/test-app';

describe('Security - Admin @Public bypass checks', () => {
  const API_BASE = '/api/v1';

  it('should not allow admin init without JWT', async () => {
    const { app } = await createTestApp();
    const server = app.getHttpServer();

    const res = await request(server).post(`${API_BASE}/admin/init`).send({});

    expect([401, 403, 404]).toContain(res.status);

    await app.close();
  });
});

