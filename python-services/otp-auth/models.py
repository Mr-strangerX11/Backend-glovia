from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime
from bson import ObjectId
import re


# Simple email validation
def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


# Request Models
@dataclass
class EmailRequest:
    email: str
    
    def __post_init__(self):
        if not validate_email(self.email):
            raise ValueError("Invalid email format")


@dataclass
class OTPVerifyRequest:
    email: str
    otp: str
    
    def __post_init__(self):
        if not validate_email(self.email):
            raise ValueError("Invalid email format")
        if not (len(self.otp) == 6 and self.otp.isdigit()):
            raise ValueError("OTP must be 6 digits")


# Response Models
@dataclass
class OTPResponse:
    message: str
    email: str
    expires_in_seconds: int
    resend_available_in: Optional[int] = None


@dataclass
class TokenResponse:
    access_token: str
    token_type: str = "bearer"
    user: dict = field(default_factory=dict)


@dataclass
class UserResponse:
    id: str
    email: str
    verified: bool
    created_at: datetime = field(default_factory=datetime.utcnow)


# Database Models
@dataclass
class UserDB:
    email: str
    verified: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    id: str = field(default_factory=lambda: str(ObjectId()))


@dataclass
class OTPDB:
    email: str
    otp_hash: str
    expires_at: datetime
    created_at: datetime = field(default_factory=datetime.utcnow)
    attempts: int = 0
    last_resend_at: Optional[datetime] = None
    id: str = field(default_factory=lambda: str(ObjectId()))
