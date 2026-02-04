from fastapi import FastAPI, HTTPException, status, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime, timedelta
from config import settings
from database import connect_to_mongo, close_mongo_connection, get_database
from models import (
    EmailRequest,
    OTPVerifyRequest,
    OTPResponse,
    TokenResponse,
    UserResponse
)
from utils import (
    generate_otp,
    hash_otp,
    verify_otp,
    send_otp_email,
    get_otp_expiry,
    calculate_resend_cooldown
)
from auth import create_access_token, get_current_user

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="OTP Authentication API",
    description="Secure email OTP authentication with JWT",
    version="1.0.0"
)

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongo_connection()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "OTP Authentication API",
        "version": "1.0.0"
    }


@app.post("/api/auth/send-otp", response_model=OTPResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def send_otp(request: Request, email_request: EmailRequest):
    """
    Send OTP to email address
    - Rate limited to prevent abuse
    - Implements resend cooldown
    - Hashes OTP before storing
    """
    db = get_database()
    email = email_request.email
    
    # Check for existing OTP with cooldown
    existing_otp = await db.otps.find_one({"email": email})
    
    if existing_otp and existing_otp.get("last_resend_at"):
        cooldown_remaining = calculate_resend_cooldown(existing_otp["last_resend_at"])
        if cooldown_remaining > 0:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {cooldown_remaining} seconds before requesting a new OTP"
            )
    
    # Generate and hash OTP
    otp = generate_otp()
    otp_hash = hash_otp(otp)
    
    # Send OTP via email
    email_sent = await send_otp_email(email, otp)
    
    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP email. Please try again."
        )
    
    # Store hashed OTP in database
    expires_at = get_otp_expiry()
    otp_data = {
        "email": email,
        "otp_hash": otp_hash,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at,
        "attempts": 0,
        "last_resend_at": datetime.utcnow()
    }
    
    # Upsert OTP record
    await db.otps.update_one(
        {"email": email},
        {"$set": otp_data},
        upsert=True
    )
    
    # Ensure user record exists
    await db.users.update_one(
        {"email": email},
        {
            "$setOnInsert": {
                "email": email,
                "verified": False,
                "created_at": datetime.utcnow()
            },
            "$set": {"updated_at": datetime.utcnow()}
        },
        upsert=True
    )
    
    expires_in = int((expires_at - datetime.utcnow()).total_seconds())
    
    return OTPResponse(
        message="OTP sent successfully to your email",
        email=email,
        expires_in_seconds=expires_in,
        resend_available_in=settings.otp_resend_cooldown_seconds
    )


@app.post("/api/auth/verify-otp", response_model=TokenResponse)
@limiter.limit(f"{settings.rate_limit_per_minute}/minute")
async def verify_otp_endpoint(request: Request, verify_request: OTPVerifyRequest):
    """
    Verify OTP and return JWT token
    - Validates OTP against hashed value
    - Checks expiration
    - Limits verification attempts
    - Generates JWT on success
    """
    db = get_database()
    email = verify_request.email
    otp = verify_request.otp
    
    # Get OTP record
    otp_record = await db.otps.find_one({"email": email})
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No OTP found for this email. Please request a new one."
        )
    
    # Check expiration
    if datetime.utcnow() > otp_record["expires_at"]:
        await db.otps.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one."
        )
    
    # Check attempt limit (max 5 attempts)
    if otp_record.get("attempts", 0) >= 5:
        await db.otps.delete_one({"email": email})
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed attempts. Please request a new OTP."
        )
    
    # Verify OTP
    is_valid = verify_otp(otp, otp_record["otp_hash"])
    
    if not is_valid:
        # Increment attempts
        await db.otps.update_one(
            {"email": email},
            {"$inc": {"attempts": 1}}
        )
        
        attempts_left = 5 - (otp_record.get("attempts", 0) + 1)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. {attempts_left} attempts remaining."
        )
    
    # OTP verified successfully - update user
    await db.users.update_one(
        {"email": email},
        {
            "$set": {
                "verified": True,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Delete used OTP
    await db.otps.delete_one({"email": email})
    
    # Get updated user
    user = await db.users.find_one({"email": email})
    
    # Generate JWT token
    access_token = create_access_token(
        data={"sub": email, "verified": True}
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": str(user["_id"]),
            "email": user["email"],
            "verified": user["verified"],
            "created_at": user["created_at"].isoformat()
        }
    )


@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    Get current authenticated user information
    - Requires valid JWT token
    - Protected route example
    """
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        verified=current_user["verified"],
        created_at=current_user["created_at"]
    )


@app.post("/api/auth/logout")
async def logout(current_user = Depends(get_current_user)):
    """
    Logout user
    - Client should delete JWT token
    """
    return {
        "message": "Logged out successfully",
        "email": current_user["email"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
