"""
Resume AI - Premium Dark Mode SaaS Platform
World-Class AI Resume Analysis with Luxury Design System
Production-ready Streamlit application with enterprise UX
"""

import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import json

# ============================================================================
# PAGE CONFIGURATION
# ============================================================================

st.set_page_config(
    page_title="Resume AI - Professional Resume Analysis",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
    menu_items=None
)

# ============================================================================
# PREMIUM DARK MODE CSS - COMPLETE DESIGN SYSTEM
# ============================================================================

def load_css(file_path):
    with open(file_path) as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Load centralized CSS
load_css("styles/main.css")

# ============================================================================
# API CONFIGURATION
# ============================================================================

API_URL = "http://localhost:8000"

# ============================================================================
# CACHED API FUNCTIONS (Optimized for Performance)
# ============================================================================

@st.cache_data(ttl=300, show_spinner=False)  # Cache for 5 minutes
def fetch_analytics_data(token):
    """Fetch analytics data with caching"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/admin/analytics", headers=headers)
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 401:
        return {"error": "Unauthorized"}
    return None

@st.cache_data(ttl=300, show_spinner=False)  # Cache for 5 minutes
def fetch_resumes_data(token, limit=100, offset=0):
    """Fetch resumes data with caching and pagination"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/admin/resumes", headers=headers, params={"limit": limit, "offset": offset})
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 401:
        return {"error": "Unauthorized"}
    return None

@st.cache_data(ttl=3600, show_spinner=False)  # Cache for 1 hour
def fetch_courses():
    try:
        response = requests.get(f"{API_URL}/courses", timeout=5)
        if response.status_code == 200: return response.json()
    except: pass
    return {}

@st.cache_data(ttl=3600, show_spinner=False)
def fetch_videos():
    try:
        response = requests.get(f"{API_URL}/videos", timeout=5)
        if response.status_code == 200: return response.json()
    except: pass
    return {}

@st.cache_data(ttl=3600)
def fetch_guides():
    try:
        response = requests.get(f"{API_URL}/guides", timeout=5)
        if response.status_code == 200: return response.json()
    except: pass
    return {}

@st.cache_data(ttl=3600)
def fetch_tips():
    try:
        response = requests.get(f"{API_URL}/tips", timeout=5)
        if response.status_code == 200: return response.json()
    except: pass
    return {}


# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================

# Unified Auth: Read query parameters from portal
if hasattr(st, "query_params"):
    # Streamlit >= 1.30.0
    portal_name = st.query_params.get("name", "")
    portal_email = st.query_params.get("email", "")
    portal_uid = st.query_params.get("uid", "")
    portal_atoken = st.query_params.get("atoken", "")
else:
    # Streamlit < 1.30.0
    query_params = st.experimental_get_query_params()
    portal_name = query_params.get("name", [""])[0] if "name" in query_params else ""
    portal_email = query_params.get("email", [""])[0] if "email" in query_params else ""
    portal_uid = query_params.get("uid", [""])[0] if "uid" in query_params else ""
    portal_atoken = query_params.get("atoken", [""])[0] if "atoken" in query_params else ""

if 'current_page' not in st.session_state:
    st.session_state.current_page = 'Upload Resume'
if 'analysis_result' not in st.session_state:
    st.session_state.analysis_result = None

# Initialize session state keys
if 'admin_token' not in st.session_state:
    st.session_state.admin_token = None
if 'login_failed' not in st.session_state:
    st.session_state.login_failed = False
if 'login_source' not in st.session_state:
    st.session_state.login_source = 'manual'

# Unified Auth: Read query parameters from portal
if hasattr(st, "query_params"):
    p_atoken = st.query_params.get("atoken", "")
    p_token = st.query_params.get("token", "")
    portal_token_val = p_atoken if p_atoken else p_token
    
    if portal_token_val and st.session_state.admin_token is None:
        # Only set if we haven't explicitly failed in this session
        if not st.session_state.login_failed:
            st.session_state.admin_token = portal_token_val
            st.session_state.login_source = 'portal'

# Store portal user info in session state
if 'portal_user' not in st.session_state:
    st.session_state.portal_user = {
        "name": portal_name,
        "email": portal_email,
        "uid": portal_uid
    }

# ============================================================================
# PREMIUM UTILITY FUNCTIONS
# ============================================================================

def render_header(title: str, subtitle: str = ""):
    """Render premium rockstar page header"""
    subtitle_html = f'<p class="rockstar-page-subtitle" style="color: var(--text-tertiary); opacity: 0.9; font-size: 1rem; margin-top: 0.5rem;">{subtitle}</p>' if subtitle else ''
    st.markdown(f"""
        <div class="rockstar-page-header" style="margin-bottom: 3rem; padding-left: 1rem; border-left: 4px solid var(--accent-primary);">
            <h1 class="rockstar-page-title" style="margin: 0; font-size: 2.75rem; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF;">{title}</h1>
            {subtitle_html}
        </div>
    """, unsafe_allow_html=True)

def render_radial_gauge(label: str, value: float, color: str = "var(--accent-primary)"):
    """Render a premium radial gauge using SVG"""
    percentage = min(max(value, 0), 100)
    dash_array = (percentage / 100) * 283
    
    html = f"""
    <div class='gauge-container'>
        <svg class='gauge-svg' viewBox='0 0 100 100'>
            <circle class='gauge-bg' cx='50' cy='50' r='45'></circle>
            <circle class='gauge-fill' cx='50' cy='50' r='45' 
                style='stroke-dasharray: {dash_array} 283; stroke: {color};'></circle>
        </svg>
        <div class='gauge-value'>{int(percentage)}%</div>
        <div style='text-align: center; font-size: 0.8rem; font-weight: 800; color: #FFFFFF; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.05em;'>{label}</div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def render_kpi_card(label: str, value: str, change: str = ""):
    """Render KPI card"""
    change_html = f"<div style='font-size: 12px; margin-top: 12px; color: var(--text-tertiary);'>{change}</div>" if change else ""
    html = f"""
    <div class='kpi-card'>
        <div class='kpi-label'>{label}</div>
        <div class='kpi-value'>{value}</div>
        {change_html}
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)

def get_score_badge(score: float):
    """Get badge based on score"""
    if score >= 80:
        return "success", "✓ Excellent"
    elif score >= 60:
        return "warning", "⚠ Good"
    else:
        return "error", "✗ Needs Improvement"

