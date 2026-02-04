# Glovia Nepal Backend - Python Services

This directory contains Python-based microservices for the Glovia Nepal backend.

## 🔐 OTP Authentication System

**Location:** `./otp-auth/`

### Quick Start

```bash
# Setup
cd otp-auth
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your MongoDB URL and SMTP credentials

# Run
python main.py
```

Server will be available at: **http://localhost:8000**

### API Endpoints

- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user

### Documentation

- Full documentation: See `otp-auth/README.md`
- Interactive API docs: http://localhost:8000/docs
- Config template: `otp-auth/.env.example`

### Environment Variables

```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=otp_auth
JWT_SECRET_KEY=your-secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000
```

### Features

✅ Email OTP authentication  
✅ JWT token generation  
✅ Rate limiting (5 req/min)  
✅ MongoDB integration  
✅ Security (bcrypt hashing, attempt limiting)  
✅ CORS configured  
✅ Swagger/OpenAPI docs  

### Troubleshooting

**MongoDB connection failed:**
- Ensure MongoDB is running: `mongod`
- Or use MongoDB Atlas in MONGODB_URL

**Email not sending:**
- Use Gmail App Password (not regular password)
- Verify SMTP credentials in .env
- Check port 587 is accessible

**Python dependencies error:**
- Ensure Python 3.8+ is installed
- Use virtual environment (venv)
- Run: `pip install --upgrade pip setuptools`

---

## Integration with NestJS

The OTP service runs independently but can be integrated with the NestJS backend:

```typescript
// In NestJS controller
@Post('verify-email-otp')
async verifyEmailOTP(@Body() dto: VerifyOTPDto) {
  // Call OTP service at http://localhost:8000/api/auth/verify-otp
  const result = await this.httpService
    .post('http://localhost:8000/api/auth/verify-otp', dto)
    .toPromise();
  
  return result.data;
}
```

---

**Created:** February 2, 2026  
**Status:** Ready for deployment
