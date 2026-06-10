"""
Database connection and operations for Resume Analyzer (PostgreSQL / Supabase)
"""
import psycopg2
import psycopg2.extras
from psycopg2 import Error
from config import DATABASE_URL, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
import logging
import json
import time
from functools import wraps

logger = logging.getLogger(__name__)


def cache_data(ttl_seconds=300):
    def decorator(func):
        cache = {}
        cache_time = {}

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = str(args) + str(kwargs)
            now = time.time()
            if key in cache and (now - cache_time.get(key, 0)) < ttl_seconds:
                logger.info(f"Cache hit for {func.__name__}")
                return cache[key]
            result = func(*args, **kwargs)
            cache[key] = result
            cache_time[key] = now
            logger.info(f"Cache refreshed for {func.__name__}")
            return result

        return wrapper
    return decorator


def get_db_connection():
    """Return a psycopg2 connection. Prefers DATABASE_URL (Supabase/Render).
    Forces IPv4 resolution — Docker containers lack IPv6 routing by default."""
    import socket
    import urllib.parse

    try:
        if DATABASE_URL:
            p = urllib.parse.urlparse(DATABASE_URL)
            host = p.hostname
            port = p.port or 5432
            user = p.username
            password = urllib.parse.unquote(p.password or '')
            dbname = p.path.lstrip('/')

            # Resolve to IPv4 explicitly so Docker can reach Supabase
            try:
                ipv4 = socket.getaddrinfo(host, port, socket.AF_INET)[0][4][0]
            except socket.gaierror:
                ipv4 = host  # fallback to hostname if resolution fails

            conn = psycopg2.connect(
                host=ipv4,
                port=port,
                user=user,
                password=password,
                dbname=dbname,
                sslmode='require',
            )
        else:
            conn = psycopg2.connect(
                host=DB_HOST,
                port=DB_PORT,
                user=DB_USER,
                password=DB_PASSWORD,
                dbname=DB_NAME,
            )
        return conn
    except Error as e:
        logger.error(f"Database connection error: {e}")
        raise


def initialize_database():
    """Create tables if they don't exist (idempotent)."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id SERIAL PRIMARY KEY,
                user_name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                portal_user_id VARCHAR(100),
                file_name VARCHAR(255),
                upload_date TIMESTAMP DEFAULT NOW(),
                file_path VARCHAR(500),
                file_size INT,
                city VARCHAR(100),
                country VARCHAR(100),
                latitude DECIMAL(10, 8),
                longitude DECIMAL(11, 8),
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS resume_analysis (
                id SERIAL PRIMARY KEY,
                resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                overall_score FLOAT,
                skills_score FLOAT,
                experience_score FLOAT,
                education_score FLOAT,
                formatting_score FLOAT,
                extracted_skills JSONB,
                keywords JSONB,
                predicted_roles JSONB,
                strengths JSONB,
                weaknesses JSONB,
                suggestions JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS skills (
                id SERIAL PRIMARY KEY,
                resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                skill_name VARCHAR(255),
                skill_level VARCHAR(50),
                frequency INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS job_roles (
                id SERIAL PRIMARY KEY,
                resume_id INT NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
                role_name VARCHAR(255),
                match_score FLOAT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE,
                user_name VARCHAR(255),
                location VARCHAR(255),
                total_resumes_uploaded INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS admin_users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                full_name VARCHAR(255),
                hashed_password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS login_logs (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255),
                success BOOLEAN NOT NULL,
                ip_address VARCHAR(45),
                user_agent VARCHAR(500),
                failure_reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                actor_email VARCHAR(255),
                resource_type VARCHAR(100),
                resource_id VARCHAR(100),
                status VARCHAR(20),
                ip_address VARCHAR(45),
                details JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """)

        # Add missing columns to resume_analysis (idempotent via ALTER TABLE IF NOT EXISTS)
        extra_cols = [
            ("quick_wins",                    "JSONB"),
            ("priority_changes",              "JSONB"),
            ("ats_optimization",              "JSONB"),
            ("skills_to_emphasize",           "JSONB"),
            ("missing_keywords",              "JSONB"),
            ("metrics_to_add",                "JSONB"),
            ("role_specific_advice",          "JSONB"),
            ("certifications_recommendations","JSONB"),
            ("overall_strategy",              "TEXT"),
        ]
        for col, col_type in extra_cols:
            cur.execute(f"""
                ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS {col} {col_type}
            """)

        # Add missing columns to users
        user_extra = [
            ("city",       "VARCHAR(100)"),
            ("country",    "VARCHAR(100)"),
            ("latitude",   "DECIMAL(10, 8)"),
            ("longitude",  "DECIMAL(11, 8)"),
            ("last_seen",  "TIMESTAMP"),
        ]
        for col, col_type in user_extra:
            cur.execute(f"""
                ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} {col_type}
            """)

        conn.commit()
        cur.close()
        conn.close()
        logger.info("Database initialized successfully")

    except Error as e:
        logger.error(f"Database initialization error: {e}")
        raise