# ============================================================================
# VERTICAL SIDEBAR NAVIGATION
# ============================================================================

with st.sidebar:
    # Render minimalist premium brand header
    st.markdown("""
        <div style='padding: 1rem 0; margin-bottom: 2rem;'>
            <div style='display: flex; align-items: center; gap: 0.75rem;'>
                <div class='sidebar-logo-animated' style='font-size: 2rem;'>📄</div>
                <div>
                    <h2 style='margin: 0; font-size: 1.25rem; font-weight: 800; color: #fff; letter-spacing: -0.02em;'>RESUME <span style='color: var(--accent-primary);'>ANALYSIS</span></h2>
                    <p style='margin: 0; font-size: 0.65rem; color: var(--text-tertiary); font-weight: 700; letter-spacing: 0.1em;'>INTELLIGENT ANALYSIS</p>
                </div>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # Navigation section
    st.markdown("<div style='font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.15em; margin-bottom: 1rem;'>MAIN MENU</div>", unsafe_allow_html=True)

    if st.button("📤 Upload Resume", use_container_width=True, key="nav_upload"):
        st.session_state.current_page = "Upload Resume"
        st.session_state.analysis_result = None
        st.session_state.resume_id = None
        st.rerun()
    
    if st.button("📊 Dashboard", use_container_width=True, key="nav_dashboard"):
        st.session_state.current_page = "Dashboard"
        st.rerun()
    
    if st.button("📚 Resources", use_container_width=True, key="nav_resources"):
        st.session_state.current_page = "Resources"
        st.rerun()

    # Settings section
    st.markdown("<div style='font-size: 0.65rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.15em; margin: 2rem 0 1rem 0;'>PREFERENCES</div>", unsafe_allow_html=True)

    if st.button("⚙️ System Settings", use_container_width=True, key="nav_settings"):
        st.session_state.current_page = "Settings"
        st.rerun()
    
    if st.button("❓ Support", use_container_width=True, key="nav_help"):
        st.session_state.current_page = "Help"
        st.rerun()

    # Add spacing after navigation
    st.markdown("<div style='margin-bottom: 2rem;'></div>", unsafe_allow_html=True)

# ============================================================================
# PAGE: UPLOAD RESUME
# ============================================================================

if st.session_state.current_page == "Upload Resume":
    render_header(
        "Professional Analysis Hub",
        "Strategic AI synthesis for elite career acceleration"
    )
    
    # Pre-calculated Identity info
    portal_name = st.session_state.portal_user.get("name", "")
    portal_email = st.session_state.portal_user.get("email", "")
    portal_uid = st.session_state.portal_user.get("uid", "")
    user_name = portal_name if portal_name else "Professional Candidate"
    email = portal_email if portal_email and "@" in portal_email else "guest@example.com"
    phone = "Not Provided"
    user_id = portal_uid if portal_uid else "guest"

    # Calculate Verification Badge
    is_guest = user_id == "guest" or "Guest" in user_name
    if is_guest:
        verification_badge = """
<div style='background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(239, 68, 68, 0.2); letter-spacing: 0.05em;'>
NOT VERIFIED
</div>
"""
    else:
        verification_badge = """
<div style='background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.2); letter-spacing: 0.05em;'>
VERIFIED
</div>
"""

    # MAIN HUB LAYOUT
    col_empty1, col_hub_main, col_empty2 = st.columns([0.05, 0.9, 0.05])

    with col_hub_main:
        # UNIFIED GLASS HUB ARCHITECTURE
        st.markdown(f"""
<div class='glass-hologram-layer'>
<div style='padding: 0 2rem;'>
<div style='margin-bottom: 2.5rem;'>
<h1 class='hologram-title'>RESUME ANALYSIS</h1>
<p class='hologram-subtitle'>Strategic AI synthesis for elite career acceleration</p>
</div>
<div class='hub-profile-card'>
<div style='display: flex; align-items: center; justify-content: space-between; width: 100%;'>
<div style='display: flex; align-items: center; gap: 1.25rem;'>
<div style='width: 48px; height: 48px; background: rgba(99, 102, 241, 0.2); border: 1px solid var(--accent-primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;'>👤</div>
<div>
<p style='margin: 0; font-size: 1.1rem; color: #FFFFFF; font-weight: 700;'>{user_name}</p>
</div>
</div>
{verification_badge}
</div>
</div>
<div class='upload-hub-card'>
""", unsafe_allow_html=True)

        status_placeholder = st.empty()
        
        uploaded_file = st.file_uploader(
            "Drop your PDF or DOCX file here",
            type=["pdf", "docx", "doc"],
            label_visibility="collapsed"
        )
        
        if uploaded_file:
            st.markdown(f"""
                <div style='background: rgba(16, 185, 129, 0.05); border: 1px dashed #10b981; border-radius: 12px; padding: 1.25rem; margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem;'>
                    <div style='font-size: 1.5rem;'>📄</div>
                    <div>
                        <p style='margin: 0; color: #10b981; font-weight: 700; font-size: 0.9rem;'>{uploaded_file.name}</p>
                        <p style='margin: 0; color: var(--text-tertiary); font-size: 0.75rem;'>Document ready for neural scanning</p>
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
            st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)
            if st.button("🚀 START RESUME ANALYSIS", use_container_width=True, type="primary"):
                # Analysis Animation Placeholder (Now below button)
                status_placeholder = st.empty()
                
                # Simplified Loading State
                status_placeholder.markdown(f"""
                    <div style='margin-top: 2rem; text-align: center; padding: 2rem; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(44, 154, 255, 0.1); border-radius: 1.5rem;'>
                        <div style='color: #FFFFFF; font-weight: 800; font-size: 1.25rem; letter-spacing: 0.02em;'>Analysing your resume</div>
                        <div style='color: var(--accent-primary); font-weight: 700; font-size: 0.9rem; margin-top: 0.5rem; letter-spacing: 0.05em;'>PROCESSING: {uploaded_file.name}</div>
                        <p style='color: var(--text-tertiary); font-size: 0.8rem; margin-top: 1.5rem;'>Synthesizing professional vectors...</p>
                    </div>
                """, unsafe_allow_html=True)
                
                import time
                time.sleep(2.5) # Scanning duration for visual feedback
                
                try:
                    files = {'file': (uploaded_file.name, uploaded_file.getvalue())}
                    data = {'user_name': user_name, 'email': email, 'phone': phone, 'user_id': user_id}
                    response = requests.post(f"{API_URL}/upload-resume", files=files, data=data)
                    
                    if response.status_code == 200:
                        result = response.json()
                        st.session_state.analysis_result = result['analysis']
                        st.session_state.resume_id = result.get('resume_id')
                        st.rerun()
                    else:
                        st.error(f"Analysis failed: {response.status_code}")
                except Exception as e:
                    st.error(f"Connection error: {str(e)}")
        
        st.markdown("</div>", unsafe_allow_html=True)
        
        # Security Footer
        st.markdown("""
            <div style='margin-top: 2rem; display: flex; justify-content: space-between; padding: 0 1rem;'>
                <div style='display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.75rem;'>
                    <span>🔒</span> End-to-end encrypted
                </div>
                <div style='display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.75rem;'>
                    <span>⚡</span> Instant vectorization
                </div>
            </div>
        """, unsafe_allow_html=True)

        # CLOSE INNER MARGIN WRAPPER AND GLASS HOLOGRAM WRAPPER
        st.markdown("</div></div>", unsafe_allow_html=True)
    
    # Analysis Results
    if st.session_state.analysis_result:
        analysis = st.session_state.analysis_result
        scores = analysis.get('scores', {})
        ra = analysis.get('role_specific_advice', {})
        
        # --- PHASE 1: EXECUTIVE INTELLIGENCE ---
        st.markdown("<div style='margin-top: 2rem;'></div>", unsafe_allow_html=True)
        st.markdown("""
            <div class='section-header' style='background: transparent; border-left: none; padding: 0;'>
                <span class='section-header-title' style='font-size: 1.5rem; opacity: 0.9;'>Phase 01: Executive Intelligence</span>
            </div>
            <p style='color: var(--text-tertiary); margin-bottom: 2rem;'>Strategic performance metrics and executive overview</p>
        """, unsafe_allow_html=True)
        
        # Helper for Horizontal Metric Card HTML
        def get_executive_card_html(label, value, color, insight, is_hero=False):
            percentage = min(max(value, 0), 100)
            dash_array = (percentage / 100) * 283
            card_class = "executive-metric-card metric-hero-card" if is_hero else "executive-metric-card"
            
            return f"""
            <div class='{card_class}'>
                <div class='metric-gauge-side'>
                    <div style='position: relative; width: 100%; height: 100%;'>
                        <svg viewBox='0 0 100 100' style='transform: rotate(-90deg); width: 100%; height: 100%;'>
                            <circle cx='50' cy='50' r='45' fill='none' stroke='rgba(255,255,255,0.05)' stroke-width='8'></circle>
                            <circle cx='50' cy='50' r='45' fill='none' stroke='{color}' stroke-width='8' 
                                stroke-dasharray='{dash_array} 283' stroke-linecap='round' style='transition: stroke-dasharray 1.5s ease-out; filter: drop-shadow(0 0 8px {color});'></circle>
                        </svg>
                        <div style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;'>
                            <div style='font-size: 1.25rem; font-weight: 800; color: #FFFFFF;'>{int(percentage)}%</div>
                        </div>
                    </div>
                </div>
                <div class='metric-info-side'>
                    <div class='metric-title'>{label}</div>
                    <p class='metric-elaborated-insight'>{insight}</p>
                </div>
            </div>
            """

        # Dashboard Tiers
        # TIER 1: OVERALL QUOTIENT HERO
        st.markdown(get_executive_card_html(
            "Overall Market Quotient", 
            scores.get('overall_score', 0), 
            "var(--accent-primary)", 
            "Comprehensive market alignment quotient based on deep-neural semantic matching of your expertise against elite industry benchmarks.",
            is_hero=True
        ), unsafe_allow_html=True)
        
        # TIER 2 & 3: GRID
        col_grid1, col_grid2 = st.columns(2, gap="medium")
        
        with col_grid1:
            st.markdown(get_executive_card_html(
                "Skills Match", 
                scores.get('skills_score', 0), 
                "#10b981", 
                f"<b>{int(scores.get('skills_score', 0))}% density</b> found in required technical clusters and key industry vectors."
            ), unsafe_allow_html=True)
            
            st.markdown("<div style='margin-bottom: 1.5rem;'></div>", unsafe_allow_html=True)
            
            st.markdown(get_executive_card_html(
                "Education Pedigree", 
                scores.get('education_score', 0), 
                "#f59e0b", 
                f"Academic pedigree matches <b>{int(scores.get('education_score', 0))}%</b> of elite industry expectations."
            ), unsafe_allow_html=True)

        with col_grid2:
            st.markdown(get_executive_card_html(
                "Professional Exp", 
                scores.get('experience_score', 0), 
                "#818cf8", 
                f"Strategic career progression at <b>{int(scores.get('experience_score', 0))}% performance</b> benchmark."
            ), unsafe_allow_html=True)
            
            st.markdown("<div style='margin-bottom: 1.5rem;'></div>", unsafe_allow_html=True)
            
            st.markdown(get_executive_card_html(
                "Aesthetic Formatting", 
                scores.get('formatting_score', 0), 
                "#22d3ee", 
                f"Professional aesthetic and parsing compliance verified at <b>{int(scores.get('formatting_score', 0))}% precision</b>."
            ), unsafe_allow_html=True)
            
        # TIER 4: SUMMARY HERO
        st.markdown(f"""
            <div class='bento-card' style='margin-top: 2rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border-left: 5px solid var(--accent-primary); padding: 2rem;'>
                <div style='display: flex; align-items: flex-start; gap: 1.5rem;'>
                    <div style='font-size: 2rem; background: rgba(255, 255, 255, 0.05); width: 60px; height: 60px; border-radius: 1rem; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);'>🏛️</div>
                    <div>
                        <h4 style='margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #FFFFFF; font-weight: 700;'>Strategic Executive Summary</h4>
                        <p style='margin: 0; color: #E2E8F0; font-size: 1rem; line-height: 1.7;'>{analysis.get('overall_strategy', 'Resume vectors successfully synthesized.')}</p>
                    </div>
                </div>
            </div>
            <div class='divider-glow'></div>
        """, unsafe_allow_html=True)
        
        # --- PHASE 2: OPTIMIZATION PROTOCOL ---
        st.markdown("""
            <div class='section-header' style='background: transparent; border-left: none; padding: 0;'>
                <span class='section-header-title' style='font-size: 1.5rem; opacity: 0.9;'>Phase 02: Optimization Protocol</span>
            </div>
            <p style='color: var(--text-tertiary); margin-bottom: 2.5rem;'>Critical adjustments and compliance standards</p>
        """, unsafe_allow_html=True)
        
        col_opt1, col_opt2 = st.columns(2, gap="large")
        
        with col_opt1:
            st.markdown("<h4 style='color: #f59e0b; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;'>⚠️ Priority Adjustments</h4>", unsafe_allow_html=True)
            for item in analysis.get('priority_changes', [])[:4]:
                if isinstance(item, dict):
                    change_text = item.get('change', 'N/A')
                    why_text = item.get('why', '')
                    how_text = item.get('how', '')
                    content = f"<b>{change_text}</b>"
                    if why_text: content += f"<br><span style='color: var(--text-tertiary); font-size: 0.85rem;'><b>WHY:</b> {why_text}</span>"
                    if how_text: content += f"<br><span style='color: var(--accent-secondary); font-size: 0.85rem;'><b>HOW:</b> {how_text}</span>"
                else:
                    content = str(item)
                
                st.markdown(f"""
                    <div style='background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1rem;'>
                        <p style='margin: 0; color: #FFFFFF; font-size: 0.95rem; line-height: 1.6;'>{content}</p>
                    </div>
                """, unsafe_allow_html=True)
        
        with col_opt2:
            st.markdown("<h4 style='color: #22d3ee; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;'>⚙️ ATS & Compliance</h4>", unsafe_allow_html=True)
            for i, tip in enumerate(analysis.get('ats_optimization', [])[:4], 1):
                st.markdown(f"""
                    <div style='display: flex; gap: 1rem; margin-bottom: 1.25rem; background: rgba(34, 211, 238, 0.03); padding: 1rem; border-radius: 0.75rem;'>
                        <div style='color: #22d3ee; font-weight: 800; font-size: 1.1rem;'>0{i}</div>
                        <p style='margin: 0; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;'>{tip}</p>
                    </div>
                """, unsafe_allow_html=True)

        st.markdown("<div class='divider-glow'></div>", unsafe_allow_html=True)

        # --- PHASE 3: ASSET ASSESSMENT ---
        st.markdown("""
            <div class='section-header' style='background: transparent; border-left: none; padding: 0;'>
                <span class='section-header-title' style='font-size: 1.5rem; opacity: 0.9;'>Phase 03: Professional Assets</span>
            </div>
            <p style='color: var(--text-tertiary); margin-bottom: 2.5rem;'>Verified strengths and quantifiable impact metrics</p>
        """, unsafe_allow_html=True)
        
        col_asset1, col_asset2 = st.columns([0.6, 0.4], gap="large")
        
        with col_asset1:
            st.markdown("<h4 style='color: #10b981; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;'>💎 Core Strengths</h4>", unsafe_allow_html=True)
            cols_s = st.columns(2)
            for i, strength in enumerate(analysis.get('strengths', [])[:6]):
                with cols_s[i % 2]:
                    st.markdown(f"""
                        <div style='background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15); border-radius: 1rem; padding: 1.25rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;'>
                            <div style='color: #10b981; font-weight: 900; background: rgba(16, 185, 129, 0.1); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;'>✓</div>
                            <div style='color: #FFFFFF; font-weight: 500; font-size: 0.95rem;'>{strength}</div>
                        </div>
                    """, unsafe_allow_html=True)
        
        with col_asset2:
            st.markdown("<h4 style='color: var(--accent-primary); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;'>📈 Recommended Metrics</h4>", unsafe_allow_html=True)
            for metric in analysis.get('metrics_to_add', [])[:4]:
                st.markdown(f"""
                    <div style='background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem;'>
                        <p style='margin: 0; color: #FFFFFF; font-size: 0.9rem; font-weight: 400;'>{metric}</p>
                    </div>
                """, unsafe_allow_html=True)

        st.markdown("<div class='divider-glow'></div>", unsafe_allow_html=True)

        # --- PHASE 4: KEYWORD INTELLIGENCE ---
        st.markdown("""
            <div class='section-header' style='background: transparent; border-left: none; padding: 0;'>
                <span class='section-header-title' style='font-size: 1.5rem; opacity: 0.9;'>Phase 04: Keyword & Vector Intelligence</span>
            </div>
            <p style='color: var(--text-tertiary); margin-bottom: 2.5rem;'>Technical semantic analysis and keyword density</p>
        """, unsafe_allow_html=True)
        
        # Keyword Cloud
        st.markdown("""
            <div style='margin-bottom: 2rem; background: rgba(255,255,255,0.02); padding: 2rem; border-radius: 1.5rem; border: 1px dashed rgba(255,255,255,0.1);'>
                <p style='text-align: center; color: var(--text-tertiary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem;'>Intelligence Vector keywords</p>
                <div style='display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center;'>
        """, unsafe_allow_html=True)
        
        all_kws = analysis.get('skills_to_emphasize', [])
        for kw in list(set(all_kws))[:18]:
            st.markdown(f"<span class='badge' style='background: rgba(99, 102, 241, 0.1); color: #FFFFFF; border: 1px solid rgba(99, 102, 241, 0.2); padding: 0.5rem 1rem;'>{kw}</span>", unsafe_allow_html=True)
        st.markdown("</div></div>", unsafe_allow_html=True)
        
        # Missing Keywords
        st.markdown("<h4 style='color: #ef4444; margin: 2rem 0 1.5rem 0; display: flex; align-items: center; gap: 0.5rem;'>🚫 Missing Critical Keywords</h4>", unsafe_allow_html=True)
        missing_cols = st.columns(3)
        for i, kw_info in enumerate(analysis.get('missing_keywords', [])[:9]):
            kw = kw_info['keyword'] if isinstance(kw_info, dict) else kw_info
            with missing_cols[i % 3]:
                st.markdown(f"""
                    <div class='badge-red' style='padding: 0.75rem 1rem; border-radius: 0.75rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 600; text-align: center;'>
                        {kw}
                    </div>
                """, unsafe_allow_html=True)

        st.markdown("<div class='divider-glow'></div>", unsafe_allow_html=True)

        # --- PHASE 5: STRATEGIC CAREER PLANNING ---
        st.markdown("""
            <div class='section-header' style='background: transparent; border-left: none; padding: 0;'>
                <span class='section-header-title' style='font-size: 1.5rem; opacity: 0.9;'>Phase 05: Strategic Career Planning</span>
            </div>
            <p style='color: var(--text-tertiary); margin-bottom: 2.5rem;'>Market alignment and future trajectory projections</p>
        """, unsafe_allow_html=True)
        
        col_c1, col_c2 = st.columns([0.4, 0.6], gap="large")
        
        with col_c1:
            st.markdown(f"""
                <div class='bento-card' style='background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.2);'>
                    <p style='margin: 0; font-size: 0.75rem; color: var(--accent-secondary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;'>🎯 Target Role Alignment</p>
                    <h4 style='margin: 0.5rem 0 1rem 0; color: #FFFFFF; font-size: 1.25rem;'>{ra.get('target_role', 'Not Specified')}</h4>
                    <hr style='opacity: 0.1; margin: 1rem 0;'>
                    <p style='margin: 0; font-size: 0.75rem; color: var(--text-tertiary); font-weight: 700;'>MARKET VALUE</p>
                    <p style='margin: 0.25rem 0 0 0; color: #FFFFFF; font-size: 0.95rem;'>{ra.get('market_alignment', 'Aligned')}</p>
                    <hr style='opacity: 0.1; margin: 1rem 0;'>
                    <p style='margin: 0; font-size: 0.75rem; color: var(--text-tertiary); font-weight: 700;'>SKILLS GAP</p>
                    <p style='margin: 0.25rem 0 0 0; color: #FFFFFF; font-size: 0.95rem;'>{ra.get('required_skills_gap', 'None')}</p>
                </div>
            """, unsafe_allow_html=True)
            
            # Comparable Roles
            st.markdown("<h5 style='color: var(--text-secondary); margin: 2rem 0 1rem 0; font-size: 0.8rem; text-transform: uppercase;'>Comparable Paths</h5>", unsafe_allow_html=True)
            for role in ra.get('comparable_roles', [])[:3]:
                st.markdown(f"<div style='color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;'><span>→</span> {role}</div>", unsafe_allow_html=True)

        with col_c2:
            st.markdown("<h4 style='color: #FFFFFF; margin-bottom: 1.5rem; font-size: 1rem;'>Predicted Role Match Score</h4>", unsafe_allow_html=True)
            if analysis.get('predicted_roles'):
                roles_df = pd.DataFrame(analysis['predicted_roles'])
                fig = px.bar(
                    roles_df, 
                    x='match_score', 
                    y='role', 
                    orientation='h', 
                    color='match_score',
                    color_continuous_scale=['#ef4444', '#f59e0b', '#10b981'],
                    labels={'match_score': 'Match %', 'role': 'Position'}
                )
                fig.update_layout(
                    height=300, 
                    margin=dict(l=0, r=0, t=0, b=0),
                    plot_bgcolor='rgba(0,0,0,0)', 
                    paper_bgcolor='rgba(0,0,0,0)',
                    font_color='#FFFFFF',
                    xaxis_range=[0, 100],
                    showlegend=False
                )
                fig.update_xaxes(showgrid=False, zeroline=False)
                fig.update_yaxes(showgrid=False, zeroline=False)
                st.plotly_chart(fig, use_container_width=True, config={'displayModeBar': False})


