"""
Admin user management for database
"""
from database import get_db_connection
from auth import hash_password, verify_password
import psycopg2
import psycopg2.extras
from psycopg2 import Error
import logging

logger = logging.getLogger(__name__)

def create_admin_user(email: str, password: str, full_name: str = None):
    """
    Create a new admin user with hashed password
    
    Args:
        email: Admin email address
        password: Plain text password (will be hashed)
        full_name: Full name of the admin user
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Hash the password
        hashed_pwd = hash_password(password)
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO admin_users (email, full_name, hashed_password, is_active)
            VALUES (%s, %s, %s, TRUE)
        """, (email, full_name or email.split('@')[0], hashed_pwd))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"Admin user created: {email}")
        return True
    except Error as e:
        logger.error(f"Error creating admin user: {e}")
        return False

def verify_admin_credentials(email: str, password: str) -> dict:
    """
    Verify admin credentials against database
    
    Args:
        email: Admin email address
        password: Plain text password to verify
        
    Returns:
        dict: User data if valid, None if invalid
    """
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT id, email, full_name, hashed_password, is_active
            FROM admin_users
            WHERE email = %s
        """, (email,))
        
        user = cursor.fetchone()
        cursor.close()
        connection.close()
        
        if not user:
            logger.warning(f"Admin login attempt with non-existent email: {email}")
            return None
        
        if not user['is_active']:
            logger.warning(f"Admin login attempt with inactive account: {email}")
            return None
        
        # Verify password against hash
        if verify_password(password, user['hashed_password']):
            # Update last_login timestamp
            update_last_login(user['id'])
            return {
                "user_id": user['id'],
                "email": user['email'],
                "full_name": user['full_name']
            }
        else:
            logger.warning(f"Failed admin login attempt (wrong password): {email}")
            return None
            
    except Error as e:
        logger.error(f"Error verifying admin credentials: {e}")
        return None

def update_last_login(user_id: int):
    """Update the last_login timestamp for an admin user"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE admin_users
            SET last_login = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (user_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
    except Error as e:
        logger.error(f"Error updating last_login: {e}")

def admin_user_exists(email: str) -> bool:
    """Check if an admin user already exists"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            SELECT id FROM admin_users WHERE email = %s
        """, (email,))
        
        exists = cursor.fetchone() is not None
        cursor.close()
        connection.close()
        
        return exists
    except Error as e:
        logger.error(f"Error checking if admin exists: {e}")
        return False

def get_all_admin_users():
    """Get all admin users (for management purposes)"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        cursor.execute("""
            SELECT id, email, full_name, is_active, created_at, last_login
            FROM admin_users
            ORDER BY created_at DESC
        """)
        
        users = cursor.fetchall()
        cursor.close()
        connection.close()
        
        return users
    except Error as e:
        logger.error(f"Error retrieving admin users: {e}")
        return []

def deactivate_admin_user(user_id: int):
    """Deactivate an admin user without deleting"""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE admin_users
            SET is_active = FALSE
            WHERE id = %s
        """, (user_id,))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"Admin user deactivated: {user_id}")
        return True
    except Error as e:
        logger.error(f"Error deactivating admin user: {e}")
        return False

def update_password(user_id: int, new_password: str):
    """Update admin user password"""
    try:
        hashed_pwd = hash_password(new_password)
        
        connection = get_db_connection()
        cursor = connection.cursor()
        
        cursor.execute("""
            UPDATE admin_users
            SET hashed_password = %s
            WHERE id = %s
        """, (hashed_pwd, user_id))
        
        connection.commit()
        cursor.close()
        connection.close()
        
        logger.info(f"Admin user password updated: {user_id}")
        return True
    except Error as e:
        logger.error(f"Error updating admin password: {e}")
        return False
