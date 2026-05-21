import * as request from 'supertest';

export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN';

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

export async function login(baseUrl: string, email: string, password: string): Promise<AuthTokens & { accessToken: string }> {
  const res = await request(baseUrl)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (!res.body?.access_token && !res.body?.accessToken) {
    throw new Error(`Login failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const accessToken = res.body.access_token || res.body.accessToken;
  return { accessToken, refreshToken: res.body.refresh_token || res.body.refreshToken };
}

export function authHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

