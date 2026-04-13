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
      // Priority: Try Node-native pdf-parse first (faster, no process spawn)
      if (pdfParse) {
        try {
          console.log('[PARSE] Attempting Node-native pdf-parse extraction...');
          const dataBuffer = fs.readFileSync(filePath);
          const parsed = await pdfParse(dataBuffer);
          text = (parsed && parsed.text) ? parsed.text.trim() : '';
          console.log('[PARSE] pdf-parse returned', String(text ? text.length : 0), 'chars');
        } catch (e) {
          console.warn('[PARSE] pdf-parse failed:', e?.message || e);
        }
      }

      // Fallback: Use Python script if Node-native fails or returns low quality text
      if (!text || text.length < 150) {
        console.log('[PARSE] PDF extraction quality low — falling back to Python extractor');
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
          console.warn('[PARSE] Python PDF extract fallback failed:', err?.message || err);
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
    if (!process.env.OPENAI_API_KEY) {
      console.error('[PARSE] ERROR: OPENAI_API_KEY not found in environment');
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Compressed High-Performance System Prompt
    const systemPrompt = `Analyze the provided resume and return ONLY a strict JSON object.
Schema: {
  "name": string, "email": string, "phone": string,
  "education": [{ "degree": string, "institution": string, "year": string }],
  "experience": [{ "title": string, "company": string, "start": string, "end": string, "description": string }],
  "skills": [string], "projects": [{ "name": string, "description": string, "technologies": [string] }],
  "strengths": [string], "weaknesses": [string], "suggestions": [string],
  "score": number, "overall_feedback": string, "ats_keywords": [string],
  "career_level": "entry"|"mid"|"senior"|"executive", "recommended_roles": [string]
}
SCORING (0-100): Be realistic. 85+ is for world-class/senior; 60-80 for solid mid-level; 30-50 for junior.
Detail requirements: 5+ skills, 3+ strengths, 3+ weaknesses, 4+ suggestions. NO explanations.`;

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Fastest model for structured extraction
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const raw = completion.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error('Empty OpenAI response');

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
            parsed = JSON.parse(raw.substring(start, end + 1));
          } catch (e2) { parsed = null; }
        }
      }

      if (!parsed) {
        return res.status(500).json({ error: 'Failed to parse resume analysis.' });
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
      console.error('[PARSE] OpenAI parser error:', err.message);
      res.status(500).json({ error: 'LLM analysis failed', details: err.message });
      return;
    }
  } catch (err) {
    console.error('[PARSE] Global parser error:', err.message);
    res.status(500).json({ error: 'Server error processing resume' });
    return;
  } finally {
    // Cleanup: Async to avoid blocking the response loop
    fs.unlink(filePath, (err) => { if (err) console.error('[PARSE] Buffer cleanup error:', err.message); });
    for (const d of tempDirs) { fs.rm(d, { recursive: true, force: true }, (err) => {}); }
  }
});


module.exports = router;
