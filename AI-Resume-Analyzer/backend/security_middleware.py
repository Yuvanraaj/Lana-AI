"""
Security Middleware Module

This module implements security middleware for FastAPI applications.
All middleware inherit from BaseHTTPMiddleware for compatibility with app.add_middleware()
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from fastapi import Request, Response
import logging
import time
from typing import Callable
from datetime import datetime
from config import REQUIRE_HTTPS

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security Headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests and responses for security auditing"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        logger.info(
            f"REQUEST | Method: {request.method} | Path: {request.url.path} | "
            f"Client: {request.client.host if request.client else 'unknown'} | "
            f"User-Agent: {request.headers.get('user-agent', 'unknown')}"
        )
        
        try:
            response = await call_next(request)
        except Exception as e:
            logger.error(
                f"ERROR | Method: {request.method} | Path: {request.url.path} | "
                f"Error: {str(e)}"
            )
            raise
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"RESPONSE | Method: {request.method} | Path: {request.url.path} | "
            f"Status: {response.status_code} | Duration: {process_time:.3f}s"
        )
        
        # Add response time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response


class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting (for production, use Redis)"""
    
    def __init__(self, app, requests_per_minute: int = 100):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_tracker = {}  # {client_ip: [timestamps]}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Initialize tracker for client if not exists
        if client_ip not in self.request_tracker:
            self.request_tracker[client_ip] = []
        
        # Remove requests older than 1 minute
        self.request_tracker[client_ip] = [
            ts for ts in self.request_tracker[client_ip]
            if current_time - ts < 60
        ]
        
        # Check rate limit
        if len(self.request_tracker[client_ip]) >= self.requests_per_minute:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."}
            )
        
        # Add current request
        self.request_tracker[client_ip].append(current_time)
        
        response = await call_next(request)
        return response


class InputSanitizationMiddleware(BaseHTTPMiddleware):
    """Middleware to sanitize and validate input"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Log check for suspicious patterns in common attack vectors
        # Note: In a production system, use a WAF (Web Application Firewall)
        # This is just a simple pattern check for demonstration
        
        suspicious_patterns = [
            'union select', 'drop table', '<script>', 'javascript:',
            'onclick=', 'onerror=', 'onload='
        ]
        
        # Check URL and query parameters
        url_str = str(request.url).lower()
        if any(pattern in url_str for pattern in suspicious_patterns):
            logger.warning(
                f"Suspicious pattern detected in URL from {request.client.host if request.client else 'unknown'}: "
                f"{str(request.url)[:100]}..."
            )
        
        # Proceed with the request
        response = await call_next(request)
        return response


class HTTPSEnforcementMiddleware(BaseHTTPMiddleware):
    """Enforce HTTPS in production"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if REQUIRE_HTTPS and request.url.scheme != "https":
            logger.warning(f"Non-HTTPS request attempt from {request.client.host if request.client else 'unknown'}")
            return JSONResponse(
                status_code=400,
                content={"detail": "HTTPS is required"}
            )
        
        response = await call_next(request)
        return response


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """Log sensitive operations for audit trails"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Log sensitive operations
        sensitive_paths = ['/admin/', '/upload-resume', '/auth/']
        
        if any(request.url.path.startswith(path) for path in sensitive_paths):
            logger.info(
                f"AUDIT | Operation: {request.method} {request.url.path} | "
                f"Client: {request.client.host if request.client else 'unknown'} | "
                f"Timestamp: {datetime.now().isoformat()}"
            )
        
        response = await call_next(request)
        
        # Log response for sensitive operations
        if any(request.url.path.startswith(path) for path in sensitive_paths):
            logger.info(
                f"AUDIT | Result: {response.status_code} | "
                f"Path: {request.url.path}"
            )
        
        return response
