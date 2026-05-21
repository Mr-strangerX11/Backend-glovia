import request = require('supertest');
import { createTestApp } from '../helpers/test-app';

describe('Security - Payments verify auth requirement', () => {
  const API_BASE = '/api/v1';

  it('should reject esewa verify without JWT', async () => {
    const { app } = await createTestApp();
    const server = app.getHttpServer();

    const res = await request(server)
      .post(`${API_BASE}/payments/esewa/verify`)
      .send({ oid: 'OID', amt: '100', refId: 'RID' });

    expect([401, 403, 404]).toContain(res.status);

    await app.close();
  });
});

