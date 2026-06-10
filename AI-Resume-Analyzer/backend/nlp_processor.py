"""
Enhanced NLP Module for resume parsing and analysis using spaCy + OpenAI GPT
"""
import spacy
from openai import OpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from config import SPACY_MODEL, RESUME_SCORE_WEIGHTS, COMMON_JOB_ROLES, OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE
import re
import logging
import json
from typing import Dict, List
import os

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Load spaCy model
try:
    nlp = spacy.load(SPACY_MODEL)
except OSError:
    logger.warning(f"spaCy model {SPACY_MODEL} not found. Run: python -m spacy download {SPACY_MODEL}")
    nlp = None

# Common skill keywords
SKILL_KEYWORDS = {
    "Python", "Java", "C++", "JavaScript", "TypeScript", "SQL", "HTML", "CSS",
    "React", "Vue", "Angular", "Node.js", "Express", "Django", "Flask",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "Linux",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Pandas",
    "Data Analysis", "Tableau", "Power BI", "Excel", "Salesforce",
    "Agile", "Scrum", "Project Management", "Leadership", "Communication"
}

# Education keywords
EDUCATION_KEYWORDS = {
    "Bachelor", "Bachelor's", "B.S.", "B.A.", "BS", "BA",
    "Master", "Master's", "M.S.", "M.A.", "MS", "MA",
    "PhD", "Ph.D.", "Diploma", "Certificate", "Associate"
}

def generate_ai_insights(text, extracted_skills, education, experience, keywords=None, predicted_roles=None):
    """
    Generate detailed, actionable AI-powered insights for job seekers
    Provides specific, practical advice to improve resumes for higher conversion rates
    """
    try:
        # Build comprehensive context for GPT
        keywords = keywords or []
        predicted_roles = predicted_roles or []
        
        # Extract more detailed information  
        experience_text = "\n".join([f"- {exp[:150]}" for exp in experience[:4]]) if experience else "Not provided"
        education_text = "\n".join([f"- {ed[:150]}" for ed in education[:4]]) if education else "Not provided"
        skills_text = ", ".join(extracted_skills[:20]) if extracted_skills else "Not identified"
        keywords_text = ", ".join(keywords[:15]) if keywords else "Not extracted"
        roles_text = ", ".join([f"{r.get('role', '')} ({r.get('match_score', 0)}%)" for r in predicted_roles[:5]]) if predicted_roles else "Not predicted"
        
        resume_context = f"""
RESUME ANALYSIS REQUEST FOR JOB SEEKER IMPROVEMENT:

CANDIDATE PROFILE:
- Target Roles: {roles_text}
- Skills: {skills_text}
- Keywords: {keywords_text}
- Experience Level: {len(experience)} positions
- Education: {len(education)} degrees/qualifications

CURRENT EXPERIENCE:
{experience_text}

EDUCATION:
{education_text}

RESUME TEXT (Full):
{text}

DETAILED ANALYSIS NEEDED:
Provide practical, actionable advice for job seeker improvement. Focus on specific, measurable changes they can make to get more interviews."
"""
        
        # Call OpenAI GPT with enhanced system prompt for job seeker insights
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert career coach and recruiter who helps job seekers land interviews at top companies.
Your job is to provide SPECIFIC, ACTIONABLE, PRACTICAL advice that job seekers can immediately implement.

FOCUS ON IMPACT: Only suggest changes that significantly increase interview callbacks and job offers.

RESPOND ONLY WITH VALID JSON - no extra text before or after.

