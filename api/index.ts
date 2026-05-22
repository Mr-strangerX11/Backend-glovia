import type { Request, Response } from 'express';
import { createApp } from '../src/main';

export const config = {
  api: {
    bodyParser: false,
  },
};

let cachedServer: ((req: Request, res: Response) => unknown) | null = null;

async function getServer() {
  if (!cachedServer) {
    const app = await createApp();
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }

  return cachedServer;
}

export default async function handler(req: Request, res: Response) {
  const server = await getServer();
  return server(req, res);
}