const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const OpenAI = require('openai');
require('dotenv').config();

let mammoth;
try {
  mammoth = require('mammoth');
} catch {
  mammoth = null;
}

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
let pdfParse = null;
try {
  pdfParse = require('pdf-parse');
} catch (e) {
  pdfParse = null;
}

/* ------------------------- 🖼️ PDF OCR Conversion Helper -------------------------- */
function pdfToPngs(pdfPath, numPages = 5) {
  const outDir = path.join(path.dirname(pdfPath), `pdf_images_${Date.now()}`);
  fs.mkdirSync(outDir, { recursive: true });
  const cmd = `pdftoppm -png -f 1 -l ${numPages} "${pdfPath}" "${path.join(outDir, 'page')}"`;
  execSync(cmd, { stdio: 'ignore' });
  return { outDir, files: fs.readdirSync(outDir).filter(f => f.endsWith('.png')).map(f => path.join(outDir, f)) };
}

/* ------------------------------ 🔍 OCR using Tesseract ---------------------------- */
// async function ocrImages(images) {
//   let text = '';
//   for (const img of images) {
//     try {
//       const { data } = await Tesseract.recognize(img, 'eng');
//       text += '\n' + data.text;
//     } catch (err) {
//       console.error('OCR error:', err.message);
//     }
//   }
//   return text.trim();
// }