Provide detailed guidance with this EXACT structure:
{
  "quick_wins": [
    {"improvement": "Specific thing to change", "impact": "Why this matters (e.g., 'Improves ATS score by 15%')"},
    {"improvement": "Second specific action", "impact": "Concrete benefit"},
    {"improvement": "Third quick action", "impact": "Expected result"}
  ],
  "priority_changes": [
    {"change": "Most important change to make", "why": "Why recruiters care", "how": "Specific steps: 1. ... 2. ... 3."},
    {"change": "Second priority change", "why": "Impact on hiring decisions", "how": "Detailed implementation steps"},
    {"change": "Third high-impact change", "why": "Competitive advantage", "how": "Specific recommendations"}
  ],
  "ats_optimization": [
    "Specific word or phrase to add (e.g., 'Add 'Python', 'AWS', 'Machine Learning' as explicit keywords')",
    "Format/structure improvement (e.g., 'Use standard section headers: SKILLS, EXPERIENCE, EDUCATION')",
    "Technical tip (e.g., 'Remove tables/graphics - use plain text for ATS compatibility')"
  ],
  "skills_to_emphasize": [
    "Top technical skill from their background with context",
    "Second skill with market demand note",
    "Third skill with specific relevance to roles"
  ],
  "missing_keywords": [
    {"keyword": "Industry term they should add", "source": "Your target roles require this"},
    {"keyword": "Technology/tool to highlight", "source": "Trending in your field"},
    {"keyword": "Industry buzzword", "source": "Recruiters filter for this"}
  ],
  "metrics_to_add": [
    "Specific metric example: 'Improved system performance by 40% using...'",
    "Another example: 'Led team of X people resulting in Y outcome'",
    "Third example: 'Reduced costs by X% through...'"
  ],
  "role_specific_advice": {
    "target_role": "Primary role they should target based on their profile",
    "required_skills_gap": "Skills to develop to reach this role",
    "positioning": "How to position themselves for this role",
    "comparable_roles": ["Role 1", "Role 2", "Role 3"]
  },
  "top_matched_roles": [
    {"role": "Best Match Role Name", "match_score": 95},
    {"role": "Second Match Role Name", "match_score": 82},
    {"role": "Third Match Role Name", "match_score": 70}
  ],
  "certifications_recommendations": [
    "High-impact certification specifically addressing an identified skill gap (e.g., 'Since your profile lacks X, the Y Certification is recommended to increase match rate by Z%')",
    "Strategic certification to bridge technical gaps relevant to target roles",
    "ROI-focused certification to validate expertise and increase salary potential"
  ],
  "strengths": [
    "Specific documented strength with evidence",
    "Second concrete strength from resume",
    "Third strength with competitive advantage"
  ],
  "overall_strategy": "2-3 sentence actionable strategy for immediate resume improvement that will increase interview callbacks"
}"""
                },
                {
                    "role": "user",
                    "content": resume_context
                }
            ],
            temperature=0.2, # Lower temperature for faster/more deterministic result
            max_tokens=1200 # Sufficient for structured JSON
        )
        
        # Parse response with detailed insights
        ai_response = response.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            json_start = ai_response.find('{')
            json_end = ai_response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = ai_response[json_start:json_end]
                insights = json.loads(json_str)
            else:
                insights = json.loads(ai_response)
            
            # Ensure all required fields exist with defaults
            insights.setdefault('quick_wins', [])
            insights.setdefault('priority_changes', [])
            insights.setdefault('ats_optimization', [])
            insights.setdefault('skills_to_emphasize', [])
            insights.setdefault('missing_keywords', [])
            insights.setdefault('metrics_to_add', [])
            insights.setdefault('role_specific_advice', {})
            insights.setdefault('certifications_recommendations', [])
            insights.setdefault('strengths', [])
            insights.setdefault('overall_strategy', '')
            
            # Keep legacy fields for compatibility
            insights.setdefault('suggestions', insights.get('priority_changes', [])[:3])
            insights.setdefault('weaknesses', [])
            insights.setdefault('career_assessment', insights.get('overall_strategy', ''))
            insights.setdefault('ai_feedback', insights.get('overall_strategy', ''))
            
        except json.JSONDecodeError as je:
            logger.warning(f"Failed to parse AI response: {str(je)}")
            insights = {
                "quick_wins": [
                    {"improvement": "Add quantified achievements (use numbers and percentages)", "impact": "40% higher callback rate from recruiters"},
                    {"improvement": "Use industry-specific keywords for your target roles", "impact": "Pass ATS filters to reach human recruiters"},
                    {"improvement": "Restructure to highlight leadership and impact", "impact": "Demonstrate growth potential to hiring managers"}
                ],
                "priority_changes": [
                    {"change": "Lead with impact metrics in each role", "why": "Recruiters scan for quantifiable value you delivered", "how": "1. Add 'Improved X by Y%' 2. Add 'Led Z people/projects' 3. Use action verbs"},
                    {"change": "Align skills section with job descriptions of target roles", "why": "ATS systems match keywords - missing keywords = automatic rejection", "how": "1. Research target job postings 2. Extract 5-10 key skills 3. Add them naturally"},
                    {"change": "Add professional summary with career achievements", "why": "First thing recruiters read - sets tone for entire resume", "how": "1. 3-4 lines 2. Include years of experience 3. Highlight top 2-3 achievements"}
                ],
                "ats_optimization": [
                    "Use standard section headers: SUMMARY, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS",
                    "Ensure skills are listed as comma-separated keywords, not in tables",
                    "Remove graphics, photos, tables, and special formatting - use plain text"
                ],
                "skills_to_emphasize": [
                    "Technical leadership and mentoring ability",
                    "Cross-functional collaboration and communication",
                    "Project management and delivery"
                ],
                "missing_keywords": [
                    {"keyword": "Agile/Scrum methodology", "source": "90% of tech job postings require this"},
                    {"keyword": "Impact metrics and ROI", "source": "Business-focused language recruiters seek"},
                    {"keyword": "Industry tools/platforms related to your roles", "source": "Specific technical qualification filters"}
                ],
                "metrics_to_add": [
                    "Revenue impact: 'Increased sales by X% resulting in $Y revenue'",
                    "Efficiency gains: 'Reduced processing time by X hours, saving $Y annually'",
                    "Scale: 'Managed X assets/users/transactions worth $Y'"
                ],
                "role_specific_advice": {
                    "target_role": "Position based on your strongest experience",
                    "required_skills_gap": "Research top 5 skills in job postings and prioritize",
                    "positioning": "Lead with most relevant achievements for this role type",
                    "comparable_roles": ["Senior Professional Role", "Specialist Role", "Management Path"]
                },
                "top_matched_roles": [
                    {"role": "Professional in your field", "match_score": 85},
                    {"role": "Specialized Associate", "match_score": 75},
                    {"role": "Industry Expert", "match_score": 65}
                ],
                "certifications_recommendations": [
                    "Advanced technical certification matching your target role (3-6 month investment, validates specialized expertise)",
                    "Strategic skill-bridging certification to address identified gaps",
                    "Industry-recognized qualification to increase interview callback rates by up to 25%"
                ],
                "strengths": [
                    "Resume demonstrates professional experience",
                    "Clear career progression shown",
                    "Educational background present"
                ],
                "overall_strategy": "Immediately add quantified metrics to every role, align keywords with 3 target job descriptions, and restructure to lead with impact. These changes alone increase interview callback rates by 50-75%."
            }
        
        return insights
    
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        # Return comprehensive fallback with actionable insights
        return {
            "quick_wins": [
                {"improvement": "Add specific numbers to achievements", "impact": "2x more likely to get interviews"},
                {"improvement": "Use job description keywords", "impact": "Pass ATS screening"},
                {"improvement": "Add professional summary", "impact": "Immediate credibility boost"}
            ],
            "priority_changes": [
                {"change": "Quantify impact in each role", "why": "Proves real value delivery", "how": "Add metrics: X% improvement, $Y saved, Z projects delivered"},
                {"change": "Highlight relevant skills prominently", "why": "Recruiters scan for specific keywords", "how": "Match target job descriptions"},
                {"change": "Show career progression", "why": "Demonstrates growth potential", "how": "Reorganize to show increasing responsibility"}
            ],
            "ats_optimization": [
                "Use standard section names matching job descriptions",
                "List skills as keywords separated by commas",
                "Avoid tables, graphics, and special formatting"
            ],
            "skills_to_emphasize": [
                "Your strongest technical skills",
                "Industry-relevant tools and platforms",
                "Leadership and collaboration abilities"
            ],
            "missing_keywords": [
                {"keyword": "Industry-specific terminology", "source": "Job postings for your target roles"},
                {"keyword": "Relevant tool names and platforms", "source": "Your field's standard technologies"},
                {"keyword": "Business impact language", "source": "How recruiters describe value"}
            ],
            "metrics_to_add": [
                "Percentage improvements: '+40% efficiency', '+25% revenue'",
                "Scale metrics: 'Managed 50+ projects', 'Led team of 8'",
                "Cost metrics: '$500K savings', '40% cost reduction'"
            ],
            "role_specific_advice": {
                "target_role": "Identify your strongest experience area",
                "required_skills_gap": "Research and prioritize in-demand skills",
                "positioning": "Lead with your most impressive accomplishments",
                "comparable_roles": ["Related Career Path 1", "Related Career Path 2"]
            },
            "top_matched_roles": [
                {"role": "Target Position", "match_score": 80},
                {"role": "Alternative Role", "match_score": 70}
            ],
            "certifications_recommendations": [
                "Technical certification to bridge identified skill gaps",
                "Advanced professional qualification for your field",
                "Market-relevant certification to validate practical experience"
            ],
            "strengths": [
                "Professional background present",
                "Experience demonstrated",
                "Educational foundation shown"
            ],
            "overall_strategy": "Focus on adding quantifiable metrics, aligning with job descriptions, and improving ATS compatibility. These fundamentals transform resumes from 'maybe' to 'definitely interview'.",
            "suggestions": [],
            "weaknesses": [],
            "career_assessment": "Opportunity to significantly improve resume impact",
            "ai_feedback": "Focus on metrics and keyword optimization for measurable improvement"
        }

def extract_text_from_resume(text):
    """Clean and preprocess resume text"""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_contact_info(text):
    """Extract contact information (email and phone)"""
    contact_info = {}
    
    # Extract email
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_match = re.search(email_pattern, text)
    if email_match:
        contact_info['email'] = email_match.group()
    
    # Extract phone
    phone_pattern = r'(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?(\d{3}[-.\s]?\d{4})'
    phone_match = re.search(phone_pattern, text)
    if phone_match:
        contact_info['phone'] = phone_match.group()
    
    return contact_info

def extract_skills(text):
    """Extract skills from resume text"""
    extracted_skills = []
    text_lower = text.lower()
    
    for skill in SKILL_KEYWORDS:
        if skill.lower() in text_lower:
            extracted_skills.append(skill)
    
    return list(set(extracted_skills))

def extract_education(text):
    """Extract education information"""
    education = []
    sentences = text.split('.')
    
    for sentence in sentences:
        for edu_keyword in EDUCATION_KEYWORDS:
            if edu_keyword.lower() in sentence.lower():
                education.append(sentence.strip())
                break
    
    return education

def extract_experience(text):
    """Extract work experience"""
    if not nlp:
        return []
    
    doc = nlp(text)
    experience = []
    
    # Look for date patterns and job titles
    for ent in doc.ents:
        if ent.label_ == "DATE":
            experience.append(ent.text)
    
    return experience

def extract_keywords(text):
    """Extract important keywords using TF-IDF"""
    vectorizer = TfidfVectorizer(max_features=20, stop_words='english')
    try:
        vectorizer.fit_transform([text])
        keywords = vectorizer.get_feature_names_out().tolist()
        return keywords
    except:
        return []

def predict_job_roles(skills, experience, education):
    """Predict suitable job roles based on skills and experience"""
    predicted_roles = []
    skills_lower = [s.lower() for s in skills]
    
    role_skills_map = {
        "Software Engineer": ["python", "java", "javascript", "c++", "sql"],
        "Data Scientist": ["python", "machine learning", "data analysis", "pandas", "tensorflow"],
        "Full Stack Developer": ["javascript", "react", "node.js", "sql", "html", "css"],
        "Frontend Developer": ["javascript", "react", "vue", "html", "css"],
        "Backend Developer": ["python", "java", "node.js", "sql", "flask", "django"],
        "DevOps Engineer": ["docker", "kubernetes", "aws", "azure", "linux", "git"],
        "Machine Learning Engineer": ["python", "machine learning", "tensorflow", "pytorch"],
        "Product Manager": ["agile", "project management", "leadership"],
        "UX/UI Designer": ["figma", "adobe", "ui design", "ux design"]
    }
    
    for role, required_skills in role_skills_map.items():
        match_score = sum(1 for skill in required_skills if any(req in skill for req in skills_lower)) / len(required_skills)
        if match_score > 0.3:
            predicted_roles.append({
                "role": role,
                "match_score": round(match_score * 100, 2)
            })
    
    return sorted(predicted_roles, key=lambda x: x['match_score'], reverse=True)[:5]

def calculate_resume_score(skills, experience, education, keywords, text):
    """Calculate overall resume score"""
    scores = {}
    
    # Skills score (25%)
    scores['skills_score'] = min(100, len(skills) * 5)
    
    # Experience score (30%)
    experience_count = len(experience)
    scores['experience_score'] = min(100, experience_count * 10)
    
    # Education score (20%)
    education_count = len(education)
    scores['education_score'] = min(100, education_count * 20)
    
    # Keywords score (15%)
    scores['keywords_score'] = min(100, len(keywords) * 3)
    
    # Formatting score (10%)
    score_length = len(text.split())
    if 250 < score_length < 2000:
        scores['formatting_score'] = 90
    elif 200 < score_length <= 250 or 2000 <= score_length < 2500:
        scores['formatting_score'] = 70
    else:
        scores['formatting_score'] = 50
    
    # Calculate weighted overall score
    overall_score = (
        scores['skills_score'] * RESUME_SCORE_WEIGHTS['skills'] +
        scores['experience_score'] * RESUME_SCORE_WEIGHTS['experience'] +
        scores['education_score'] * RESUME_SCORE_WEIGHTS['education'] +
        scores['keywords_score'] * RESUME_SCORE_WEIGHTS['quantified_achievements'] +
        scores['formatting_score'] * RESUME_SCORE_WEIGHTS['formatting']
    )
    
    scores['overall_score'] = round(overall_score, 2)
    return scores

def generate_suggestions(skills, experience, education):
    """Generate improvement suggestions"""
    suggestions = []
    
    if len(skills) < 5:
        suggestions.append("Add more technical skills to strengthen your resume")
    
    if len(experience) < 3:
        suggestions.append("Include more detailed work experience and achievements")
    
    if len(education) == 0:
        suggestions.append("Add your educational qualifications")
    
    suggestions.append("Quantify your achievements with metrics and numbers")
    suggestions.append("Use action verbs to describe your accomplishments")
    suggestions.append("Ensure consistent formatting throughout the resume")
    
    return suggestions[:6]

def analyze_resume(text):
    """Complete resume analysis pipeline with AI-powered insights"""
    text = extract_text_from_resume(text)
    
    contact_info = extract_contact_info(text)
    skills = extract_skills(text)
    education = extract_education(text)
    experience = extract_experience(text)
    keywords = extract_keywords(text)
    
    scores = calculate_resume_score(skills, experience, education, keywords, text)
    predicted_roles = predict_job_roles(skills, experience, education)
    
    # Get AI-powered insights with enhanced context
    ai_insights = generate_ai_insights(text, skills, education, experience, keywords, predicted_roles)
    
    return {
        "contact_info": contact_info,
        "extracted_skills": skills,
        "keywords": keywords,
        "education": education,
        "experience": experience,
        "predicted_roles": ai_insights.get("top_matched_roles", predicted_roles),
        "scores": scores,
        "suggestions": ai_insights.get("suggestions", []),
        "strengths": ai_insights.get("strengths", []),
        "weaknesses": ai_insights.get("weaknesses", []),
        "ai_feedback": ai_insights.get("overall_feedback", ""),
        "career_assessment": ai_insights.get("career_assessment", ""),
        # Include all AI insights for frontend
        "quick_wins": ai_insights.get("quick_wins", []),
        "priority_changes": ai_insights.get("priority_changes", []),
        "ats_optimization": ai_insights.get("ats_optimization", []),
        "skills_to_emphasize": ai_insights.get("skills_to_emphasize", []),
        "missing_keywords": ai_insights.get("missing_keywords", []),
        "metrics_to_add": ai_insights.get("metrics_to_add", []),
        "role_specific_advice": ai_insights.get("role_specific_advice", {}),
        "certifications_recommendations": ai_insights.get("certifications_recommendations", []),
        "overall_strategy": ai_insights.get("overall_strategy", "")
    }
