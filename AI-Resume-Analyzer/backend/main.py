"""
Main FastAPI application for Resume Analyzer with Security
"""
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Depends, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg2 import Error
import pandas as pd
import logging
from datetime import datetime
import io
import requests

from config import (
    API_HOST, API_PORT, API_RELOAD, UPLOAD_DIR, COURSE_RECOMMENDATIONS,
    YOUTUBE_RECOMMENDATIONS, ALLOWED_ORIGINS, REQUIRE_HTTPS, RESOURCE_GUIDES,
    RESUME_TIPS_DO, RESUME_TIPS_DONT
)
from database import (
    initialize_database, insert_resume, insert_resume_analysis,
    get_all_resumes, get_analytics_data, get_db_connection,
    insert_audit_log, get_audit_logs, get_login_logs,
    get_user_analyses, seed_demo_data
)
from nlp_processor import analyze_resume
from file_processor import extract_text_from_file, save_uploaded_file

# Security imports
from auth import get_current_user, generate_tokens, TokenData, UserCredentials, verify_password
from validators import (
    validate_file_extension, validate_filename, sanitize_filename,
    validate_resume_upload_data, validate_email, validate_phone
)
from admin_db import verify_admin_credentials, create_admin_user, admin_user_exists
from security_middleware import (
    SecurityHeadersMiddleware, RequestLoggingMiddleware, RateLimitingMiddleware,
    InputSanitizationMiddleware, HTTPSEnforcementMiddleware, AuditLoggingMiddleware
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Resume Analyzer API",
    version="1.0.0",
    description="Secure Resume Analysis API with Role-Based Access Control"
)

# Add Security Middleware (order matters!)
# Note: Middleware are wrapped in reverse order, but they execute in the order below
app.add_middleware(HTTPSEnforcementMiddleware)
app.add_middleware(InputSanitizationMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(RateLimitingMiddleware)
app.add_middleware(AuditLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count", "X-Process-Time"],
)

# Pydantic models
class ResumeUploadResponse(BaseModel):
    resume_id: int
    message: str
    analysis: dict

class AnalyticsResponse(BaseModel):
    total_resumes: int
    average_score: float
    top_roles: list
    top_skills: list

class HealthCheckResponse(BaseModel):
    status: str
    timestamp: str
    version: str

class ErrorResponse(BaseModel):
    detail: str
    error_code: str

@app.on_event("startup")
async def startup():
    """Initialize database, create necessary directories, and seed default admin on startup"""
    import time

    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)
        logger.info(f"Created uploads directory: {UPLOAD_DIR}")

    for attempt in range(1, 11):
        try:
            initialize_database()
            logger.info("Database initialized successfully")
            break
        except Exception as e:
            logger.warning(f"DB init attempt {attempt}/10 failed: {e}. Retrying in {attempt * 2}s...")
            time.sleep(attempt * 2)
    else:
        logger.error("Could not initialize database after 10 attempts.")
        return

    # Auto-create admin from env vars if no admin exists yet
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Lana Admin")
    if admin_email and admin_password:
        try:
            from admin_db import admin_user_exists, create_admin_user
            if not admin_user_exists(admin_email):
                ok = create_admin_user(admin_email, admin_password, admin_name)
                if ok:
                    logger.info(f"[STARTUP] Admin account created: {admin_email}")
                else:
                    logger.warning(f"[STARTUP] Failed to create admin account for {admin_email}")
            else:
                logger.info(f"[STARTUP] Admin account already exists: {admin_email}")
        except Exception as e:
            logger.error(f"[STARTUP] Error seeding admin: {e}")
    else:
        logger.warning("[STARTUP] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed")

