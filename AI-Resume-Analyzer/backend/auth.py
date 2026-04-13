"""
Authentication and Security Module
"""
from datetime import datetime, timedelta
from typing import Optional, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr
import logging

from config import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, ADMIN_EMAILS, PORTAL_SHARED_SECRET

logger = logging.getLogger(__name__)

# Password hashing context - Using Argon2 (more secure and compatible than bcrypt)
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto"
)

# Security scheme
security = HTTPBearer()

# ============ Pydantic Models ============

class TokenData(BaseModel):
    email: str
    user_id: Optional[int] = None
    role: str = "user"
    permissions: List[str] = []

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    user_id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

# ============ Password Functions ============

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

# ============ JWT Functions ============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    
    Args:
        data: Claims to encode
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """
    Create JWT refresh token (longer expiration)
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "refresh"})
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> TokenData:
    """
    Verify and decode JWT token
    Tries primary secret key first, then falls back to portal shared secret
    """
    try:
        # Try primary secret key
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        except JWTError:
            # Fallback to portal shared secret
            if PORTAL_SHARED_SECRET:
                payload = jwt.decode(token, PORTAL_SHARED_SECRET, algorithms=[JWT_ALGORITHM])
            else:
                raise
        
        email: str = payload.get("email")
        
        if email is None:
            logger.warning(f"Token missing email claim")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        token_data = TokenData(
            email=email,
            user_id=payload.get("user_id"),
            role=payload.get("role", "user"),
            permissions=payload.get("permissions", [])
        )
        return token_data
        
    except JWTError as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

# ============ Dependency Functions ============

async def get_current_user(credentials: HTTPBearer = Depends(security)) -> TokenData:
    """
    Dependency to get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials
        
    Returns:
        TokenData of authenticated user
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # HTTPBearer returns the credentials object with scheme and credentials attributes
    token = credentials.credentials if hasattr(credentials, 'credentials') else str(credentials)
    
    try:
        token_data = verify_token(token)
        return token_data
    except HTTPException:
        logger.warning(f"Failed authentication attempt")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_admin_user(current_user: TokenData = Depends(get_current_user)) -> TokenData:
    """
    Dependency to ensure current user is admin
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        TokenData if user is admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != "admin":
        logger.warning(f"Non-admin user {current_user.email} attempted admin action")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin access required.",
        )
    return current_user

def is_admin_email(email: str) -> bool:
    """Check if email is in admin list"""
    return email.lower() in [admin.lower() for admin in ADMIN_EMAILS]

# ============ Token Generation ============

def generate_tokens(email: str, user_id: int, full_name: str, role: str = "user") -> Token:
    """
    Generate access and refresh tokens for a user
    
    Args:
        email: User email
        user_id: User ID
        full_name: User full name
        role: User role ('admin' or 'user')
        
    Returns:
        Token object with access and refresh tokens
    """
    token_data = {
        "email": email,
        "user_id": user_id,
        "full_name": full_name,
        "role": role,
        "permissions": ["read", "write"] if role == "admin" else ["read"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

# ============ Validation Functions ============

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    if not any(c in "!@#$%^&*" for c in password):
        return False, "Password must contain at least one special character (!@#$%^&*)"
    
    return True, ""
