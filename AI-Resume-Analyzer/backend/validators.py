"""
Input Validation and Sanitization Module
"""
import re
import logging
from typing import Any, Dict, List
from fastapi import HTTPException, status
from pathlib import Path

logger = logging.getLogger(__name__)

# ============ File Validation ============

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc'}
MAX_FILENAME_LENGTH = 255
DANGEROUS_PATTERNS = [
    r'\.\./',  # Path traversal
    r'\.\.\\',
    r'[<>:"|?*]',  # Invalid filename characters on Windows
]

def validate_file_extension(filename: str) -> bool:
    """Validate file extension is allowed"""
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def validate_filename(filename: str) -> tuple[bool, str]:
    """
    Validate filename for security issues
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    # Check length
    if len(filename) > MAX_FILENAME_LENGTH:
        return False, f"Filename too long (max {MAX_FILENAME_LENGTH} characters)"
    
    # Check for dangerous patterns
    for pattern in DANGEROUS_PATTERNS:
        if re.search(pattern, filename):
            return False, "Filename contains invalid characters"
    
    # Check for null bytes
    if '\x00' in filename:
        return False, "Filename contains null bytes"
    
    return True, ""

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing/replacing dangerous characters
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove path components
    filename = Path(filename).name
    
    # Replace dangerous characters with underscore
    sanitized = re.sub(r'[<>:"|?*]', '_', filename)
    
    # Remove leading dots (hidden files on Unix)
    sanitized = sanitized.lstrip('.')
    
    # Truncate if too long
    if len(sanitized) > MAX_FILENAME_LENGTH:
        name, ext = Path(sanitized).stem, Path(sanitized).suffix
        sanitized = name[:MAX_FILENAME_LENGTH - len(ext)] + ext
    
    return sanitized if sanitized else "file"

# ============ Text Input Validation ============

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email)) and len(email) <= 254

def validate_phone(phone: str) -> bool:
    """Validate phone number format"""
    # Remove common formatting
    cleaned = re.sub(r'[\s\-\(\)\.]+', '', phone)
    # Allow 7-15 digits (international range)
    return bool(re.match(r'^\+?1?\d{6,14}$', cleaned)) and len(cleaned) <= 15

def validate_name(name: str) -> tuple[bool, str]:
    """
    Validate person name
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not name or len(name.strip()) == 0:
        return False, "Name cannot be empty"
    
    if len(name) > 200:
        return False, "Name is too long (max 200 characters)"
    
    # Allow letters, spaces, hyphens, apostrophes
    if not re.match(r"^[a-zA-Z\s\-'\.]+$", name):
        return False, "Name contains invalid characters"
    
    # Prevent excessive spaces
    if '  ' in name:
        return False, "Name contains excessive spaces"
    
    return True, ""

def validate_url(url: str) -> bool:
    """Validate URL format"""
    url_pattern = r'^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$'
    return bool(re.match(url_pattern, url))

# ============ SQL Injection Prevention ============

def sanitize_sql_string(value: str) -> str:
    """
    Sanitize string for SQL context
    WARNING: Use parameterized queries instead when possible!
    """
    if not isinstance(value, str):
        return str(value)
    
    # Escape single quotes
    return value.replace("'", "''")

def validate_sql_query_safe(query: str) -> bool:
    """
    Check if query contains dangerous SQL patterns
    WARNING: This is not comprehensive! Use parameterized queries!
    """
    dangerous_patterns = [
        r'(?i)union\s+select',
        r'(?i)drop\s+table',
        r'(?i)delete\s+from',
        r'(?i)insert\s+into',
        r'(?i)update.*set',
        r'(?i)exec\s*\(',
        r'(?i)execute\s*\(',
        r"'.*or.*'.*=.*'",  # OR-based injection
    ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, query):
            return False
    
    return True

# ============ XSS Prevention ============

def sanitize_html(text: str) -> str:
    """
    Sanitize text to remove HTML/JavaScript
    WARNING: For full HTML safety, use bleach library
    """
    # Remove common HTML/JS patterns
    patterns = [
        r'<script[^>]*>.*?</script>',
        r'<iframe[^>]*>.*?</iframe>',
        r'javascript:',
        r'on\w+\s*=',  # event handlers
        r'<embed[^>]*>',
        r'<object[^>]*>',
    ]
    
    sanitized = text
    for pattern in patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE | re.DOTALL)
    
    return sanitized.strip()

# ============ Form Data Validation ============

def validate_form_data(data: Dict[str, Any], schema: Dict[str, dict]) -> tuple[bool, List[str]]:
    """
    Validate form data against schema
    
    Args:
        data: Form data to validate
        schema: Validation schema with keys and validation rules
               format: {'field_name': {'type': 'string', 'required': True, 'max_length': 100}}
    
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    for field_name, rules in schema.items():
        value = data.get(field_name)
        
        # Check required fields
        if rules.get('required', False) and (value is None or value == ''):
            errors.append(f"{field_name} is required")
            continue
        
        if value is None or value == '':
            continue
        
        # Validate by type
        field_type = rules.get('type', 'string')
        
        if field_type == 'email':
            if not validate_email(value):
                errors.append(f"{field_name} is not a valid email")
        
        elif field_type == 'phone':
            if not validate_phone(value):
                errors.append(f"{field_name} is not a valid phone number")
        
        elif field_type == 'url':
            if not validate_url(value):
                errors.append(f"{field_name} is not a valid URL")
        
        elif field_type == 'string':
            if not isinstance(value, str):
                errors.append(f"{field_name} must be a string")
            elif rules.get('max_length') and len(value) > rules['max_length']:
                errors.append(f"{field_name} exceeds max length of {rules['max_length']}")
            elif rules.get('min_length') and len(value) < rules['min_length']:
                errors.append(f"{field_name} must be at least {rules['min_length']} characters")
        
        elif field_type == 'integer':
            try:
                int(value)
            except (ValueError, TypeError):
                errors.append(f"{field_name} must be an integer")
        
        elif field_type == 'float':
            try:
                float(value)
            except (ValueError, TypeError):
                errors.append(f"{field_name} must be a number")
    
    return len(errors) == 0, errors

# ============ Batch Validation ============

def validate_resume_upload_data(user_name: str, email: str, phone: str) -> tuple[bool, List[str]]:
    """Validate resume upload form data"""
    errors = []
    
    # Validate name
    is_valid, error = validate_name(user_name)
    if not is_valid:
        errors.append(f"Name: {error}")
    
    # Validate email
    if not validate_email(email):
        errors.append("Invalid email format")
    
    # Validate phone
    if phone and phone != "Not Provided" and phone.strip() != "":
        if not validate_phone(phone):
            errors.append("Invalid phone format")
    
    return len(errors) == 0, errors

# ============ Exception Handlers ============

class ValidationError(HTTPException):
    """Custom validation error exception"""
    def __init__(self, detail: str, errors: List[str] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
        self.errors = errors or []

def log_validation_failure(field: str, reason: str, user_input: str = None):
    """Log validation failures for security monitoring"""
    logger.warning(
        f"Validation failure - Field: {field}, Reason: {reason}, Input: {user_input[:50] if user_input else 'N/A'}..."
    )