# ============================================================================
# PAGE: DASHBOARD
# ============================================================================

elif st.session_state.current_page == "Dashboard":
    render_header(
        "📊 Dashboard",
        "Executive metrics and user insights"
    )
    
    if not st.session_state.admin_token:
        st.markdown("""
            <style>
                .login-container {
                    background: rgba(15, 31, 63, 0.95);
                    border: 2px solid rgba(0, 212, 255, 0.4);
                    border-radius: 1.5rem;
                    padding: 3rem 2rem;
                    margin: 2rem auto;
                    max-width: 500px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                }
                
                .login-title {
                    text-align: center;
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #FFFFFF !important;
                    margin-bottom: 0.5rem;
                    -webkit-text-fill-color: initial !important;
                }
                
                .login-subtitle {
                    text-align: center;
                    color: #cbd5e1;
                    font-size: 0.95rem;
                    margin-bottom: 2rem;
                    font-weight: 500;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-label {
                    display: block;
                    color: #E8F0FE;
                    font-weight: 700;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                
                .login-input {
                    width: 100%;
                    padding: 0.875rem 1rem;
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 99, 255, 0.03) 100%);
                    border: 2px solid rgba(0, 212, 255, 0.2);
                    border-radius: 0.875rem;
                    color: #E8F0FE;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    box-sizing: border-box;
                }
                
                .login-input:focus {
                    outline: none;
                    border-color: rgba(0, 212, 255, 0.5);
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 99, 255, 0.05) 100%);
                }
                
                .login-input::placeholder {
                    color: rgba(203, 213, 225, 0.5);
                }
                
                .login-button {
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
                    border: none;
                    border-radius: 0.875rem;
                    color: #0A1F3F;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    margin-top: 1.5rem;
                }
                
                .login-button:hover {
                    box-shadow: 0 0 50px rgba(0, 212, 255, 0.5);
                    transform: translateY(-2px);
                }
                
                .login-button:active {
                    transform: translateY(0px);
                }
            </style>
            <div class="login-container">
                <h1 class="login-title">🔐 Admin Dashboard</h1>
                <p class="login-subtitle">Sign in to access analytics and insights</p>
            </div>
        """, unsafe_allow_html=True)
        
        with st.form("admin_login"):
            col1, col2, col3 = st.columns([0.2, 0.6, 0.2])
            with col2:
                st.markdown("<div class='form-group'>", unsafe_allow_html=True)
                st.markdown("<label class='form-label'>Email Address</label>", unsafe_allow_html=True)
                admin_email = st.text_input("Email", placeholder="admin@example.com", key="admin_email_input", label_visibility="collapsed")
                st.markdown("</div>", unsafe_allow_html=True)
                
                st.markdown("<div class='form-group'>", unsafe_allow_html=True)
                st.markdown("<label class='form-label'>Password</label>", unsafe_allow_html=True)
                admin_pass = st.text_input("Password", type="password", placeholder="••••••••", key="admin_pass_input", label_visibility="collapsed")
                st.markdown("</div>", unsafe_allow_html=True)
                
                if st.form_submit_button("🔓 Login", use_container_width=True):
                    if admin_email and admin_pass:
                        try:
                            response = requests.post(f"{API_URL}/admin/login", json={"email": admin_email, "password": admin_pass})
                            if response.status_code == 200:
                                st.session_state.admin_token = response.json().get('access_token')
                                st.success("✓ Login successful! Redirecting...")
                                st.balloons()
                                st.rerun()
                            else:
                                st.error("✗ Invalid email or password. Please try again.")
                        except Exception as e:
                            st.error(f"✗ Connection error: {str(e)}")
                    else:
                        st.warning("⚠️ Please enter both email and password")
    else:
        try:
            # UNIFIED DASHBOARD SYNCHRONIZATION
            with st.spinner("🚀 Optimizing executive intelligence..."):
                # Use cached API calls for better performance
                analytics = fetch_analytics_data(st.session_state.admin_token)
                resumes_response = fetch_resumes_data(st.session_state.admin_token)
            
            if analytics and "error" in analytics and analytics["error"] == "Unauthorized":
                # If we came from portal and it failed immediately, just clear it silently
                prev_source = st.session_state.get('login_source', 'manual')
                st.session_state.admin_token = None
                st.session_state.login_failed = True
                
                if prev_source == 'manual':
                    st.warning("⚠️ Admin Session Expired. Please log in again.")
                
                st.rerun()
                
            # Successfully fetched analytics - clear login_failed flag
            st.session_state.login_failed = False
            st.session_state.login_source = 'manual' # Promotion to active session
            
            if not analytics:
                st.error("Failed to connect to the backend server. Please ensure the API is running.")
                st.stop()
                
            if analytics:
                stats = analytics.get('stats', {})
                st.markdown("<div class='section-header'><span class='section-header-title'>Feature Usage & Identify Stats</span></div>", unsafe_allow_html=True)
                
                # First row of metrics (Identity)
                kpi_cols1 = st.columns(4)
                metrics1 = [
                    ("Unique Users", stats.get('total_users', 0)),
                    ("Authenticated", stats.get('auth_users', 0)),
                    ("Guest Users", stats.get('guest_users', 0)),
                    ("Total Features Run", stats.get('total_resumes', 0)),
                ]
                
                def render_kpi(col, label, value):
                    with col:
                        st.markdown(f"""
                        <div class='kpi-card' style='
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 99, 255, 0.03) 100%);
                            backdrop-filter: blur(10px);
                            border: 2px solid rgba(0, 212, 255, 0.3);
                            border-radius: 1.25rem;
                            padding: 1.5rem 1rem;
                            text-align: center;
                            box-shadow: 0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05);
                            transition: all 0.3s ease;
                            position: relative;
                            overflow: hidden;
                            margin-bottom: 1rem;
                        '>
                            <div style='position: relative; z-index: 1;'>
                                <div class='kpi-value' style='
                                    font-size: 2rem;
                                    font-weight: 800;
                                    background: linear-gradient(135deg, #00D4FF 0%, #00E8FF 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                    margin: 0.25rem 0;
                                    text-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
                                '>{value}</div>
                                <div class='kpi-label' style='
                                    font-size: 0.70rem;
                                    font-weight: 700;
                                    color: #94a3b8;
                                    text-transform: uppercase;
                                    letter-spacing: 0.08em;
                                '>{label}</div>
                            </div>
                        </div>
                        """, unsafe_allow_html=True)
                
                for col, (label, value) in zip(kpi_cols1, metrics1):
                    render_kpi(col, label, value)
                    
                # Second row of metrics (Results)
                kpi_cols2 = st.columns(4)
                metrics2 = [
                    ("Top Feature", "Resume Parser"),
                    ("Avg Parse Score", f"{stats.get('average_score', 0):.1f}"),
                    ("Highest Score", f"{stats.get('highest_score', 0):.1f}"),
                    ("Lowest Score", f"{stats.get('lowest_score', 0):.1f}"),
                ]
                
                for col, (label, value) in zip(kpi_cols2, metrics2):
                    render_kpi(col, label, value)
                

                
                st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
                
                def render_dashboard_analytics(analytics_data, resumes_response):
                    st.markdown("<div class='section-header'><span class='section-header-title'>Analytics & Intelligence</span></div>", unsafe_allow_html=True)
                    if not analytics_data:
                        return
                    
                    top_roles = analytics_data.get('top_roles', [])
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        if top_roles:
                            role_names = [r['role_name'] for r in top_roles]
                            role_counts = [r['count'] for r in top_roles]
                            fig = go.Figure(data=[go.Pie(labels=role_names, values=role_counts, hole=.3)])
                            fig.update_layout(height=400, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color='#E8F0FE'))
                            st.plotly_chart(fig, use_container_width=True)
                    with col2:
                        if resumes_response and resumes_response.get('resumes'):
                            scores = [r.get('score', 0) for r in resumes_response['resumes'][:10]]
                            fig = go.Figure(data=[go.Bar(y=scores)])
                            fig.update_layout(height=400, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color='#E8F0FE'))
                            st.plotly_chart(fig, use_container_width=True)
                
                render_dashboard_analytics(analytics, resumes_response)
                
                st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
                st.markdown("<div class='section-header'><span class='section-header-title'>All Resume Records</span></div>", unsafe_allow_html=True)
                
                if resumes_response:
                    resumes = resumes_response.get('resumes', [])
                    if resumes:
                        df = pd.DataFrame(resumes)
                        
                        # Display record count
                        st.metric("Total Records", len(df))
                        
                        # Add filter options
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            search_email = st.text_input("🔍 Filter by Email")
                        with col2:
                            search_city = st.text_input("🌍 Filter by City")
                        with col3:
                            search_country = st.text_input("🗺️ Filter by Country")
                        
                        # Apply filters
                        if search_email:
                            df = df[df['email'].str.contains(search_email, case=False, na=False)]
                        if search_city:
                            df = df[df['city'].str.contains(search_city, case=False, na=False)]
                        if search_country:
                            df = df[df['country'].str.contains(search_country, case=False, na=False)]
                        
                        st.success(f"Showing {len(df)} records")
                        
                        # Identify whether a user is Guest or Authenticated
                        if 'portal_user_id' in df.columns:
                            df['User Status'] = df['portal_user_id'].apply(lambda x: 'Guest' if not x or str(x).startswith('guest') else 'Authenticated')
                        else:
                            df['User Status'] = 'Unknown'
                            
                        # Reorder columns to show User ID, Authentication status, and Feature Score prominently
                        cols_order = ['id', 'User Status', 'portal_user_id', 'user_name', 'email', 'score', 'city', 'country', 'file_name', 'upload_date', 'file_size']
                        available_cols = [col for col in cols_order if col in df.columns]
                        df_display = df[available_cols].copy()
                        
                        # Rename columns for the display table to look more professional
                        rename_map = {'id': 'Use ID', 'portal_user_id': 'Auth ID', 'user_name': 'Candidate Name', 'score': 'AI Match Score', 'file_name': 'Resume File', 'city': 'Precise City', 'upload_date': 'Upload Date'}
                        df_display.rename(columns={k:v for k,v in rename_map.items() if k in df_display.columns}, inplace=True)
                        
                        st.dataframe(df_display, use_container_width=True, height=400)
                        
                        # Clean up the JSON string payloads for the downloadable report to be purely readable text lists
                        download_df = df.copy()
                        
                        import json
                        def safe_parse_json(val, key=None):
                            if not val or pd.isna(val): return ""
                            try:
                                parsed = json.loads(val) if isinstance(val, str) else val
                                if isinstance(parsed, list):
                                    if len(parsed) > 0 and isinstance(parsed[0], dict) and key:
                                        return ", ".join([str(item.get(key, '')) for item in parsed])
                                    elif len(parsed) > 0 and isinstance(parsed[0], str):
                                        return ", ".join(parsed)
                                return str(parsed)
                            except:
                                return str(val)
                                
                        if 'extracted_skills' in download_df.columns:
                            download_df['extracted_skills'] = download_df['extracted_skills'].apply(lambda x: safe_parse_json(x))
                        if 'predicted_roles' in download_df.columns:
                            download_df['predicted_roles'] = download_df['predicted_roles'].apply(lambda x: safe_parse_json(x, 'role'))
                            
                        # Download option with full detailed records
                        csv = download_df.to_csv(index=False)
                        st.download_button(
                            label="📥 Download Detailed Report (CSV)",
                            data=csv,
                            file_name="resume_analyzer_admin_report.csv",
                            mime="text/csv"
                        )
                    else:
                        st.info("📊 No records found.")
                else:
                    st.error("Access Denied")
        except Exception as e:
            st.error(f"Error: {str(e)}")

