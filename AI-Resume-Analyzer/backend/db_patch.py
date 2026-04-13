import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
import mysql.connector

try:
    print(f"Connecting to DB {DB_NAME} at {DB_HOST}:{DB_PORT} as {DB_USER}...")
    db = mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        port=DB_PORT,
        auth_plugin='mysql_native_password'
    )
    cursor = db.cursor()
    print("Checking if portal_user_id exists...")
    try:
        cursor.execute("ALTER TABLE resumes ADD COLUMN portal_user_id VARCHAR(100) AFTER phone")
        db.commit()
        print("Column portal_user_id added successfully!")
    except mysql.connector.Error as err:
        if err.errno == 1060: # Duplicate column name
            print("Column portal_user_id already exists.")
        else:
            print(f"Error: {err}")
    
    cursor.close()
    db.close()
except Exception as e:
    print(f"Failed to connect or execute: {e}")
