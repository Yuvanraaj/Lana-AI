"""
Database connection and operations for Resume Analyzer
"""
import mysql.connector
from mysql.connector import Error
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
import logging
import json
import time
from functools import wraps

logger = logging.getLogger(__name__)

# Simple cache decorator with TTL (Time To Live in seconds)
def cache_data(ttl_seconds=300):
    """Cache function results for specified time (default 5 minutes)"""
    def decorator(func):
        cache = {}
        cache_time = {}
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = str(args) + str(kwargs)
            now = time.time()
            
            # Return cached data if still valid
            if key in cache and (now - cache_time.get(key, 0)) < ttl_seconds:
                logger.info(f"Cache hit for {func.__name__}")
                return cache[key]
            
            # Fetch fresh data
            result = func(*args, **kwargs)
            cache[key] = result
            cache_time[key] = now
            logger.info(f"Cache refreshed for {func.__name__}")
            return result
        
        return wrapper
    return decorator

def get_db_connection(database=None):
    """Create and return a database connection"""
    try:
        db = database if database else DB_NAME
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=db,
            port=DB_PORT,
            auth_plugin='mysql_native_password'
        )
        return connection
    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise

def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        # Connect without database first
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            auth_plugin='mysql_native_password'
        )
        cursor = connection.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
        connection.commit()
        cursor.close()
        connection.close()
        logger.info(f"Database {DB_NAME} is ready")
    except Error as e:
        logger.error(f"Error creating database: {e}")
        raise

def initialize_database():
    """Initialize database tables if they don't exist"""
    try:
        # First ensure database exists
        create_database_if_not_exists()
        
        # Now connect and create tables
        connection = get_db_connection()
        cursor = connection.cursor()

        # Create resumes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                portal_user_id VARCHAR(100), -- Linked ID from Virtual Agent 1
                file_name VARCHAR(255),
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                file_path VARCHAR(500),
                file_size INT,
                city VARCHAR(100),
                country VARCHAR(100),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create resume analysis table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resume_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                resume_id INT NOT NULL,
                overall_score FLOAT,
                skills_score FLOAT,
                experience_score FLOAT,
                education_score FLOAT,
                formatting_score FLOAT,
                extracted_skills JSON,
                keywords JSON,
                predicted_roles JSON,
                strengths JSON,
                weaknesses JSON,
                suggestions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
            )
        """)

        # Create skills table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id INT AUTO_INCREMENT PRIMARY KEY,
                resume_id INT NOT NULL,
                skill_name VARCHAR(255),
                skill_level VARCHAR(50),
                frequency INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
            )
        """)

        # Create job roles table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS job_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                resume_id INT NOT NULL,
                role_name VARCHAR(255),
                match_score FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
            )
        """)

        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                user_name VARCHAR(255),
                location VARCHAR(255),
                total_resumes_uploaded INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create admin_users table with secure password storage
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255),
                hashed_password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        connection.commit()
        logger.info("Database initialized successfully")
        cursor.close()
        connection.close()

    except Error as e:
        logger.error(f"Database initialization error: {e}")
        raise

def insert_resume(user_name, email, phone, file_name, file_path, file_size, portal_user_id=None, city="Unknown", country="Unknown", latitude=None, longitude=None, ip_address=None):
    """Insert a new resume record with location data and portal connection"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO resumes (user_name, email, phone, portal_user_id, file_name, file_path, file_size, city, country, latitude, longitude, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (user_name, email, phone, portal_user_id, file_name, file_path, file_size, city, country, latitude, longitude, ip_address))
        
        connection.commit()
        resume_id = cursor.lastrowid
        cursor.close()
        connection.close()
        
        return resume_id
    except Error as e:
        logger.error(f"Error inserting resume: {e}")
        raise

def insert_resume_analysis(resume_id, analysis_data):
    """Insert resume analysis results"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO resume_analysis 
            (resume_id, overall_score, skills_score, experience_score, education_score, 
             formatting_score, extracted_skills, keywords, predicted_roles, 
             strengths, weaknesses, suggestions)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            resume_id,
            analysis_data.get("overall_score"),
            analysis_data.get("skills_score"),
            analysis_data.get("experience_score"),
            analysis_data.get("education_score"),
            analysis_data.get("formatting_score"),
            json.dumps(analysis_data.get("extracted_skills", [])),
            json.dumps(analysis_data.get("keywords", [])),
            json.dumps(analysis_data.get("predicted_roles", [])),
            json.dumps(analysis_data.get("strengths", [])),
            json.dumps(analysis_data.get("weaknesses", [])),
            json.dumps(analysis_data.get("suggestions", []))
        ))
        
        connection.commit()
        cursor.close()
        connection.close()
        
    except Error as e:
        logger.error(f"Error inserting resume analysis: {e}")
        raise

def get_all_resumes(limit=100, offset=0):
    """Get all resumes from database with pagination and analysis scores"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT 
                r.id,
                r.user_name,
                r.email,
                r.phone,
                r.file_name,
                r.file_path,
                r.file_size,
                r.city,
                r.country,
                r.latitude,
                r.longitude,
                r.ip_address,
                r.upload_date,
                r.portal_user_id,
                COALESCE(ra.overall_score, 0) as score,
                ra.extracted_skills,
                ra.predicted_roles
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
            ORDER BY r.upload_date DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        resumes = cursor.fetchall()
        
        # Get total count
        cursor.execute("SELECT COUNT(*) as total FROM resumes")
        total = cursor.fetchone()['total']
        
        cursor.close()
        connection.close()
        
        return {
            "resumes": resumes,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Error as e:
        logger.error(f"Error retrieving resumes: {e}")
        raise

def get_resume_analysis(resume_id):
    """Get analysis for a specific resume"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT ra.*, r.user_name, r.email from resume_analysis ra
            JOIN resumes r ON ra.resume_id = r.id
            WHERE ra.resume_id = %s
        """, (resume_id,))
        
        analysis = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        return analysis
    except Error as e:
        logger.error(f"Error retrieving resume analysis: {e}")
        raise