/* ----------------------------- 🚀 Main Parse Route ------------------------------- */
router.post('/', upload.single('resume'), async (req, res) => {
  console.log('[PARSE] === Resume Upload Started ===');
  
  if (!req.file) {
    console.error('[PARSE] No file provided');
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  console.log('[PARSE] File received:', { originalName: req.file.originalname, size: req.file.size, path: req.file.path });

  const filePath = path.resolve(req.file.path);
  const ext = path.extname(req.file.originalname).toLowerCase();
  let text = '';
  const tempDirs = [];

  console.log('[PARSE] Processing file:', { filePath, ext });

  try {
    // 📄 Step 1: Extract text
    if (ext === '.pdf') {
      // Use Python script with pdfplumber/pypdf for PDF extraction (preferred)
      console.log('[PARSE] PDF detected — attempting Python extractor');
      try {
        const { spawnSync } = require('child_process');
        const py = spawnSync('python', [
          path.join(__dirname, '../tools/pdf_extract.py'),
          filePath
        ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
        if (py.error) throw py.error;
        text = (py.stdout || '').trim();
        console.log('[PARSE] Python extractor returned', String(text ? text.length : 0), 'chars');
      } catch (err) {
        console.warn('[PARSE] Python PDF extract failed:', err?.message || err);
        text = '';
      }

      // If python extractor didn't return useful text, try Node pdf-parse as a fallback
      if ((!text || text.length < 50) && pdfParse) {
        try {
          console.log('[PARSE] Falling back to Node pdf-parse');
          const dataBuffer = fs.readFileSync(filePath);
          const parsed = await pdfParse(dataBuffer);
          text = (parsed && parsed.text) ? parsed.text.trim() : '';
          console.log('[PARSE] pdf-parse returned', String(text ? text.length : 0), 'chars');
        } catch (e) {
          console.warn('[PARSE] pdf-parse fallback failed:', e?.message || e);
        }
      }
    } else if (ext === '.doc' || ext === '.docx') {
      if (!mammoth) return res.status(500).json({ error: 'DOC/DOCX not supported. Install mammoth.' });
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value.trim();
    } else {
      return res.status(400).json({ error: 'Only PDF, DOC, and DOCX files are supported.' });
    }

    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Could not extract usable text from resume. Please ensure the file is valid and contains readable content.' });
    }

    // 👌 Step 2: Verify OpenAI API Key
    console.log('[PARSE] Verifying OpenAI configuration...');
    console.log('[PARSE] OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
    console.log('[PARSE] OPENAI_MODEL:', process.env.OPENAI_MODEL || 'gpt-4o-mini');

    if (!process.env.OPENAI_API_KEY) {
      console.error('[PARSE] ERROR: OPENAI_API_KEY not found in environment');
      return res.status(500).json({ error: 'OpenAI API key not configured on server', details: 'OPENAI_API_KEY environment variable is missing' });
    }

    // Use OpenAI SDK to produce a strict JSON analysis following the schema.
    const systemPrompt = `
You are an expert HR professional, technical recruiter, and career coach with 15+ years of experience evaluating resumes across all industries.

Carefully read the full resume text provided and return ONLY a valid JSON object strictly following this schema — no markdown, no explanation outside the JSON:

{
  "name": string | null,
  "email": string | null,
  "phone": string | null,
  "education": [ { "degree": string, "institution": string, "year": string | null } ],
  "experience": [ { "title": string, "company": string, "start": string | null, "end": string | null, "description": string } ],
  "skills": [ "string" ],
  "projects": [ { "name": string, "description": string, "technologies": [ "string" ] } ],
  "strengths": [ "string" ],
  "weaknesses": [ "string" ],
  "suggestions": [ "string" ],
  "score": number,
  "overall_feedback": string,
  "ats_keywords": [ "string" ],
  "career_level": "entry" | "mid" | "senior" | "executive",
  "recommended_roles": [ "string" ]
}

SCORING GUIDELINES (Score 0-100):
- Score 90-100: Exceptional resume with clear career progression, 5+ years experience, technical depth, quantified achievements, strong education, multiple projects. No gaps.
- Score 80-89: Strong resume with 3-5 years experience, good technical skills (5+ listed), multiple achievements with metrics, relevant education, 1-2 projects. Minor gaps.
- Score 70-79: Solid resume with 1-3 years experience OR 5+ years with limited technical depth. 3-4 key skills, some quantified results, relevant background, basic structure.
- Score 60-69: Fair resume with vague experience description, limited technical skills (2-3), missing metrics/impact data, basic education, inconsistent formatting.
- Score 50-59: Weak resume with <1 year experience OR minimal skills mentioned, very few achievements, missing date ranges or company info, gaps not explained.
- Score 0-49: Very weak resume with almost no content, unverifiable information, critical red flags, or extremely sparse data.

REALISTIC SCORING FACTORS:
- +15 pts: 5+ years demonstrated experience
- +10 pts: 3-5 years demonstrated experience
- +5 pts: <2 years or entry-level with projects
- +15 pts: 6+ technical skills clearly listed and relevant
- +10 pts: 4-5 technical skills mentioned
- +5 pts: 2-3 technical skills mentioned
- +20 pts: Multiple achievements quantified with metrics (%, $, time, users, etc.)
- +12 pts: Some achievements quantified
- +5 pts: Achievements listed but not quantified
- +10 pts: Advanced degree (MS/MBA) or strong certifications
- +5 pts: Bachelor's degree or basic certifications
- +8 pts: 2+ notable projects with technologies listed
- +5 pts: 1 project mentioned
- +5 pts: Clean formatting, no spelling errors
- -10 pts: Spelling/grammar errors
- -15 pts: Unexplained employment gaps
- -10 pts: No contact info or email
- -5 pts: Weak or irrelevant summary

REALISTIC SCORING COMPARISON:
- A fresh graduate with internship: 25-35
- Junior dev (1-2 yrs) with basic skills: 40-55
- Mid-level dev (3-4 yrs) with good portfolio: 60-75
- Senior dev (5+ yrs) strong background: 75-90
- Principal/Lead (10+ yrs) multi-company: 85-100

OTHER FIELDS:
- "strengths": List 4-6 specific, evidence-based strengths from the resume (e.g., "5+ years of hands-on Python development across 3 companies").
- "weaknesses": List 3-5 honest gaps or red flags (e.g., "No quantified achievements — metrics like % improvement or $ impact are absent").
- "suggestions": List 4-6 actionable, specific improvements (e.g., "Add a summary section targeting your desired role", "Quantify at least 3 bullet points per job").
- "overall_feedback": Write 3-4 sentences with specific, realistic assessment.
- "career_level": Assess seniority based on total experience and scope.
- "recommended_roles": 3-5 specific job titles matching their actual skills/experience.
If data is missing, use null or [].
CRITICAL: Score must vary significantly based on actual resume content. Do NOT give all resumes the same score.`;

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this resume thoroughly and return the JSON assessment with a realistic, differentiated score based on the content:\n\n${text}` }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const raw = completion.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error('Empty OpenAI response');

      // Try to parse JSON strictly, with a tolerant fallback
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
            parsed = JSON.parse(raw.substring(start, end + 1));
          } catch (e2) {
            parsed = null;
          }
        }
      }

      if (!parsed) {
        console.error('[PARSE] OpenAI returned non-JSON output');
        return res.status(500).json({ error: 'Failed to parse resume analysis. Please try again.' });
      }

      const normalized = {
        name: parsed.name ?? null,
        email: parsed.email ?? null,
        phone: parsed.phone ?? null,
        education: Array.isArray(parsed.education) ? parsed.education : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        projects: Array.isArray(parsed.projects) ? parsed.projects : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        score: typeof parsed.score === 'number' ? parsed.score : null,
        overall_feedback: parsed.overall_feedback ?? null,
        ats_keywords: Array.isArray(parsed.ats_keywords) ? parsed.ats_keywords : [],
        career_level: parsed.career_level ?? null,
        recommended_roles: Array.isArray(parsed.recommended_roles) ? parsed.recommended_roles : []
      };

      return res.json({ success: true, feedback: normalized, fallback: false });
    } catch (err) {
      console.error('[PARSE] OpenAI parser error:', err.message || err);
      console.error('[PARSE] Full error:', err);
      res.status(500).json({ error: 'Failed to analyze resume with OpenAI', details: err.message });
      return;
    }
  } catch (err) {
    console.error('[PARSE] Parser error:', err);
    console.error('[PARSE] Error stack:', err.stack);
    res.status(500).json({ error: 'Server error processing resume', details: err.message });
    return;
  } finally {
    console.log('[PARSE] Cleanup: Removing temporary files');
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    for (const d of tempDirs) { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} }
    console.log('[PARSE] === Resume Upload Completed ===');
  }
});

module.exports = router;
