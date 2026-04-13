"""
Configuration settings for the Resume Analyzer backend
"""
import os
from dotenv import load_dotenv

# Load .env from this directory
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# Database Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "resume_analyzer")
DB_PORT = int(os.getenv("DB_PORT", 3306))

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8000))
API_RELOAD = os.getenv("API_RELOAD", "True") == "True"

# File Upload Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", 10 * 1024 * 1024))  # 10MB

# NLP Configuration
SPACY_MODEL = os.getenv("SPACY_MODEL", "en_core_web_sm")

# Security Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production-min-32-chars")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
PORTAL_SHARED_SECRET = os.getenv("PORTAL_SHARED_SECRET", "")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
).split(",")

# Rate Limiting Configuration
RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", 100))
RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", 60))

# Security Headers
REQUIRE_HTTPS = os.getenv("REQUIRE_HTTPS", "false").lower() == "true"
CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
CORS_EXPOSE_HEADERS = os.getenv("CORS_EXPOSE_HEADERS", "X-Total-Count,X-Page-Count").split(",")

# Admin Configuration
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "admin@example.com").split(",")

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", 500))
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", 0.7))

RESUME_SCORE_WEIGHTS = {
    "skills": 0.25,
    "experience": 0.30,
    "education": 0.20,
    "quantified_achievements": 0.15,
    "formatting": 0.10
}

# Common Job Roles
COMMON_JOB_ROLES = [
    "Software Engineer", "Data Scientist", "Full Stack Developer",
    "Frontend Developer", "Backend Developer", "DevOps Engineer",
    "Machine Learning Engineer", "Product Manager", "UX/UI Designer"
]

# Course Recommendations - Comprehensive Learning Paths
COURSE_RECOMMENDATIONS = {
    "Python": {
        "Coursera": "https://www.coursera.org/learn/python-for-everybody",
        "Udemy": "https://www.udemy.com/course/complete-python-bootcamp/",
        "edX": "https://www.edx.org/learn/python",
        "DataCamp": "https://www.datacamp.com/courses/intro-to-python-for-data-science",
        "Codecademy": "https://www.codecademy.com/learn/learn-python-3"
    },
    "Data Science": {
        "Coursera": "https://www.coursera.org/specializations/data-science",
        "Udacity": "https://www.udacity.com/course/data-scientist-nanodegree--nd025",
        "edX": "https://www.edx.org/professional-certificate/data-science",
        "DataCamp": "https://www.datacamp.com/tracks/data-scientist-with-python",
        "Fast.ai": "https://www.fast.ai/"
    },
    "Machine Learning": {
        "Coursera": "https://www.coursera.org/learn/machine-learning",
        "Udacity": "https://www.udacity.com/course/machine-learning-engineer-nanodegree--nd009",
        "edX": "https://www.edx.org/professional-certificate/machine-learning",
        "Andrew Ng": "https://www.deeplearning.ai/",
        "Kaggle": "https://www.kaggle.com/learn/intro-to-machine-learning"
    },
    "Web Development": {
        "freeCodeCamp": "https://www.freecodecamp.org/learn/responsive-web-design/",
        "Codecademy": "https://www.codecademy.com/learn/paths/full-stack-engineer-career-path",
        "Udemy": "https://www.udemy.com/course/the-complete-web-developer-zero-to-mastery/",
        "Coursera": "https://www.coursera.org/specializations/web-design",
        "Treehouse": "https://teamtreehouse.com/tracks/web-design"
    },
    "Frontend Development": {
        "Udemy": "https://www.udemy.com/course/react-the-complete-guide-w-redux/",
        "Frontend Masters": "https://frontendmasters.com/",
        "Codecademy": "https://www.codecademy.com/learn/learn-react-a",
        "freeCodeCamp": "https://www.freecodecamp.org/learn/front-end-development-libraries/",
        "Egghead": "https://egghead.io/"
    },
    "Backend Development": {
        "Udemy": "https://www.udemy.com/course/nodejs-the-complete-guide/",
        "Coursera": "https://www.coursera.org/specializations/server-side-nodejs",
        "Codecademy": "https://www.codecademy.com/learn/learn-express",
        "Treehouse": "https://teamtreehouse.com/tracks/python-web-development",
        "Real Python": "https://realpython.com/"
    },
    "DevOps & Cloud": {
        "A Cloud Guru": "https://www.pluralsight.com/cloud-guru",
        "Linux Academy": "https://www.pluralsight.com/",
        "Udemy": "https://www.udemy.com/course/docker-kubernetes-the-complete-guide/",
        "Coursera": "https://www.coursera.org/specializations/cloud-computing",
        "AWS Training": "https://aws.amazon.com/training/"
    },
    "Mobile Development": {
        "Udemy": "https://www.udemy.com/course/the-complete-react-native-course/",
        "Google Developers": "https://developer.android.com/courses",
        "Swift Playgrounds": "https://www.apple.com/swift/playgrounds/",
        "Codecademy": "https://www.codecademy.com/learn/learn-swift",
        "Flutter": "https://flutter.dev/learn"
    },
    "Database & SQL": {
        "Coursera": "https://www.coursera.org/learn/introduction-to-sql",
        "DataCamp": "https://www.datacamp.com/courses/intro-to-sql",
        "Udemy": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
        "Khan Academy": "https://www.khanacademy.org/computing/computer-programming/sql",
        "Mode Analytics": "https://mode.com/sql-tutorial/"
    },
    "AWS & Cloud Computing": {
        "AWS Skill Builder": "https://skillbuilder.aws/",
        "Linux Academy": "https://www.pluralsight.com/paths/aws-solutions-architect-associate",
        "Udemy": "https://www.udemy.com/course/aws-certified-solutions-architect-associate/",
        "Coursera": "https://www.coursera.org/specializations/aws-fundamentals",
        "A Cloud Guru": "https://www.pluralsight.com/cloud-guru/courses/aws-certified-solutions-architect-associate"
    },
    "Git & Version Control": {
        "Codecademy": "https://www.codecademy.com/learn/learn-git",
        "Coursera": "https://www.coursera.org/learn/version-control-with-git",
        "Udemy": "https://www.udemy.com/course/git-complete/",
        "Atlassian": "https://www.atlassian.com/git/tutorials",
        "GitHub Learning Lab": "https://lab.github.com/"
    }
}