def insert_resume(user_name, email, phone, file_name, file_path, file_size,
                  portal_user_id=None, city="Unknown", country="Unknown",
                  latitude=None, longitude=None, ip_address=None):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO resumes
                (user_name, email, phone, portal_user_id, file_name, file_path,
                 file_size, city, country, latitude, longitude, ip_address)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (user_name, email, phone, portal_user_id, file_name, file_path,
              file_size, city, country, latitude, longitude, ip_address))

        resume_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return resume_id

    except Error as e:
        logger.error(f"Error inserting resume: {e}")
        raise


def insert_resume_analysis(resume_id, analysis_data):
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO resume_analysis (
                resume_id, overall_score, skills_score, experience_score,
                education_score, formatting_score, extracted_skills, keywords,
                predicted_roles, strengths, weaknesses, suggestions,
                quick_wins, priority_changes, ats_optimization,
                skills_to_emphasize, missing_keywords, metrics_to_add,
                role_specific_advice, certifications_recommendations, overall_strategy
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
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
            json.dumps(analysis_data.get("suggestions", [])),
            json.dumps(analysis_data.get("quick_wins", [])),
            json.dumps(analysis_data.get("priority_changes", [])),
            json.dumps(analysis_data.get("ats_optimization", [])),
            json.dumps(analysis_data.get("skills_to_emphasize", [])),
            json.dumps(analysis_data.get("missing_keywords", [])),
            json.dumps(analysis_data.get("metrics_to_add", [])),
            json.dumps(analysis_data.get("role_specific_advice", {})),
            json.dumps(analysis_data.get("certifications_recommendations", [])),
            analysis_data.get("overall_strategy", ""),
        ))

        conn.commit()
        cur.close()
        conn.close()

    except Error as e:
        logger.error(f"Error inserting resume analysis: {e}")
        raise


def get_all_resumes(limit=100, offset=0):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT
                r.id, r.user_name, r.email, r.phone, r.file_name, r.file_path,
                r.file_size, r.city, r.country, r.latitude, r.longitude,
                r.ip_address, r.upload_date, r.portal_user_id,
                COALESCE(ra.overall_score, 0) AS score,
                ra.extracted_skills, ra.predicted_roles
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
            ORDER BY r.upload_date DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))
        resumes = [dict(row) for row in cur.fetchall()]

        cur.execute("SELECT COUNT(*) AS total FROM resumes")
        total = cur.fetchone()['total']

        cur.close()
        conn.close()
        return {"resumes": resumes, "total": total, "limit": limit, "offset": offset}

    except Error as e:
        logger.error(f"Error retrieving resumes: {e}")
        raise


