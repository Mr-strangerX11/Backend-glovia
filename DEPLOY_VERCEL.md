# Deploy Backend to Vercel

This project is configured to run as a serverless API on Vercel.

## Quick deploy

1. **Push code to GitHub**  
   Use the repo: `Mr-strangerX11/glovia-Backend` (or your own).

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
   - Import the **glovia-Backend** (or your backend) repository
   - **Root Directory:** leave as repo root (backend folder if it’s the only thing in the repo)
   - **Framework Preset:** Other
   - **Build Command:** `prisma generate && npm run build` (or leave blank; it’s in `vercel.json`)
   - **Output Directory:** leave default
   - **Install Command:** `npm install`

3. **Environment variables**  
   In the project’s **Settings → Environment Variables**, add the variables from `vercel.env.example` (use **Production** and optionally **Preview**).  
   At minimum for a basic run:
   - `DATABASE_URL` – MongoDB connection string
   - `JWT_SECRET` – strong random string
   - `JWT_REFRESH_SECRET` – strong random string
   - `FRONTEND_URL` – `https://glovia.com.np,https://www.glovia.com.np`

4. **Deploy**  
   Click **Deploy**. Vercel will run the build and deploy the serverless function.

## After deploy

- **API base URL:** `https://<your-project>.vercel.app/api/v1`  
  Example: `https://glovia-backend.vercel.app/api/v1`
- **Health check:** `GET https://<your-project>.vercel.app/api/v1` (or any existing route)

## Config summary

| Item            | Value                                      |
|-----------------|--------------------------------------------|
| Entry           | `api/index.js` (Node serverless function)  |
| Build           | `prisma generate && npm run build`         |
| Routes          | All requests → `api/index.js`              |
| API prefix      | `/api/v1` (set via `API_PREFIX` env var)   |
| Function limits | 60s max duration, 1024 MB memory           |

## Optional: custom domain

In Vercel: **Project → Settings → Domains** → add your domain (e.g. `api.glovia.com.np`) and follow the DNS instructions.

## Troubleshooting

- **500 / “Cannot find module”**  
  Ensure all dependencies are in `dependencies` in `package.json` (not only in dev) and that the build completes without errors.

- **CORS errors from frontend**  
  Set `FRONTEND_URL` to your frontend origin(s), comma-separated, e.g.  
  `https://glovia.com.np,https://www.glovia.com.np`.

- **Database errors**  
  Check `DATABASE_URL` in Vercel and that the database (e.g. MongoDB Atlas) allows connections from the internet (or Vercel IPs if you restrict).

- **Build fails**  
  Check the build log. Common fixes: run `npm run build` and `prisma generate` locally; ensure `nest-cli.json` has `"webpack": false` so `dist/app.module.js` is emitted for `api/index.js`.