# YouTube Resources - Video Learning Path
YOUTUBE_RECOMMENDATIONS = {
    "Resume Writing Tips": "https://www.youtube.com/results?search_query=resume+writing+tips+2024",
    "Interview Preparation": "https://www.youtube.com/results?search_query=technical+interview+preparation",
    "Python Basics": "https://www.youtube.com/results?search_query=python+for+beginners",
    "Web Development": "https://www.youtube.com/results?search_query=web+development+tutorial",
    "React Tutorial": "https://www.youtube.com/results?search_query=react+js+tutorial+for+beginners",
    "Node.js Backend": "https://www.youtube.com/results?search_query=nodejs+backend+development",
    "Docker & Kubernetes": "https://www.youtube.com/results?search_query=docker+kubernetes+tutorial",
    "Data Science": "https://www.youtube.com/results?search_query=data+science+tutorial",
    "Machine Learning": "https://www.youtube.com/results?search_query=machine+learning+for+beginners",
    "SQL Database": "https://www.youtube.com/results?search_query=sql+database+tutorial",
    "AWS Cloud": "https://www.youtube.com/results?search_query=aws+cloud+computing+tutorial",
    "API Development": "https://www.youtube.com/results?search_query=rest+api+development",
    "System Design": "https://www.youtube.com/results?search_query=system+design+interview",
    "Git & GitHub": "https://www.youtube.com/results?search_query=git+github+tutorial",
    "Mobile App Dev": "https://www.youtube.com/results?search_query=mobile+app+development+tutorial"
}

# Extended Guides & Best Practices
RESOURCE_GUIDES = {
    "ATS-Friendly Formatting": {
        "description": "Learn how to format your resume so it passes Applicant Tracking Systems",
        "tags": ["ATS", "Formatting"]
    },
    "Keywords That Matter": {
        "description": "Discover high-impact keywords for your target industry",
        "tags": ["Keywords", "Optimization"]
    },
    "Action Verbs Guide": {
        "description": "Power action verbs that make your achievements stand out",
        "tags": ["Writing", "Tips"]
    },
    "Skill Showcase Strategy": {
        "description": "Best ways to organize and present your skills",
        "tags": ["Skills", "Strategy"]
    },
    "Quantifying Achievements": {
        "description": "How to measure and showcase your impact with metrics",
        "tags": ["Metrics", "Achievement"]
    },
    "Technical Skills in Resume": {
        "description": "Best practices for listing programming languages and tools",
        "tags": ["Technical", "Skills"]
    },
    "Experience Section Mastery": {
        "description": "Craft compelling job descriptions using STAR method",
        "tags": ["Experience", "STAR"]
    },
    "Education & Certifications": {
        "description": "How to highlight education, certifications, and continuous learning",
        "tags": ["Education", "Certifications"]
    },
    "Projects & Portfolio": {
        "description": "Effectively showcase your projects and GitHub portfolio",
        "tags": ["Portfolio", "Projects"]
    }
}

# Resume Strategy Do's and Don'ts
RESUME_TIPS_DO = [
    "Keep to 1-2 pages (max 1 for early career)",
    "Tailor each resume to job description",
    "Quantify your achievements with numbers and metrics",
    "Use industry-specific keywords and terminology",
    "Proofread multiple times for typos and errors",
    "Include measurable impact & ROI (e.g., '30% efficiency gain')",
    "Use consistent formatting and font throughout",
    "Update frequently with recent work accomplishments",
    "Lead with most relevant experience first",
    "Use bullet points for easy scanning",
    "Include links to portfolio, GitHub, or LinkedIn",
    "Highlight leadership and collaboration skills",
    "Use power action verbs to start descriptions",
    "Include relevant certifications and training",
    "Keep file name professional (Name_Resume.pdf)"
]

RESUME_TIPS_DONT = [
    "Generic objective statements without specifics",
    "Unprofessional email addresses (use firstname.lastname@...)",
    "Irrelevant work history from 15+ years ago",
    "Poor formatting, incomplete sections, or strange fonts",
    "Typos, grammatical errors, or inconsistent spacing",
    "Excessive jargon, acronyms, or technical terms without context",
    "Personal info (photo, age, marital status, political views)",
    "Unexplained gaps in employment without brief context",
    "Personal data like SSN, driver license, or birth date",
    "Reasons for leaving previous jobs (save for interview)",
    "Unprofessional social media handles or links",
    "Inconsistent date formats or missing dates",
    "Too many different fonts or colors",
    "Lengthy paragraphs instead of concise bullet points",
    "False information or exaggerated accomplishments"
]
