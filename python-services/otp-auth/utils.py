import random
import string
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from passlib.context import CryptContext
from datetime import datetime, timedelta
from config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_otp(length: int = None) -> str:
    """Generate random OTP"""
    length = length or settings.otp_length
    return ''.join(random.choices(string.digits, k=length))


def hash_otp(otp: str) -> str:
    """Hash OTP using bcrypt"""
    return pwd_context.hash(otp)


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    """Verify OTP against hash"""
    return pwd_context.verify(plain_otp, hashed_otp)


async def send_otp_email(email: str, otp: str) -> bool:
    """Send OTP via email"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'Your OTP Code - Glovia Nepal'
        msg['From'] = settings.smtp_user
        msg['To'] = email

        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #cc4460 0%, #e15b70 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Glovia Nepal</h1>
                </div>
                <div style="background: #f9fafb; padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Your Verification Code</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
                        Enter this code to complete your authentication:
                    </p>
                    <div style="background: white; border: 2px dashed #cc4460; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                        <h1 style="color: #cc4460; font-size: 48px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                            {otp}
                        </h1>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        ⏰ This code will expire in <strong>{settings.otp_expiry_minutes} minutes</strong>
                    </p>
                    <p style="color: #6b7280; font-size: 14px;">
                        🔒 For security reasons, never share this code with anyone.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """

        part = MIMEText(html_content, 'html')
        msg.attach(part)

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)

        return True
    except Exception as e:
        print(f"❌ Email sending failed: {str(e)}")
        return False


def get_otp_expiry() -> datetime:
    """Get OTP expiration datetime"""
    return datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes)


def calculate_resend_cooldown(last_resend: datetime) -> int:
    """Calculate remaining cooldown seconds"""
    if not last_resend:
        return 0
    
    elapsed = (datetime.utcnow() - last_resend).total_seconds()
    remaining = settings.otp_resend_cooldown_seconds - elapsed
    
    return max(0, int(remaining))
