// Route /resume-parse now renders ResumeAnalyzerPage directly via App.jsx.
// This file is kept as a safe fallback redirect.
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function ResumeParse() {
  const [, navigate] = useLocation();
  useEffect(() => { navigate('/resume-parse', { replace: true }); }, []);
  return null;
}