@app.get("/health")
async def health_check() -> HealthCheckResponse:
    """Health check endpoint - public access"""
    return HealthCheckResponse(
        status="Running",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/auth/login")
async def login(request: Request, credentials: UserCredentials):
    """Login endpoint - Returns JWT tokens"""
    try:
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent")
        admin_user = verify_admin_credentials(credentials.email, credentials.password, ip, ua)
        
        if not admin_user:
            logger.warning(f"Failed login attempt for {credentials.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Generate tokens
        tokens = generate_tokens(
            email=admin_user['email'],
            user_id=admin_user['user_id'],
            full_name=admin_user['full_name']
        )
        
        logger.info(f"User {admin_user['email']} logged in successfully")
        
        return {
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": "bearer",
            "expires_in": tokens.expires_in
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.post("/admin/login")
async def admin_login(request: Request, credentials: UserCredentials):
    """Admin login endpoint - Returns JWT tokens for admin users"""
    try:
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent")
        admin_user = verify_admin_credentials(credentials.email, credentials.password, ip, ua)
        
        if not admin_user:
            logger.warning(f"Failed admin login attempt for {credentials.email}")
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        
        # Generate tokens with admin role
        tokens = generate_tokens(
            email=admin_user['email'],
            user_id=admin_user['user_id'],
            full_name=admin_user['full_name'],
            role="admin"  # Set role to admin for dashboard access
        )
        
        logger.info(f"Admin user {admin_user['email']} logged in successfully")
        
        return {
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": "bearer",
            "expires_in": tokens.expires_in
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Admin login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

@app.get("/auth/me")
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """Get current authenticated user information"""
    return {
        "email": current_user.email,
        "user_id": current_user.user_id,
        "role": current_user.role,
        "permissions": current_user.permissions
    }

@app.post("/track-location")
async def track_location(
    email: str = Form(...),
    city: str = Form(default="Unknown"),
    country: str = Form(default="Unknown"),
    latitude: float = Form(default=None),
    longitude: float = Form(default=None)
):
    """
    Track user location for analytics purposes
    Called from frontend when resume is uploaded
    """
    try:
        # Basic validation
        if not email or "@" not in email:
            raise HTTPException(status_code=400, detail="Invalid email")
        
        try:
            connection = get_db_connection()
            cursor = connection.cursor()

            cursor.execute("""
                INSERT INTO users (email, location, city, country, latitude, longitude, last_seen)
                VALUES (%s, %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (email) DO UPDATE SET
                    location   = EXCLUDED.location,
                    city       = EXCLUDED.city,
                    country    = EXCLUDED.country,
                    latitude   = EXCLUDED.latitude,
                    longitude  = EXCLUDED.longitude,
                    last_seen  = NOW()
            """, (email, f"{city}, {country}", city, country, latitude, longitude))
            
            connection.commit()
            cursor.close()
            connection.close()
            
            logger.info(f"Location tracked for {email}: {city}, {country}")
            
            return {
                "status": "success",
                "message": "Location tracked",
                "email": email,
                "location": f"{city}, {country}"
            }
        except Error as e:
            logger.warning(f"Could not update user location: {e}")
            return {
                "status": "partial",
                "message": "Location tracking partial - database update failed",
                "email": email
            }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error tracking location: {e}")
        raise HTTPException(status_code=500, detail="Location tracking failed")

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    user_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    user_id: str = Form(default=None), # ID from the main portal
    city: str = Form(default="Unknown"),
    country: str = Form(default="Unknown"),
    latitude: float = Form(default=None),
    longitude: float = Form(default=None)
):
    """
    Upload resume and perform analysis
    
    Validation:
    - File type must be PDF or DOCX
    - Text content must extract successfully
    - User information must be valid
    """
    try:
        # ============ INPUT VALIDATION ============
        
        # Validate user input
        is_valid, errors = validate_resume_upload_data(user_name, email, phone)
        if not is_valid:
            logger.warning(f"Resume upload validation failed: {errors}")
            raise HTTPException(
                status_code=400,
                detail=f"Validation failed: {', '.join(errors)}"
            )
        
        # Validate file extension
        if not validate_file_extension(file.filename):
            logger.warning(f"Invalid file type attempted: {file.filename}")
            raise HTTPException(
                status_code=400,
                detail="Only PDF and DOCX files are allowed"
            )
        
        # Validate filename for security
        is_valid, error = validate_filename(file.filename)
        if not is_valid:
            logger.warning(f"Invalid filename: {file.filename} - {error}")
            raise HTTPException(status_code=400, detail=f"Invalid filename: {error}")
        
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        
        # ============ FILE PROCESSING ============
        
        # Get file size
        file_size = file.file._file.seek(0, 2)
        file.file.seek(0)
        
        # Check file size (max 10MB)
        if file_size > 10 * 1024 * 1024:
            logger.warning(f"File size exceeded: {file_size} bytes")
            raise HTTPException(
                status_code=413,
                detail="File size exceeds 10MB limit"
            )
        
        # Save file with sanitized name
        file_path = save_uploaded_file(file, UPLOAD_DIR, safe_filename)
        
        # Get location from IP if not provided (advanced fallback mechanism)
        client_ip = "Unknown"
        if city == "Unknown" or country == "Unknown":
            providers = [
                {"url": "http://ip-api.com/json/", "city_key": "city", "country_key": "country", "lat_key": "lat", "lon_key": "lon", "ip_key": "query"},
                {"url": "https://ipinfo.io/json", "city_key": "city", "country_key": "country", "loc_key": "loc", "ip_key": "ip"},
                {"url": "https://ipapi.co/json/", "city_key": "city", "country_key": "country_name", "lat_key": "latitude", "lon_key": "longitude", "ip_key": "ip"}
            ]
            
            for provider in providers:
                try:
                    geo_response = requests.get(provider["url"], timeout=3)
                    if geo_response.status_code == 200:
                        geo_data = geo_response.json()
                        if city == "Unknown" and geo_data.get(provider["city_key"]):
                            city = geo_data.get(provider["city_key"])
                        if country == "Unknown" and geo_data.get(provider["country_key"]):
                            country = geo_data.get(provider["country_key"])
                        if latitude is None:
                            if "loc_key" in provider and geo_data.get(provider["loc_key"]):
                                loc_parts = geo_data.get(provider["loc_key"]).split(",")
                                if len(loc_parts) == 2:
                                    latitude = float(loc_parts[0])
                                    longitude = float(loc_parts[1])
                            elif "lat_key" in provider and geo_data.get(provider["lat_key"]):
                                latitude = float(geo_data.get(provider["lat_key"]))
                                longitude = float(geo_data.get(provider["lon_key"]))
                        if client_ip == "Unknown" and geo_data.get(provider["ip_key"]):
                            client_ip = geo_data.get(provider["ip_key"])
                        
                        logger.info(f"Location auto-detected via {provider['url']}: {city}, {country}")
                        break
                except Exception as e:
                    logger.warning(f"Could not auto-detect location via {provider['url']}: {e}")
                    continue
        
        # Insert resume record with location data
        resume_id = insert_resume(
            user_name, email, phone, safe_filename, file_path, file_size,
            portal_user_id=user_id, city=city, country=country, latitude=latitude, longitude=longitude, ip_address=client_ip
        )
        logger.info(f"Resume {resume_id} saved: {user_name} ({email}) from {city}, {country}")
        
        # Extract text
        file_ext = file.filename.split('.')[-1].lower()
        file_type = "pdf" if file_ext == "pdf" else "docx"
        text = extract_text_from_file(file_path, file_type)
        
        if not text or len(text.strip()) < 50:
            logger.error(f"Text extraction failed for resume {resume_id}")
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from resume. Ensure file is not corrupted."
            )
        
        # ============ ANALYSIS ============
        
        # Analyze resume
        analysis = analyze_resume(text)
        
        # Insert analysis results
        analysis_data = {
            "overall_score": analysis['scores']['overall_score'],
            "skills_score": analysis['scores']['skills_score'],
            "experience_score": analysis['scores']['experience_score'],
            "education_score": analysis['scores']['education_score'],
            "formatting_score": analysis['scores']['formatting_score'],
            "extracted_skills": analysis['extracted_skills'],
            "keywords": analysis['keywords'],
            "predicted_roles": analysis['predicted_roles'],
            "strengths": analysis['strengths'],
            "weaknesses": analysis['weaknesses'],
            "suggestions": analysis['suggestions'],
            "quick_wins": analysis.get('quick_wins', []),
            "priority_changes": analysis.get('priority_changes', []),
            "ats_optimization": analysis.get('ats_optimization', []),
            "skills_to_emphasize": analysis.get('skills_to_emphasize', []),
            "missing_keywords": analysis.get('missing_keywords', []),
            "metrics_to_add": analysis.get('metrics_to_add', []),
            "role_specific_advice": analysis.get('role_specific_advice', {}),
            "certifications_recommendations": analysis.get('certifications_recommendations', []),
            "overall_strategy": analysis.get('overall_strategy', '')
        }
        insert_resume_analysis(resume_id, analysis_data)
        
        logger.info(f"Analysis completed for resume {resume_id} - Score: {analysis['scores']['overall_score']}")

        insert_audit_log(
            action="RESUME_UPLOAD",
            actor_email=email,
            resource_type="resume",
            resource_id=resume_id,
            status="SUCCESS",
            ip_address=client_ip,
            details={
                "user_name": user_name,
                "file_name": safe_filename,
                "overall_score": analysis['scores']['overall_score'],
                "city": city,
                "country": country,
            }
        )

        return ResumeUploadResponse(
            resume_id=resume_id,
            message="Resume uploaded and analyzed successfully",
            analysis=analysis
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing resume: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred during resume processing"
        )

@app.get("/admin/resumes")
async def get_resumes(limit: int = 100, offset: int = 0, current_user: TokenData = Depends(get_current_user)):
    """
    Get all resumes with pagination (PROTECTED - Admin only)
    """
    # Verify admin access
    if current_user.role != "admin":
        logger.warning(f"Unauthorized admin access attempt by user {current_user.email}")
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Validate pagination parameters
    limit = min(max(1, limit), 200)  # Limit between 1-200
    offset = max(0, offset)  # Offset must be non-negative
    
    try:
        logger.info(f"Admin user {current_user.email} accessed resumes list (limit={limit}, offset={offset})")
        result = get_all_resumes(limit=limit, offset=offset)
        return {
            "resumes": result['resumes'],
            "total": result['total'],
            "limit": result['limit'],
            "offset": result['offset'],
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error retrieving resumes: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve resumes")

@app.get("/admin/analytics")
async def get_analytics(current_user: TokenData = Depends(get_current_user)):
    """Get analytics data for dashboard (PROTECTED - Admin only)"""
    # Verify admin access
    if current_user.role != "admin":
        logger.warning(f"Unauthorized admin access attempt by user {current_user.email}")
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        logger.info(f"Admin user {current_user.email} accessed analytics")
        analytics = get_analytics_data()
        return {
            **analytics,
            "timestamp": datetime.now().isoformat(),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error retrieving analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")

@app.post("/admin/export-csv")
async def export_resumes_csv(current_user: TokenData = Depends(get_current_user)):
    """Export all resumes data as CSV (PROTECTED - Admin only)"""
    # Verify admin access
    if current_user.role != "admin":
        logger.warning(f"Unauthorized admin access attempt by user {current_user.email}")
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        logger.info("Analytics dashboard - CSV export initiated")
        # Get all resumes with high limit
        result = get_all_resumes(limit=10000, offset=0)
        resumes = result.get('resumes', [])
        
        if not resumes:
            raise HTTPException(status_code=400, detail="No resumes to export")
        
        df = pd.DataFrame(resumes)
        
        # Create CSV in memory
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
        
        # Return as download
        return FileResponse(
            io.BytesIO(csv_buffer.getvalue().encode()),
            media_type="text/csv",
            filename=f"resumes_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting CSV: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to export CSV")

@app.get("/admin/audit-logs")
async def get_audit_log_list(
    limit: int = 200,
    offset: int = 0,
    action: str = None,
    current_user: TokenData = Depends(get_current_user)
):
    """Get audit logs — admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        result = get_audit_logs(limit=min(limit, 500), offset=offset, action_filter=action)
        return {"status": "success", **result}
    except Exception as e:
        logger.error(f"Error fetching audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch audit logs")


@app.get("/admin/login-logs")
async def get_login_log_list(
    limit: int = 200,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_user)
):
    """Get login attempt logs — admin only"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    try:
        result = get_login_logs(limit=min(limit, 500), offset=offset)
        return {"status": "success", **result}
    except Exception as e:
        logger.error(f"Error fetching login logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch login logs")


@app.get("/my-analyses")
async def get_my_analyses(portal_user_id: str = None, email: str = None, limit: int = 20):
    """Return past resume analyses for a user — public, filtered by user ID or email."""
    if not portal_user_id and not email:
        raise HTTPException(status_code=400, detail="Provide portal_user_id or email")
    try:
        rows = get_user_analyses(portal_user_id=portal_user_id, email=email, limit=min(limit, 50))
        return {"analyses": rows, "total": len(rows)}
    except Exception as e:
        logger.error(f"Error fetching user analyses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch history")


@app.post("/admin/seed-demo")
async def seed_demo(current_user: TokenData = Depends(get_current_user)):
    """Seed demo resume history for the configured DEMO_SEED_EMAIL — admin only."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    demo_email = os.getenv("DEMO_SEED_EMAIL", os.getenv("ADMIN_EMAIL", ""))
    demo_name  = os.getenv("DEMO_SEED_NAME",  os.getenv("ADMIN_NAME", "Yuvanraaj"))
    if not demo_email:
        raise HTTPException(status_code=400, detail="Set DEMO_SEED_EMAIL env var first")
    count = seed_demo_data(user_name=demo_name, email=demo_email)
    return {"seeded": count, "email": demo_email}


@app.get("/courses")
async def get_course_recommendations():
    """Get recommended courses"""
    return COURSE_RECOMMENDATIONS

@app.get("/videos")
async def get_video_recommendations():
    """Get recommended videos"""
    return YOUTUBE_RECOMMENDATIONS

@app.get("/guides")
async def get_guides():
    """Get resume guides and best practices"""
    return RESOURCE_GUIDES

@app.get("/tips")
async def get_tips():
    """Get resume writing tips"""
    return {
        "do": RESUME_TIPS_DO,
        "dont": RESUME_TIPS_DONT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=API_HOST, port=API_PORT, reload=API_RELOAD)
