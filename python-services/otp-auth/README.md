# OTP Authentication System - README

## Overview
Secure email-based OTP (One-Time Password) authentication system built with FastAPI, Motor (async MongoDB), and JWT tokens.

## Features
✅ **Email OTP Generation** - Secure 6-digit OTP codes  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **JWT Authentication** - Stateless token-based auth  
✅ **MongoDB Integration** - Async database operations with Motor  
✅ **Email Verification** - HTML formatted OTP emails  
✅ **Security** - OTP hashing with bcrypt, attempt limiting  
✅ **CORS Support** - Configured for frontend integration  
✅ **Resend Cooldown** - Prevent spam requests  

## Architecture

### Core Components
- **config.py** - Settings and environment configuration
- **models.py** - Request/Response dataclasses and DB models
- **database.py** - MongoDB connection management
- **auth.py** - JWT token creation and verification
- **utils.py** - OTP generation, hashing, email sending
- **main.py** - FastAPI application and endpoints

### Database Collections
- **users** - User records with verification status
- **otps** - OTP records with hashes and expiration

## Installation

```bash
# 1. Navigate to the directory
cd backend/python-services/otp-auth

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and SMTP credentials
```

## Configuration

Update `.env` file with:

```
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=otp_auth

# JWT (change secret in production!)
JWT_SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# OTP Settings
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_RESEND_COOLDOWN_SECONDS=60

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

## Running the Server

```bash
# Start development server
python main.py

# Or with Uvicorn directly
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

Server will be available at: `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
Returns: {"status": "online", "service": "OTP Authentication API", "version": "1.0.0"}
```

### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent successfully to your email",
  "email": "user@example.com",
  "expires_in_seconds": 300,
  "resend_available_in": 60
}

Rate Limit: 5 requests/minute
Cooldown: 60 seconds between requests
```

### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "verified": true,
    "created_at": "2026-02-02T10:30:00.000Z"
  }
}

Security Features:
- Max 5 failed attempts
- OTP expires after 5 minutes
- Rate limited to 5 requests/minute
- Invalid attempts tracked
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "verified": true,
  "created_at": "2026-02-02T10:30:00.000Z"
}

Requires: Valid JWT token with verified user
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully",
  "email": "user@example.com"
}

Note: Client should delete the token. Tokens still valid until expiration.
```

## Testing

### 1. Send OTP
```bash
curl -X POST http://localhost:8000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 2. Verify OTP
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### 3. Get User Info
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Interactive API Documentation
Visit `http://localhost:8000/docs` for Swagger UI documentation

## Security Considerations

✅ **Implemented:**
- OTP hashing with bcrypt
- JWT tokens with expiration
- Rate limiting per IP
- CORS validation
- Attempt limiting (5 max)
- Email validation
- HTTPS support ready

⚠️ **For Production:**
- Use HTTPS only
- Change JWT_SECRET_KEY
- Configure real SMTP credentials
- Use MongoDB Atlas or managed service
- Set secure CORS origins
- Enable MongoDB authentication
- Implement additional logging/monitoring
- Add API key authentication for admin endpoints

## Troubleshooting

### MongoDB Connection Error
```
✅ Ensure MongoDB is running:
mongod --dbpath /path/to/data

Or use MongoDB Atlas:
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Email Not Sending
```
✅ Check SMTP credentials in .env
✅ For Gmail: Use App Password (not regular password)
✅ Enable "Less secure app access" if needed
✅ Check SMTP_PORT (587 for TLS)
```

### Rate Limit Issues
```
✅ Default: 5 requests/minute
✅ Adjust RATE_LIMIT_PER_MINUTE in .env
✅ Rate limiting is per IP address
```

### Invalid OTP Error
```
✅ OTP expires after 5 minutes
✅ Max 5 failed attempts (OTP deleted after)
✅ Request new OTP if expired
✅ Wait 60 seconds between resend requests
```

## Integration with Frontend

Example React/Vue integration:

```javascript
// 1. Send OTP
const sendOTP = async (email) => {
  const response = await fetch('http://localhost:8000/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// 2. Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('http://localhost:8000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  return data;
};

// 3. Use token for authenticated requests
const getUser = async (token) => {
  const response = await fetch('http://localhost:8000/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

## License
MIT

## Support
For issues or questions, contact the development team.
