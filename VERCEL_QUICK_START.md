# 🚀 Quick Vercel Deployment Checklist

## Before You Deploy

- [ ] Build succeeds locally: `npm run build` ✅ Done
- [ ] No TypeScript errors ✅ Fixed
- [ ] All routes tested locally: `npm run start:dev`
- [ ] `.env.example` is up-to-date ✅ Done

## Deployment Steps (15 minutes)

### 1. Create Vercel Account (2 min)
- [ ] Go to https://vercel.com/signup
- [ ] Sign up with GitHub
- [ ] Authorize Vercel to access repositories

### 2. Import Repository (2 min)
- [ ] Go to https://vercel.com/new
- [ ] Click "Import Git Repository"
- [ ] Select `glovia-Backend`
- [ ] Click "Import"

### 3. Add Environment Variables (5 min)

Copy these from your local `.env` and paste in Vercel Dashboard:

```
NODE_ENV=production
PORT=3001
API_PREFIX=api/v1
DATABASE_URL=postgresql://...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=...
JWT_REFRESH_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ESEWA_MERCHANT_ID=...
ESEWA_SECRET_KEY=...
KHALTI_SECRET_KEY=...
IME_MERCHANT_CODE=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@glovia.com.np
SMTP_PASSWORD=...
FRONTEND_URL=https://glovia.com.np,https://www.glovia.com.np
SMS_GATEWAY=mock
DEFAULT_ADMIN_EMAIL=admin@glovia.com.np
DEFAULT_ADMIN_PASSWORD=...
```

**Important**: Select "Production" environment (top right dropdown)

### 4. Deploy (2 min)
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (~2-3 min)
- [ ] Get your deployment URL

### 5. Verify (3 min)
- [ ] Test API: `https://your-url.vercel.app/api/v1/products`
- [ ] Check logs in Vercel Dashboard
- [ ] No errors in Functions logs

### 6. Update Frontend (1 min)
```
REACT_APP_API_URL=https://your-deployment.vercel.app/api/v1
```

## After Deployment

- [ ] Test login flow with real credentials
- [ ] Verify payment gateway integration
- [ ] Check email notifications are sending
- [ ] Monitor error logs for 24 hours

## Deployment URL Structure

You'll get a URL like:
```
https://glovia-backend-abc123.vercel.app
```

All API endpoints will be:
```
https://glovia-backend-abc123.vercel.app/api/v1/...
```

## Need Help?

- 📖 Full guide: See `VERCEL_DEPLOYMENT.md`
- 🔗 Vercel docs: https://vercel.com/docs
- ⚠️ Check logs if deployment fails

---

**Status**: ✅ Ready for Vercel Deployment