def get_resume_analysis(resume_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT ra.*, r.user_name, r.email
            FROM resume_analysis ra
            JOIN resumes r ON ra.resume_id = r.id
            WHERE ra.resume_id = %s
        """, (resume_id,))

        row = cur.fetchone()
        cur.close()
        conn.close()
        return dict(row) if row else None

    except Error as e:
        logger.error(f"Error retrieving resume analysis: {e}")
        raise


@cache_data(ttl_seconds=300)
def get_analytics_data():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        cur.execute("""
            SELECT
                COUNT(*) AS total_resumes,
                AVG(COALESCE(ra.overall_score, 0)) AS average_score,
                MAX(COALESCE(ra.overall_score, 0)) AS highest_score,
                MIN(CASE WHEN ra.overall_score > 0 THEN ra.overall_score END) AS lowest_score,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NOT NULL
                    THEN r.portal_user_id ELSE CAST(r.id AS TEXT) END) AS total_users,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NOT NULL
                    AND r.portal_user_id NOT LIKE 'guest%%'
                    THEN r.portal_user_id END) AS auth_users,
                COUNT(DISTINCT CASE WHEN r.portal_user_id IS NULL
                    OR r.portal_user_id LIKE 'guest%%'
                    THEN COALESCE(r.portal_user_id, CAST(r.id AS TEXT)) END) AS guest_users
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
        """)
        stats = dict(cur.fetchone())

        cur.execute("""
            SELECT ra.predicted_roles, COUNT(*) AS role_count,
                   AVG(COALESCE(ra.overall_score, 0)) AS avg_score
            FROM resume_analysis ra
            WHERE ra.predicted_roles IS NOT NULL
            GROUP BY ra.predicted_roles
            ORDER BY role_count DESC
            LIMIT 100
        """)
        role_rows = cur.fetchall()

        role_counts = {}
        role_scores = {}
        for row in role_rows:
            try:
                roles = row['predicted_roles']
                if isinstance(roles, str):
                    roles = json.loads(roles)
                if isinstance(roles, list):
                    for item in roles:
                        if isinstance(item, dict):
                            name = item.get('role', 'Unknown')
                            role_counts[name] = role_counts.get(name, 0) + row['role_count']
                            role_scores[name] = row['avg_score']
            except (json.JSONDecodeError, TypeError):
                continue

        top_roles = [
            {"role_name": r, "count": c, "average_score": round(role_scores.get(r, 0), 2)}
            for r, c in sorted(role_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]

        cur.execute("""
            SELECT COALESCE(r.city, 'Unknown Location') AS location,
                   COUNT(*) AS location_count,
                   AVG(COALESCE(ra.overall_score, 0)) AS avg_score
            FROM resumes r
            LEFT JOIN resume_analysis ra ON r.id = ra.resume_id
            GROUP BY r.city
            ORDER BY location_count DESC
            LIMIT 25
        """)
        top_locations = [
            {"location": row['location'], "count": row['location_count'],
             "average_score": round(row['avg_score'], 2)}
            for row in cur.fetchall()
        ]

        cur.execute("""
            SELECT ra.extracted_skills, COUNT(*) AS skill_count
            FROM resume_analysis ra
            WHERE ra.extracted_skills IS NOT NULL
            GROUP BY ra.extracted_skills
            ORDER BY skill_count DESC
            LIMIT 50
        """)
        skill_counts = {}
        for row in cur.fetchall():
            try:
                skills = row['extracted_skills']
                if isinstance(skills, str):
                    skills = json.loads(skills)
                if isinstance(skills, list):
                    for skill in skills:
                        if isinstance(skill, str):
                            skill_counts[skill] = skill_counts.get(skill, 0) + 1
            except (json.JSONDecodeError, TypeError):
                continue

        top_skills = [
            {"skill_name": s, "count": c}
            for s, c in sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        ]

        cur.close()
        conn.close()

        return {
            "stats": stats,
            "top_roles": top_roles,
            "top_skills": top_skills,
            "top_locations": top_locations,
            "avg_score_by_role": {r['role_name']: r['average_score'] for r in top_roles},
            "avg_score_by_location": {l['location']: l['average_score'] for l in top_locations},
        }

    except Error as e:
        logger.error(f"Error retrieving analytics data: {e}")
        raise


def insert_audit_log(action, actor_email=None, resource_type=None, resource_id=None,
                     status="SUCCESS", ip_address=None, details=None):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO audit_logs (action, actor_email, resource_type, resource_id,
                                    status, ip_address, details)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (action, actor_email, resource_type,
              str(resource_id) if resource_id is not None else None,
              status, ip_address, json.dumps(details or {})))
        conn.commit()
        cur.close()
        conn.close()
    except Error as e:
        logger.error(f"Error inserting audit log: {e}")


def insert_login_log(email, success, ip_address=None, user_agent=None, failure_reason=None):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO login_logs (email, success, ip_address, user_agent, failure_reason)
            VALUES (%s, %s, %s, %s, %s)
        """, (email, success, ip_address, user_agent, failure_reason))
        conn.commit()
        cur.close()
        conn.close()
    except Error as e:
        logger.error(f"Error inserting login log: {e}")


def get_audit_logs(limit=200, offset=0, action_filter=None):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        if action_filter:
            cur.execute("""
                SELECT * FROM audit_logs WHERE action = %s
                ORDER BY created_at DESC LIMIT %s OFFSET %s
            """, (action_filter, limit, offset))
        else:
            cur.execute("""
                SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT %s OFFSET %s
            """, (limit, offset))
        rows = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT COUNT(*) AS total FROM audit_logs" +
                    (" WHERE action = %s" if action_filter else ""),
                    (action_filter,) if action_filter else ())
        total = cur.fetchone()['total']
        cur.close()
        conn.close()
        return {"logs": rows, "total": total, "limit": limit, "offset": offset}
    except Error as e:
        logger.error(f"Error retrieving audit logs: {e}")
        raise


def get_login_logs(limit=200, offset=0):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("""
            SELECT * FROM login_logs ORDER BY created_at DESC LIMIT %s OFFSET %s
        """, (limit, offset))
        rows = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT COUNT(*) AS total FROM login_logs")
        total = cur.fetchone()['total']
        cur.close()
        conn.close()
        return {"logs": rows, "total": total, "limit": limit, "offset": offset}
    except Error as e:
        logger.error(f"Error retrieving login logs: {e}")
        raise
