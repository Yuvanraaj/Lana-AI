# 🎯 AI Resume Analyzer

A comprehensive AI-powered resume analysis tool that helps users optimize their resumes and find suitable job roles. Features resume parsing, NLP-based skill extraction, scoring, and an admin dashboard.

## 📋 Features

### User Features
- **📤 Resume Upload** - Upload PDF or DOCX files
- **🤖 AI Analysis** - Instant resume analysis using spaCy NLP
- **📊 Detailed Scoring** - Scores for skills, experience, education, and formatting
- **🔍 Skill Extraction** - Automatic extraction of technical and soft skills
- **🎯 Job Role Predictions** - AI-powered job role recommendations
- **💡 Improvement Suggestions** - Actionable recommendations to strengthen resume
- **📚 Learning Resources** - Curated courses and video recommendations
- **📞 Contact Information Extraction** - Automatic email and phone extraction

### Admin Features
- **📊 Analytics Dashboard** - View aggregate statistics and trends
- **📋 Resume Management** - View all uploaded resumes in a structured table
- **📈 Charts & Insights** - Top job roles, most common skills, score statistics
- **⬇️ CSV Export** - Download all resume data as CSV

## 🏗️ Project Structure

```
AI-Resume-Analyzer/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── nlp_processor.py
│   ├── file_processor.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app.py
│   └── requirements.txt
└── README.md
```

## 🚀 Quick Start

### 1. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Setup Frontend

```bash
cd frontend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Configure MySQL

Update `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=resume_analyzer
```

Create database:
```sql
CREATE DATABASE resume_analyzer;
```

### 4. Start Services

**Terminal 1:**
```bash
cd backend && python main.py
```

**Terminal 2:**
```bash
cd frontend && streamlit run app.py
```

Access at: http://localhost:8501

## 📊 Technologies

- FastAPI (Backend)
- Streamlit (Frontend)
- spaCy (NLP)
- MySQL (Database)
- Pandas, Plotly (Data & Visualization)

## 📈 Scoring Methodology

- Skills: 25%
- Experience: 30%
- Education: 20%
- Achievements: 15%
- Formatting: 10%

## 🔌 API Endpoints

- `POST /upload-resume` - Upload and analyze
- `GET /admin/resumes` - Get all resumes
- `GET /admin/analytics` - Get analytics
- `POST /admin/export-csv` - Export data
- `GET /courses` - Course recommendations
- `GET /videos` - Video recommendations

## 🛠️ Customization

Edit `backend/config.py` to:
- Add more skills
- Modify scoring weights
- Add job roles
- Update course recommendations

## 📧 Support

For issues or questions, check the logs or ensure:
- MySQL is running
- spaCy model is downloaded
- All dependencies are installed
- Ports 8000 and 8501 are available

---

**Made with ❤️ for job seekers**