# ============================================================================
# PAGE: RESOURCES
# ============================================================================

elif st.session_state.current_page == "Resources":
    render_header(
        "📚 Resources",
        "Curated learning materials to improve your resume"
    )
    
    analysis_result = st.session_state.get('analysis_result')
    improvement_keywords = []
    
    if analysis_result:
        raw_keywords = analysis_result.get('missing_keywords', [])
        for kw in raw_keywords:
            if isinstance(kw, dict) and 'keyword' in kw:
                improvement_keywords.append(kw['keyword'])
            elif isinstance(kw, str):
                improvement_keywords.append(kw)
                
        st.success("🎯 Resources have been personalized based on your resume analysis!")
        if improvement_keywords:
            st.markdown("#### Suggested Areas for Improvement:")
            st.markdown(" • " + " • ".join(improvement_keywords))
    else:
        st.info("💡 Get personalized course suggestions by analyzing your resume first!")
        if st.button("🚀 Go to Resume Analyzer", use_container_width=True):
            st.session_state.current_page = "Upload Resume"
            st.session_state.analysis_result = None
            st.session_state.resume_id = None
            st.experimental_rerun()
            
        st.markdown("---")
        manual_field = st.text_input("Looking for something specific? Enter a field to improve (e.g., Python, Marketing):")
        if manual_field:
            improvement_keywords = [kw.strip() for kw in manual_field.split(',')]
            
    # Filter helper function
    def filter_resources(items_dict, keywords):
        if not keywords: return items_dict
        filtered = {}
        for key, val in items_dict.items():
            if any(kw.lower() in key.lower() or key.lower() in kw.lower() for kw in keywords):
                filtered[key] = val
        return filtered
    
    tabs = st.tabs(["📖 Courses", "🎥 Videos", "📑 Guides", "⭐ Tips"])
    
    with tabs[0]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Learning Platforms</span></div>", unsafe_allow_html=True)
        courses = fetch_courses()
        if courses:
            filtered_courses = filter_resources(courses, improvement_keywords)
            
            if improvement_keywords and len(filtered_courses) == 0:
                st.caption("Generating dynamic learning paths for your specific skills...")
                for kw in improvement_keywords:
                    kw_encoded = kw.replace(" ", "+")
                    filtered_courses[f"{kw.title()} Mastery Track"] = {
                        "Coursera Specialization": f"https://www.coursera.org/search?query={kw_encoded}",
                        "Udemy Hands-on Course": f"https://www.udemy.com/courses/search/?src=ukw&q={kw_encoded}",
                        "edX Professional Cert": f"https://www.edx.org/search?q={kw_encoded}",
                        "LinkedIn Learning": f"https://www.linkedin.com/learning/search?keywords={kw_encoded}"
                    }
            elif improvement_keywords and len(filtered_courses) < len(courses):
                st.caption("Showing courses relevant to your improvement areas.")
            
            for category, platforms in filtered_courses.items():
                st.markdown(f"#### {category}")
                cols = st.columns(3)
                for idx, (platform, url) in enumerate(platforms.items()):
                    with cols[idx % 3]:
                        st.markdown(f"""
                        <div class='resource-card'>
                            <div class='resource-title'>{platform}</div>
                            <a href='{url}' target='_blank' style='color: var(--accent-primary);'>Explore →</a>
                        </div>
                        """, unsafe_allow_html=True)
        else:
            st.info("Courses data unavailable")
    
    with tabs[1]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Videos</span></div>", unsafe_allow_html=True)
        videos = fetch_videos()
        if videos:
            filtered_videos = filter_resources(videos, improvement_keywords)
            
            if improvement_keywords and len(filtered_videos) == 0:
                st.caption("Generating customized dynamic video suggestions...")
                for kw in improvement_keywords:
                    kw_encoded = kw.replace(" ", "+")
                    filtered_videos[f"{kw.title()} Full Course (Beginners)"] = f"https://www.youtube.com/results?search_query={kw_encoded}+full+course"
                    filtered_videos[f"Advanced {kw.title()} Techniques"] = f"https://www.youtube.com/results?search_query=advanced+{kw_encoded}+tutorial"
                    filtered_videos[f"Top {kw.title()} Interview Questions"] = f"https://www.youtube.com/results?search_query={kw_encoded}+interview+questions"
                    filtered_videos[f"{kw.title()} Project Build"] = f"https://www.youtube.com/results?search_query={kw_encoded}+project+step+by+step"
                    
            elif improvement_keywords and len(filtered_videos) < len(videos):
                st.caption("Showing videos relevant to your improvement areas.")
            
            cols = st.columns(2)
            for idx, (topic, url) in enumerate(filtered_videos.items()):
                with cols[idx % 2]:
                    st.markdown(f"""
                    <div class='resource-card'>
                        <div class='resource-title'>{topic}</div>
                        <a href='{url}' target='_blank' style='color: var(--accent-primary);'>Watch →</a>
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.info("Videos unavailable")
    
    with tabs[2]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Guides</span></div>", unsafe_allow_html=True)
        guides = fetch_guides()
        if guides:
            cols = st.columns(2)
            for idx, (title, guide) in enumerate(guides.items()):
                with cols[idx % 2]:
                    tags = guide.get('tags', [])
                    st.markdown(f"""
                    <div class='resource-card'>
                        <div class='resource-title'>{title}</div>
                        <div class='resource-description'>{guide.get('description', '')}</div>
                        {''.join(f'<span class="resource-tag">{tag}</span>' for tag in tags)}
                    </div>
                    """, unsafe_allow_html=True)
        else:
            st.info("Guides unavailable")
    
    with tabs[3]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Tips</span></div>", unsafe_allow_html=True)
        tips_data = fetch_tips()
        if tips_data:
            col1, col2 = st.columns(2)
            with col1:
                st.markdown("#### ✅ Do This")
                for tip in tips_data.get('do', []):
                    st.markdown(f"✓ {tip}")
            with col2:
                st.markdown("#### ❌ Avoid This")
                for tip in tips_data.get('dont', []):
                    st.markdown(f"✗ {tip}")
        else:
            st.info("Tips unavailable")

# ============================================================================
# PAGE: SETTINGS
# ============================================================================

elif st.session_state.current_page == "Settings":
    render_header("⚙️ Settings", "Customize your experience")
    
    tabs = st.tabs(["👤 Profile", "🎨 Appearance", "📊 Scoring", "⚙️ API"])
    
    with tabs[0]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Profile</span></div>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        with col1:
            st.text_input("Full Name", "John Doe", disabled=True)
        with col2:
            st.text_input("Email", "john@example.com", disabled=True)
        
        st.markdown("#### 🔐 Security")
        if st.button("🔑 Change Password"):
            st.info("Coming soon")
    
    with tabs[1]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Appearance</span></div>", unsafe_allow_html=True)
        theme = st.radio("Theme", ["Light", "Dark", "Auto"], horizontal=True)
        st.caption(f"Current: {theme}")
    
    with tabs[2]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Scoring</span></div>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        with col1:
            st.slider("Skills Weight", 0.0, 1.0, 0.25)
            st.slider("Experience Weight", 0.0, 1.0, 0.30)
        with col2:
            st.slider("Education Weight", 0.0, 1.0, 0.20)
            st.slider("Formatting Weight", 0.0, 1.0, 0.10)
    
    with tabs[3]:
        st.markdown("<div class='section-header'><span class='section-header-title'>API</span></div>", unsafe_allow_html=True)
        st.text_input("API URL", "http://localhost:8000")
        st.number_input("Timeout (seconds)", 5, 60, 30)

# ============================================================================
# PAGE: HELP
# ============================================================================

elif st.session_state.current_page == "Help":
    render_header("❓ Help & Support", "Get answers and find documentation")
    
    tabs = st.tabs(["🚀 Getting Started", "❔ FAQ", "💡 Tips", "🐛 Troubleshooting"])
    
    with tabs[0]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Getting Started</span></div>", unsafe_allow_html=True)
        st.markdown("""
        1. Upload your resume (PDF or DOCX)
        2. Review your analysis scores
        3. Check recommendations
        4. Implement improvements
        """)
    
    with tabs[1]:
        st.markdown("<div class='section-header'><span class='section-header-title'>FAQ</span></div>", unsafe_allow_html=True)
        faqs = [
            ("Supported formats?", "PDF, DOCX, DOC (max 10MB)"),
            ("How is score calculated?", "Skills 25%, Experience 30%, Education 20%, Formatting 10%, Achievements 15%"),
            ("Is data safe?", "Yes, data is processed securely and not stored long-term"),
            ("Can I re-analyze?", "Yes, unlimited analyses"),
        ]
        for q, a in faqs:
            with st.expander(f"❓ {q}"):
                st.markdown(a)
    
    with tabs[2]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Tips</span></div>", unsafe_allow_html=True)
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("#### ✓ Do's")
            for tip in ["Use action verbs", "Quantify achievements", "Tailor to job", "Check formatting", "Include metrics"]:
                st.markdown(f"✓ {tip}")
        with col2:
            st.markdown("#### ✗ Don'ts")
            for tip in ["Generic text", "Typos", "Irrelevant", "Poor format", "Personal info"]:
                st.markdown(f"✗ {tip}")
    
    with tabs[3]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Troubleshooting</span></div>", unsafe_allow_html=True)
        issues = [
            ("Upload fails", "Check file format and size < 10MB"),
            ("Analysis is slow", "Large files take longer, typically 30s"),
            ("Low score", "Review all feedback tabs for details"),
            ("API error", "Check connection and backend status"),
        ]
        for issue, solution in issues:
            with st.expander(f"❓ {issue}"):
                st.markdown(solution)

# ============================================================================
# FOOTER
# ============================================================================

st.markdown("""
<div style='text-align: center; padding: 32px 0; margin-top: 48px; border-top: 1px solid var(--border);'>
    <p style='font-size: 13px; color: var(--text-tertiary); margin-bottom: 8px;'>
        <strong>Resume AI</strong> © 2024 | Built with ❤️ for professional growth
    </p>
    <p style='font-size: 12px; color: var(--text-tertiary);'>
        Analyses are AI-powered guidance. Hiring decisions made by human recruiters.
    </p>
</div>
""", unsafe_allow_html=True)
