# 🚀 Quick Start Guide

## ⚡ Quick Setup (Windows)

### Step 1: Create MySQL Database

```sql
CREATE DATABASE resume_analyzer;
```

### Step 2: Setup Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Update `.env` with your MySQL credentials.

### Step 3: Setup Frontend

```powershell
cd frontend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 4: Start Services

**Terminal 1 (Backend):**
```powershell
cd backend
venv\Scripts\activate
python main.py
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
venv\Scripts\activate
streamlit run app.py
```

### Access

- Frontend: http://localhost:8501
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📋 File Structure

```
AI-Resume-Analyzer/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # DB operations
│   ├── nlp_processor.py     # NLP engine
│   ├── file_processor.py    # File handling
│   ├── requirements.txt
│   └── .env                 # Database config
│
└── frontend/
    ├── app.py               # Streamlit app
    └── requirements.txt
```

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| MySQL connection failed | Check credentials in .env |
| spaCy model not found | Run: `python -m spacy download en_core_web_sm` |
| Port already in use | Change PORT in .env or use different port |
| File upload fails | Ensure uploads/ directory exists |

## ✅ Features

✓ Resume upload (PDF/DOCX)
✓ AI-powered analysis
✓ Skill extraction
✓ Score calculation
✓ Job role predictions
✓ Admin dashboard
✓ CSV export
✓ Learning resources

---

**Ready to use! Happy analyzing! 🎯**
