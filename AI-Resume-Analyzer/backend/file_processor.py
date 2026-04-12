"""
File processing module for PDF and DOCX extraction
"""
from PyPDF2 import PdfReader
from docx import Document
import logging
import os

logger = logging.getLogger(__name__)

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            reader = PdfReader(file)
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting from PDF: {e}")
        raise

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    try:
        text = ""
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting from DOCX: {e}")
        raise

def extract_text_from_file(file_path, file_type):
    """Extract text based on file type"""
    if file_type == "pdf":
        return extract_text_from_pdf(file_path)
    elif file_type == "docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

def save_uploaded_file(file, upload_dir, sanitized_filename=None):
    """
    Save uploaded file to disk
    
    Args:
        file: UploadFile object
        upload_dir: Directory to save file
        sanitized_filename: Optional pre-sanitized filename to use
    """
    try:
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # Use sanitized filename if provided, otherwise use original
        filename = sanitized_filename or file.filename
        file_path = os.path.join(upload_dir, filename)
        
        logger.info(f"Saving file to: {file_path}")
        
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        logger.info(f"File saved successfully: {file_path}")
        return file_path
    except Exception as e:
        logger.error(f"Error saving file: {e}", exc_info=True)
        raise
