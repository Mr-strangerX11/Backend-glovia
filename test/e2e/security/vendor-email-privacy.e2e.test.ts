// Vendor email privacy e2e test
// Goal: vendor emails must NOT include customer delivery address details.

// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as request from 'supertest';
import { createTestApp } from '../helpers/test-app';
import { authHeader } from '../helpers/auth';
import { seedVendorEmailPrivacyFixtures } from '../helpers/seed-vendor-email-privacy-fixtures';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../../src/database/schemas/user.schema';



const API_BASE = '/api/v1';

describe('Vendor email privacy - order creation', () => {
  it('does not leak customer delivery address to vendor emails', async () => {
    process.env.EMAIL_PROVIDER = 'mock';

    const { app } = await createTestApp();
    const server = app.getHttpServer();

    const seed: any = await seedVendorEmailPrivacyFixtures(app);

    // Resolve models via Nest Mongoose injection tokens
    const userModel = app.get<Model<any>>(getModelToken('User'));
    const vendor = await userModel.findById(seed.vendorId).lean();
    const customer = await userModel.findById(seed.customerId).lean();


    // Capture console output from mock email provider
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map((a) => String(a)).join(' '));
    };

    try {
      const customerLogin = await request(server)
        .post(`${API_BASE}/auth/login`)
        .send({ email: customer.email, password: 'seed-password' });

      // Customer login should succeed.
      // (Some harnesses return 200 vs 201; accept both.)
      if (![200, 201].includes(customerLogin.status)) {
        throw new Error(
          `Customer login failed: status=${customerLogin.status} body=${JSON.stringify(customerLogin.body)}`,
        );
      }




      const customerAccessToken = customerLogin.body.access_token || customerLogin.body.accessToken;
      const customerAuth = authHeader(customerAccessToken);

      const orderRes = await request(server)
        .post(`${API_BASE}/orders`)
        .set(customerAuth)
        .send({
          addressId: seed.addressId,
          items: [{ productId: seed.productId, quantity: 1 }],
          paymentMethod: 'CASH_ON_DELIVERY',
          clearCart: false,
        });

      if (![200, 201].includes(orderRes.status)) {
        throw new Error(`Order creation failed: status=${orderRes.status} body=${JSON.stringify(orderRes.body)}`);
      }

      const joined = logs.join('\n');

      // vendor email must not contain seeded address fields
      const province = 'Bagmati';
      const district = 'Kathmandu';
      const municipality = 'Kathmandu Metropolitan';
      const area = 'Thamel';
      const landmark = 'Near Gate';
      const wardNo = '9';

      expect(joined).not.toContain(province);
      expect(joined).not.toContain(district);
      expect(joined).not.toContain(municipality);
      expect(joined).not.toContain(area);
      expect(joined).not.toContain(landmark);
      expect(joined).not.toContain(`Ward ${wardNo}`);
    } finally {
      console.log = originalLog;
      await app.close();
    }
  });
});