@cache_data(ttl_seconds=300)  # Cache for 5 minutes
def get_analytics_data():
    """Get analytics data for the dashboard including roles, locations, and scores"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get overall statistics including Users vs Guests
        cursor.execute("""
            SELECT 
                COUNT(*) as total_resumes,
                AVG(COALESCE(ra.overall_score, 0)) as average_score,
                MAX(COALESCE(ra.overall_score, 0)) as highest_score,
                MIN(CASE WHEN ra.overall_score > 0 THEN ra.overall_score END) as lowest_score,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NOT NULL THEN r.portal_user_id ELSE r.id END) as total_users,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NOT NULL AND r.portal_user_id NOT LIKE 'guest%' THEN r.portal_user_id END) as auth_users,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NULL OR r.portal_user_id LIKE 'guest%' THEN COALESCE(r.portal_user_id, CAST(r.id AS CHAR)) END) as guest_users
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
        """)
        stats = cursor.fetchone()
        
        # Get top roles - OPTIMIZED to only fetch limited rows
        cursor.execute("""
            SELECT 
                ra.predicted_roles, 
                COUNT(*) as role_count,
                AVG(COALESCE(ra.overall_score, 0)) as avg_score
            FROM resume_analysis ra
            WHERE ra.predicted_roles IS NOT NULL
            GROUP BY ra.predicted_roles
            ORDER BY role_count DESC
            LIMIT 100
        """)
        role_rows = cursor.fetchall()
        
        # Parse and aggregate roles more efficiently
        role_counts = {}
        role_scores = {}
        
        for row in role_rows:
            try:
                if row['predicted_roles']:
                    roles = json.loads(row['predicted_roles']) if isinstance(row['predicted_roles'], str) else row['predicted_roles']
                    if isinstance(roles, list):
                        for role_item in roles:
                            if isinstance(role_item, dict):
                                role_name = role_item.get('role', 'Unknown')
                                count = row.get('role_count', 1)
                                role_counts[role_name] = role_counts.get(role_name, 0) + count
                                role_scores[role_name] = row.get('avg_score', 0)
            except (json.JSONDecodeError, TypeError):
                continue
        
        # Top roles (top 10)
        top_roles = [
            {
                "role_name": role, 
                "count": count,
                "average_score": round(role_scores.get(role, 0), 2)
            } 
            for role, count in sorted(role_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        # Get location and score stats in one query
        cursor.execute("""
            SELECT 
                COALESCE(r.city, 'Unknown Location') as location,
                COUNT(*) as location_count,
                AVG(COALESCE(ra.overall_score, 0)) as avg_score
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
            GROUP BY r.city
            ORDER BY location_count DESC
            LIMIT 25
        """)
        location_data = cursor.fetchall()
        
        top_locations = [
            {
                "location": row['location'],
                "count": row['location_count'],
                "average_score": round(row['avg_score'], 2)
            }
            for row in location_data
        ]
        
        # Get top skills - simplified
        cursor.execute("""
            SELECT 
                ra.extracted_skills,
                COUNT(*) as skill_count
            FROM resume_analysis ra
            WHERE ra.extracted_skills IS NOT NULL
            GROUP BY ra.extracted_skills
            ORDER BY skill_count DESC
            LIMIT 50
        """)
        skill_rows = cursor.fetchall()
        
        skill_counts = {}
        for row in skill_rows:
            try:
                if row['extracted_skills']:
                    skills = json.loads(row['extracted_skills']) if isinstance(row['extracted_skills'], str) else row['extracted_skills']
                    if isinstance(skills, list):
                        for skill in skills:
                            if isinstance(skill, str):
                                skill_counts[skill] = skill_counts.get(skill, 0) + 1
            except (json.JSONDecodeError, TypeError):
                continue
        
        top_skills = [
            {"skill_name": skill, "count": count} 
            for skill, count in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        ]
        
        cursor.close()
        connection.close()
        
        return {
            "stats": stats,
            "top_roles": top_roles,
            "top_skills": top_skills,
            "top_locations": top_locations,
            "avg_score_by_role": {r['role_name']: r['average_score'] for r in top_roles},
            "avg_score_by_location": {l['location']: l['average_score'] for l in top_locations}
        }
    except Exception as e:
        logger.error(f"Error retrieving analytics: {e}")
        raise
    except Error as e:
        logger.error(f"Error retrieving analytics data: {e}")
        raise
