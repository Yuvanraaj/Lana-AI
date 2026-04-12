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

st.markdown("""
    <style>
    /* ==========================================
       VIRTUAL INTERVIEW BOT - DESIGN SYSTEM
       Applied to Resume AI
       ========================================== */

    :root {
        /* PRIMARY DARK PALETTE - Futuristic Blues */
        --bg-primary: #0A1F3F;
        --bg-secondary: #0F2341;
        --bg-tertiary: #1a3a5e;
        --bg-card-soft: rgba(15, 35, 65, 0.8);
        
        /* TEXT COLORS */
        --text-primary: #E8F0FE;
        --text-secondary: #cbd5e1;
        --text-tertiary: #94a3b8;
        --text-muted: #7d8fa6;
        
        /* BRAND ACCENTS - Vibrant Cyan & Blue */
        --accent-primary: #00D4FF;
        --accent-secondary: #0099FF;
        --accent-light: rgba(0, 212, 255, 0.15);
        --accent-glow: rgba(0, 212, 255, 0.3);
        
        /* SEMANTIC COLORS */
        --success: #00FF88;
        --warning: #FFB800;
        --error: #FF3E44;
        
        /* BORDERS & DIVIDERS */
        --border: rgba(255, 255, 255, 0.08);
        --border-light: rgba(255, 255, 255, 0.12);
        --border-accent: rgba(0, 212, 255, 0.2);
        
        /* SHADOWS - Elevated & Glowing */
        --shadow-xs: 0 2px 4px rgba(0, 0, 0, 0.25);
        --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.3);
        --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.35);
        --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.4);
        --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.45);
        --shadow-glow: 0 0 30px rgba(0, 212, 255, 0.2);
        
        /* TRANSITIONS */
        --duration-fast: 150ms;
        --duration-normal: 300ms;
        --duration-slow: 500ms;
        --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
        --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* ===== GLOBAL BASE STYLES ===== */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    html, body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Segoe UI Roboto', 'Helvetica Neue', sans-serif;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.5;
    }
    
    .stApp {
        background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
    }
    
    /* ===== PAGE CONTAINER ===== */
    .main-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem;
    }
    
    /* ===== CONTENT WRAPPER ===== */
    [data-testid="stAppViewContainer"] {
        background: transparent;
    }
    
    [data-testid="stVerticalBlockBorderWrapper"] {
        background: transparent;
    }
    
    #MainMenu, footer {
        visibility: hidden;
    }
    
    /* ===== SIDEBAR ===== */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, var(--bg-secondary) 0%, rgba(15, 35, 65, 0.8) 100%);
        border-right: 1px solid var(--border);
    }
    
    section[data-testid="stSidebar"] > div:first-child {
        padding-top: 1rem !important;
    }
    
    /* ===== TYPOGRAPHY ===== */
    h1, h2, h3, h4, h5, h6 {
        color: var(--text-primary);
        letter-spacing: -0.015em;
        font-weight: 600;
        margin-top: 1.5rem;
    }
    
    h1 {
        font-size: 2.5rem;
        line-height: 1.1;
        font-weight: 700;
        margin-bottom: 0.75rem;
        letter-spacing: -0.02em;
    }
    
    h2 {
        font-size: 1.875rem;
        line-height: 1.25;
        font-weight: 700;
        margin-bottom: 1.25rem;
    }
    
    h3 {
        font-size: 1.375rem;
        line-height: 1.35;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }
    
    h4 {
        font-size: 1.125rem;
        line-height: 1.4;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }
    
    p, label, span {
        color: var(--text-secondary);
        line-height: 1.65;
        font-size: 0.9375rem;
    }
    
    label {
        font-weight: 500;
        color: var(--text-primary);
        display: block;
        margin-bottom: 0.5rem;
    }
    
    .page-subtitle {
        font-size: 1.0625rem;
        color: var(--text-tertiary);
        margin: 0.75rem 0 2rem 0;
        font-weight: 400;
        line-height: 1.65;
    }
    
    /* ===== SECTION SPACING ===== */
    section {
        margin-bottom: 2rem;
    }
    
    /* ===== CARDS - GLASSMORPHISM ===== */
    .card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1.5px solid var(--border-light);
        border-radius: 1.25rem;
        padding: 1.75rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transition: all var(--duration-normal) var(--ease-out);
    }
    
    .card:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--border-accent);
        box-shadow: 0 12px 48px rgba(0, 212, 255, 0.15);
        transform: translateY(-4px);
    }
    
    /* ===== KPI CARDS - PREMIUM STAT DISPLAY ===== */
    .kpi-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1.5px solid var(--border-light);
        border-radius: 1.25rem;
        padding: 2rem 1.5rem;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transition: all var(--duration-normal) var(--ease-out);
        position: relative;
        overflow: hidden;
    }
    
    .kpi-card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
        border-radius: 50%;
        opacity: 0;
        transition: opacity var(--duration-fast) ease;
    }
    
    .kpi-card:hover {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 12px 48px rgba(0, 212, 255, 0.15);
        transform: translateY(-6px);
        border-color: var(--accent-primary);
    }
    
    .kpi-card:hover::before {
        opacity: 1;
    }
    
    .kpi-value {
        font-size: 2.5rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-primary) 0%, #00E8FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0.75rem 0 0.25rem 0;
        letter-spacing: -0.03em;
    }
    
    .kpi-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }
    
    /* ===== BUTTONS - GRADIENT & GLOW ===== */
    button[data-testid="baseButton-primary"] {
        background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%) !important;
        color: var(--bg-primary) !important;
        border: none !important;
        border-radius: 0.75rem !important;
        padding: 0.875rem 2rem !important;
        font-weight: 700 !important;
        font-size: 0.875rem !important;
        transition: all var(--duration-normal) ease !important;
        box-shadow: 0 6px 20px rgba(0, 212, 255, 0.35) !important;
        text-transform: none !important;
        letter-spacing: 0.02em;
    }
    
    button[data-testid="baseButton-primary"]:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 10px 32px rgba(0, 212, 255, 0.5) !important;
    }
    
    button[data-testid="baseButton-primary"]:active {
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 16px rgba(0, 212, 255, 0.35) !important;
    }
    
    /* Navigation buttons with Streamlit styling */
    [data-testid="stSidebar"] [data-testid="stButton"] button {
        background: linear-gradient(135deg, #0099FF 0%, var(--accent-primary) 100%) !important;
        color: var(--bg-primary) !important;
        border: none !important;
        padding: 0.875rem 1.25rem !important;
        border-radius: 0.75rem !important;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), 0 4px 12px rgba(0, 212, 255, 0.25) !important;
        font-weight: 700 !important;
        font-size: 0.9375rem !important;
        transition: all 0.3s ease !important;
        width: 100% !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stButton"] button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 0 30px rgba(0, 212, 255, 0.6), 0 8px 24px rgba(0, 212, 255, 0.4) !important;
    }
    
    [data-testid="stSidebar"] [data-testid="stButton"] button:active {
        transform: translateY(0) !important;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), 0 2px 8px rgba(0, 212, 255, 0.2) !important;
    }
    
    /* ===== FORM INPUTS - PROFESSIONAL ===== */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div > select {
        background-color: rgba(255, 255, 255, 0.05) !important;
        color: var(--text-primary) !important;
        border: 1.5px solid var(--border-light) !important;
        border-radius: 0.625rem !important;
        padding: 0.875rem 1.125rem !important;
        font-size: 0.9375rem !important;
        transition: all var(--duration-normal) !important;
        font-family: inherit !important;
        font-weight: 500;
    }
    
    .stTextInput > div > div > input::placeholder,
    .stTextArea > div > div > textarea::placeholder {
        color: var(--text-muted) !important;
        opacity: 0.8;
    }
    
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus,
    .stSelectbox > div > div > select:focus {
        outline: none !important;
        background-color: rgba(255, 255, 255, 0.08) !important;
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 0 3px var(--accent-light), var(--shadow-sm) !important;
    }
    
    /* ===== FILE UPLOADER - PROFESSIONAL ===== */
    .stFileUploader {
        border: 2px dashed var(--border-light) !important;
        border-radius: 1.125rem !important;
        padding: 2.75rem 2.25rem !important;
        background: rgba(255, 255, 255, 0.03) !important;
        transition: all var(--duration-normal) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    }
    
    .stFileUploader:hover {
        border-color: var(--accent-primary) !important;
        background: rgba(0, 212, 255, 0.1) !important;
        box-shadow: 0 8px 28px rgba(0, 212, 255, 0.15) !important;
    }
    
    /* ===== TABS ===== */
    .stTabs [role="tab"] {
        color: var(--text-tertiary) !important;
        font-weight: 600 !important;
        font-size: 0.875rem !important;
        border-bottom: 3px solid transparent !important;
        padding: 1rem 1.25rem !important;
        transition: all var(--duration-fast) !important;
    }
    
    .stTabs [role="tab"]:hover {
        color: var(--accent-primary) !important;
    }
    
    .stTabs [aria-selected="true"] {
        color: var(--accent-primary) !important;
        border-bottom-color: var(--accent-primary) !important;
        font-weight: 700 !important;
    }
    
    /* ===== ALERTS ===== */
    .stAlert {
        border-radius: 0.875rem !important;
        border-left: 4px solid var(--accent-primary) !important;
        padding: 1.125rem 1.5rem !important;
        background-color: var(--accent-light) !important;
        border: 1.25px solid var(--border-accent) !important;
        border-left-width: 4px !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
    }
    
    /* ===== BADGES ===== */
    .badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 0.625rem;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all var(--duration-fast);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    
    .badge-success {
        background-color: rgba(0, 255, 136, 0.15);
        color: var(--success);
        border: 1.25px solid rgba(0, 255, 136, 0.35);
    }
    
    .badge-warning {
        background-color: rgba(255, 184, 0, 0.15);
        color: var(--warning);
        border: 1.25px solid rgba(255, 184, 0, 0.35);
    }
    
    .badge-error {
        background-color: rgba(255, 62, 68, 0.15);
        color: var(--error);
        border: 1.25px solid rgba(255, 62, 68, 0.35);
    }
    
    .badge-primary {
        background-color: var(--accent-light);
        color: var(--accent-primary);
        border: 1.25px solid var(--border-accent);
    }
    
    /* ===== SECTION HEADERS ===== */
    .section-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 2.5rem 0 1.75rem 0;
        padding: 1rem 1.5rem;
        border-bottom: none;
        background: linear-gradient(135deg, rgba(0, 99, 255, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%);
        border-left: 4px solid var(--accent-primary);
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.1);
    }
    
    .section-header-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        line-height: 1.2;
        margin: 0;
        background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    
    /* ===== DIVIDER ===== */
    .divider {
        margin: 2rem 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border), transparent);
    }
    
    /* ===== RESOURCE CARD ===== */
    .resource-card {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1.5px solid var(--border-light);
        border-radius: 0.875rem;
        padding: 1.375rem;
        transition: all var(--duration-normal) var(--ease-out);
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .resource-card:hover {
        border-color: var(--accent-primary);
        box-shadow: 0 8px 28px rgba(0, 212, 255, 0.15);
        transform: translateY(-4px);
        background: rgba(255, 255, 255, 0.08);
    }
    
    .resource-title {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 0.5rem;
    }
    
    .resource-description {
        font-size: 0.8125rem;
        color: var(--text-tertiary);
        margin-bottom: 0.75rem;
        line-height: 1.5;
    }
    
    .resource-tag {
        display: inline-block;
        background: var(--accent-light);
        color: var(--accent-primary);
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.65rem;
        font-weight: 700;
        margin-right: 0.4rem;
        margin-bottom: 0.5rem;
        border: 1px solid var(--border-accent);
        transition: all var(--duration-fast);
    }
    
    .resource-tag:hover {
        background: var(--accent-glow);
        border-color: var(--accent-primary);
    }
    
    /* ===== STAT BOX ===== */
    .stat-box {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border: 1.5px solid var(--border-light);
        border-radius: 0.875rem;
        padding: 1.375rem;
        margin-bottom: 0.875rem;
        transition: all var(--duration-fast);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }
    
    .stat-box:hover {
        border-color: var(--border-accent);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 6px 24px rgba(0, 212, 255, 0.1);
    }
    
    .stat-label {
        font-size: 0.7rem;
        color: var(--text-tertiary);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 0.5rem;
    }
    
    .stat-value {
        font-size: 1.75rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-primary) 0%, #00E8FF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.02em;
    }
    
    /* ===== ANIMATIONS ===== */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(12px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes pulseGlow {
        0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.35);
        }
        50% {
            box-shadow: 0 0 0 14px rgba(0, 212, 255, 0);
        }
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.65s ease-out both;
    }
    
    .glow-btn {
        box-shadow: 0 16px 28px rgba(0, 212, 255, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .glow-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 20px 40px rgba(0, 212, 255, 0.35);
    }
    
    /* ===== SCROLLBAR - CUSTOM ===== */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
        border-radius: 4px;
        border: 2px solid var(--bg-secondary);
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, #00E8FF 0%, var(--accent-primary) 100%);
    }
    
    /* ===== SIDEBAR BUTTONS ===== */
    [data-testid="stSidebar"] .stButton > button {
        width: 100%;
        border-radius: 0.75rem !important;
        padding: 0.75rem 1rem !important;
        text-align: left !important;
        font-weight: 600 !important;
        transition: all var(--duration-fast) !important;
        margin-bottom: 0.5rem !important;
        border: 1px solid var(--border) !important;
        background-color: rgba(255, 255, 255, 0.04) !important;
        color: var(--text-secondary) !important;
    }
    
    [data-testid="stSidebar"] .stButton > button:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        color: var(--accent-primary) !important;
        border-color: var(--accent-primary) !important;
        box-shadow: 0 0 16px rgba(0, 212, 255, 0.2) !important;
    }
    
    /* ===== SIDEBAR NAVIGATION - VERTICAL LAYOUT ===== */
    .sidebar-nav {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 2rem 0;
        padding: 0;
    }
    
    .nav-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }
    
    .nav-section-title {
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--text-tertiary);
        padding: 0.5rem 0;
        margin-bottom: 0.5rem;
    }
    
    .nav-button {
        background: linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%) !important;
        color: var(--bg-primary) !important;
        border: none !important;
        border-radius: 0.75rem !important;
        padding: 0.875rem 1.25rem !important;
        font-weight: 700 !important;
        font-size: 0.9375rem !important;
        width: 100% !important;
        transition: all 0.3s ease !important;
        box-shadow: 0 4px 12px rgba(0, 212, 255, 0.25) !important;
        text-align: left;
        display: block;
    }
    
    .nav-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(0, 212, 255, 0.35) !important;
    }
    
    .nav-button:active {
        transform: translateY(0) !important;
        box-shadow: 0 2px 8px rgba(0, 212, 255, 0.2) !important;
    }
    
    .nav-button.active {
        background: linear-gradient(135deg, #0099FF 0%, var(--accent-primary) 100%) !important;
        box-shadow: 0 8px 24px rgba(0, 212, 255, 0.4) !important;
    }
    
    /* Admin Login Form Container */
    [data-testid="stForm"] {
        background: linear-gradient(135deg, rgba(15, 35, 65, 0.5) 0%, rgba(10, 31, 63, 0.5) 100%) !important;
        border: 2px solid rgba(0, 212, 255, 0.2) !important;
        border-radius: 1.5rem !important;
        padding: 2.5rem !important;
        margin: 2rem 0 !important;
        box-shadow: 0 0 40px rgba(0, 212, 255, 0.15), inset 0 0 30px rgba(0, 212, 255, 0.05) !important;
        backdrop-filter: blur(10px) !important;
    }
    
    /* Form Submit Button - Admin Login */
    [data-testid="stForm"] [data-testid="stBaseButton"] button {
        background: linear-gradient(135deg, #0099FF 0%, var(--accent-primary) 100%) !important;
        color: var(--bg-primary) !important;
        border: none !important;
        padding: 1rem 2rem !important;
        border-radius: 0.875rem !important;
        font-weight: 700 !important;
        font-size: 0.9375rem !important;
        box-shadow: 0 0 25px rgba(0, 212, 255, 0.35), 0 4px 12px rgba(0, 212, 255, 0.25) !important;
        transition: all 0.3s ease !important;
        letter-spacing: 0.02em;
    }
    
    [data-testid="stForm"] [data-testid="stBaseButton"] button:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 0 35px rgba(0, 212, 255, 0.5), 0 8px 24px rgba(0, 212, 255, 0.35) !important;
    }
    
    [data-testid="stForm"] [data-testid="stBaseButton"] button:active {
        transform: translateY(-1px) !important;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), 0 4px 12px rgba(0, 212, 255, 0.2) !important;
    }
    
    /* Admin Input Styling */
    [data-testid="stForm"] .stTextInput > div > div > input {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%) !important;
        border: 2px solid rgba(0, 212, 255, 0.25) !important;
        border-radius: 0.875rem !important;
        padding: 0.9375rem 1.25rem !important;
        color: #E8F0FE !important;
        font-size: 0.9375rem !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
    }
    
    [data-testid="stForm"] .stTextInput > div > div > input::placeholder {
        color: rgba(203, 213, 225, 0.5) !important;
    }
    
    [data-testid="stForm"] .stTextInput > div > div > input:focus {
        outline: none !important;
        border-color: #00D4FF !important;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%) !important;
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 15px rgba(0, 212, 255, 0.1) !important;
    }
    
    /* ===== METRIC STYLING ===== */
    [data-testid="metric-container"] {
        background: linear-gradient(135deg, rgba(0, 99, 255, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%) !important;
        border: 2px solid rgba(0, 212, 255, 0.3) !important;
        border-radius: 1rem !important;
        padding: 1.5rem !important;
        box-shadow: 0 4px 16px rgba(0, 212, 255, 0.1) !important;
        transition: all 0.3s ease !important;
    }
    
    [data-testid="metric-container"]:hover {
        border-color: rgba(0, 212, 255, 0.5) !important;
        box-shadow: 0 8px 24px rgba(0, 212, 255, 0.2) !important;
        transform: translateY(-2px) !important;
    }
    
    [data-testid="metric-container"] .metric-label {
        font-size: 0.85rem !important;
        color: #cbd5e1 !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.05em !important;
    }
    
    [data-testid="metric-container"] .metric-value {
        font-size: 1.875rem !important;
        font-weight: 800 !important;
        background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%) !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
    }
    
    /* ===== DATAFRAME STYLING ===== */
    [data-testid="stDataFrame"] {
        background: linear-gradient(135deg, rgba(0, 99, 255, 0.08) 0%, rgba(0, 212, 255, 0.05) 100%) !important;
        border: 1px solid rgba(0, 212, 255, 0.2) !important;
        border-radius: 0.75rem !important;
        overflow: hidden !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
    }
    
    [data-testid="stDataFrame"] table {
        background: transparent !important;
    }
    
    [data-testid="stDataFrame"] thead th {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 99, 255, 0.15) 100%) !important;
        color: #00D4FF !important;
        font-weight: 700 !important;
        border-bottom: 2px solid rgba(0, 212, 255, 0.3) !important;
    }
    
    [data-testid="stDataFrame"] tbody td {
        background: transparent !important;
        border-bottom: 1px solid rgba(0, 212, 255, 0.1) !important;
        color: #cbd5e1 !important;
    }
    
    [data-testid="stDataFrame"] tbody tr:hover {
        background: rgba(0, 212, 255, 0.08) !important;
    }
    
        h1 {
            font-size: 1.875rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        h3 {
            font-size: 1.25rem;
        }

        .card, .stat-box, .resource-card {
            padding: 1rem;
        }
        
        .kpi-value {
            font-size: 1.875rem;
        }
    }
    
    </style>
""", unsafe_allow_html=True)

# ============================================================================
# API CONFIGURATION
# ============================================================================

API_URL = "http://localhost:8000"

# ============================================================================
# CACHED API FUNCTIONS (Optimized for Performance)
# ============================================================================

@st.cache_data(ttl=300)  # Cache for 5 minutes
def fetch_analytics_data(token):
    """Fetch analytics data with caching"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/admin/analytics", headers=headers)
    if response.status_code == 200:
        return response.json()
    return None

@st.cache_data(ttl=300)  # Cache for 5 minutes
def fetch_resumes_data(token, limit=100, offset=0):
    """Fetch resumes data with caching and pagination"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/admin/resumes", headers=headers, params={"limit": limit, "offset": offset})
    if response.status_code == 200:
        return response.json()
    return None

# ============================================================================
# SESSION STATE INITIALIZATION
# ============================================================================

if 'current_page' not in st.session_state:
    st.session_state.current_page = 'Upload Resume'
if 'analysis_result' not in st.session_state:
    st.session_state.analysis_result = None
if 'admin_token' not in st.session_state:
    st.session_state.admin_token = None

# ============================================================================
# PREMIUM UTILITY FUNCTIONS
# ============================================================================

def render_header(title: str, subtitle: str = ""):
    """Render premium rockstar page header"""
    subtitle_html = f'<p class="rockstar-page-subtitle">{subtitle}</p>' if subtitle else ''
    st.markdown(f"""
        <style>
            .rockstar-page-header {{
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-bottom: 2rem;
                padding: 2rem;
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.08) 0%, rgba(0, 212, 255, 0.06) 50%, rgba(0, 99, 255, 0.05) 100%);
                border: 2px solid rgba(0, 255, 136, 0.25);
                border-radius: 1rem;
                box-shadow: 0 0 40px rgba(0, 255, 136, 0.15), 0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 20px rgba(0, 255, 136, 0.04);
                backdrop-filter: blur(10px);
                position: relative;
            }}
            .rockstar-page-title {{
                font-size: 2rem;
                font-weight: 900;
                background: linear-gradient(135deg, #00FF88 0%, #00FFD4 25%, #00D4FF 50%, #0099FF 75%, #00FF88 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0;
                line-height: 1.1;
                letter-spacing: -0.02em;
                text-shadow: 0 0 30px rgba(0, 255, 136, 0.25);
            }}
            .rockstar-page-subtitle {{
                font-size: 1rem;
                color: #00D4FF;
                font-weight: 600;
                margin: 0;
                letter-spacing: 0.05em;
                text-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
            }}
        </style>
        <div class="rockstar-page-header">
            <h1 class="rockstar-page-title">{title}</h1>
            {subtitle_html}
        </div>
    """, unsafe_allow_html=True)

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
    # Render rockstar premium brand header with intense glow
    st.markdown("""
        <style>
            @keyframes rockstar_pulse {
                0% { transform: scale(1) rotate(0deg); }
                25% { transform: scale(1.15) rotate(5deg); }
                50% { transform: scale(1) rotate(0deg); }
                75% { transform: scale(1.15) rotate(-5deg); }
                100% { transform: scale(1) rotate(0deg); }
            }
            .rockstar-header {
                display: flex;
                align-items: center;
                gap: 1.2rem;
                margin-bottom: 2.5rem;
                padding: 1.5rem;
                background: linear-gradient(135deg, rgba(0, 255, 136, 0.12) 0%, rgba(0, 212, 255, 0.08) 50%, rgba(0, 99, 255, 0.08) 100%);
                border: 3px solid rgba(0, 255, 136, 0.3);
                border-radius: 1.2rem;
                box-shadow: 0 0 50px rgba(0, 255, 136, 0.25), 0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 30px rgba(0, 255, 136, 0.08);
                backdrop-filter: blur(12px);
                position: relative;
            }
            .rockstar-icon {
                font-size: 3rem;
                text-shadow: 0 0 30px rgba(0, 255, 136, 0.6), 0 0 60px rgba(0, 212, 255, 0.4);
                animation: rockstar_pulse 2.5s ease-in-out infinite;
            }
            .rockstar-title {
                font-size: 1.8rem;
                font-weight: 900;
                background: linear-gradient(90deg, #00FF88, #00FFD4, #00D4FF, #0099FF);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin: 0;
                line-height: 1;
                letter-spacing: -0.03em;
            }
            .rockstar-subtitle {
                font-size: 0.75rem;
                background: linear-gradient(90deg, #00FF88, #00D4FF);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                margin: 0.4rem 0 0 0;
                font-family: "Courier New", monospace;
            }
        </style>
        <div class="rockstar-header">
            <div class="rockstar-icon">📄</div>
            <div>
                <h2 class="rockstar-title">Resume AI</h2>
                <p class="rockstar-subtitle">✨ AI Analysis Platform ✨</p>
            </div>
        </div>
    """, unsafe_allow_html=True)

    # Navigation section
    st.markdown("<div class='nav-section-title'>NAVIGATION</div>", unsafe_allow_html=True)

    if st.button("📤 Upload Resume", use_container_width=True, key="nav_upload", help="Submit and analyze your resume"):
        st.session_state.current_page = "Upload Resume"
        st.rerun()
    
    if st.button("📊 Dashboard", use_container_width=True, key="nav_dashboard", help="View your analysis dashboard"):
        st.session_state.current_page = "Dashboard"
        st.rerun()
    
    if st.button("📚 Resources", use_container_width=True, key="nav_resources", help="Learning materials and guides"):
        st.session_state.current_page = "Resources"
        st.rerun()

    # Settings section
    st.markdown("<div class='nav-section-title' style='margin-top: 2rem;'>SETTINGS</div>", unsafe_allow_html=True)

    settings_cols = st.columns(2, gap="small")
    
    with settings_cols[0]:
        if st.button("⚙️ Settings", use_container_width=True, key="nav_settings", help="User preferences"):
            st.session_state.current_page = "Settings"
            st.rerun()
    
    with settings_cols[1]:
        if st.button("❓ Help", use_container_width=True, key="nav_help", help="Help and support"):
            st.session_state.current_page = "Help"
            st.rerun()

    # Add spacing after navigation
    st.markdown("<div style='margin-bottom: 2rem;'></div>", unsafe_allow_html=True)

# ============================================================================
# PAGE: UPLOAD RESUME
# ============================================================================

if st.session_state.current_page == "Upload Resume":
    render_header(
        "📤 Upload Resume",
        "Get AI-powered analysis of your resume in seconds"
    )
    
    st.markdown("<div class='section-header'><span class='section-header-title'>Submit Your Resume</span></div>", unsafe_allow_html=True)
    
    with st.form("resume_upload_form"):
        st.markdown("""
            <p style='font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0;'>Your Information</p>
        """, unsafe_allow_html=True)
        
        name_col, email_col = st.columns(2)
        with name_col:
            user_name = st.text_input("Full Name", placeholder="John Doe", key="upload_name")
        with email_col:
            email = st.text_input("Email Address", placeholder="john@example.com", key="upload_email")
        
        phone = st.text_input("Phone Number", placeholder="+1 (555) 000-0000", key="upload_phone")
        
        st.markdown("""
            <p style='font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 24px 0 16px 0;'>Upload Document</p>
        """, unsafe_allow_html=True)
        
        uploaded_file = st.file_uploader(
            "Select your resume (PDF or DOCX)",
            type=["pdf", "docx", "doc"],
            help="Maximum file size: 10MB"
        )
        
        if uploaded_file:
            st.markdown(f"""
                <div style='
                    background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%);
                    border: 2px solid rgba(0, 255, 136, 0.4);
                    border-radius: 1rem;
                    padding: 1.25rem 1.5rem;
                    margin: 1.5rem 0;
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    animation: pulse-glow 2s ease-in-out infinite;
                '>
                    <div style='
                        font-size: 1.5rem;
                        text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
                        animation: bounce 1s ease-in-out infinite;
                    '>✓</div>
                    <div>
                        <p style='
                            font-size: 0.9375rem;
                            font-weight: 700;
                            color: #00FF88;
                            margin: 0;
                            text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);
                        '>{uploaded_file.name} selected</p>
                        <p style='
                            font-size: 0.75rem;
                            color: #00D4FF;
                            margin: 0.25rem 0 0 0;
                            font-weight: 600;
                        '>Ready for analysis</p>
                    </div>
                </div>
                <style>
                    @keyframes pulse-glow {{
                        0%, 100% {{ box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1); }}
                        50% {{ box-shadow: 0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 25px rgba(0, 255, 136, 0.15); }}
                    }}
                    @keyframes bounce {{
                        0%, 100% {{ transform: translateY(0); }}
                        50% {{ transform: translateY(-4px); }}
                    }}
                </style>
            """, unsafe_allow_html=True)
        
        st.markdown("""
            <style>
                button[data-testid="FormSubmitButton"] {
                    width: 100% !important;
                    padding: 1rem 2rem !important;
                    background: linear-gradient(135deg, rgba(0, 255, 136, 0.25) 0%, rgba(0, 212, 255, 0.2) 100%) !important;
                    border: 2px solid rgba(0, 255, 136, 0.5) !important;
                    color: #00FF88 !important;
                    font-size: 1.1rem !important;
                    font-weight: 900 !important;
                    text-shadow: 0 0 15px rgba(0, 255, 136, 0.5) !important;
                    box-shadow: 0 0 50px rgba(0, 255, 136, 0.3), 0 0 25px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 255, 136, 0.08) !important;
                    backdrop-filter: blur(10px) !important;
                    border-radius: 0.75rem !important;
                    letter-spacing: 0.05em !important;
                    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                }
                button[data-testid="FormSubmitButton"]:hover {
                    background: linear-gradient(135deg, rgba(0, 255, 136, 0.4) 0%, rgba(0, 212, 255, 0.35) 100%) !important;
                    box-shadow: 0 0 80px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 212, 255, 0.35), inset 0 0 25px rgba(0, 255, 136, 0.15) !important;
                    transform: translateY(-3px) scale(1.02) !important;
                    border-color: rgba(0, 255, 136, 0.8) !important;
                }
                button[data-testid="FormSubmitButton"]:active {
                    transform: translateY(0) scale(0.98) !important;
                }
            </style>
        """, unsafe_allow_html=True)
        
        st.markdown("<div style='margin-top: 28px;'></div>", unsafe_allow_html=True)
        submitted = st.form_submit_button("🚀 Analyze Resume", use_container_width=True)
    
    if submitted:
        if not user_name or not email or not uploaded_file:
            st.markdown("""
                <div style='
                    background: linear-gradient(135deg, rgba(255, 62, 68, 0.15) 0%, rgba(255, 120, 0, 0.1) 100%);
                    border: 2px solid rgba(255, 62, 68, 0.4);
                    border-radius: 1rem;
                    padding: 1.25rem 1.5rem;
                    margin: 1.5rem 0;
                    box-shadow: 0 0 20px rgba(255, 62, 68, 0.3), inset 0 0 20px rgba(255, 62, 68, 0.1);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    animation: pulse-error 2s ease-in-out infinite;
                '>
                    <div style='font-size: 1.5rem; text-shadow: 0 0 10px rgba(255, 62, 68, 0.5);'>⚠️</div>
                    <div>
                        <p style='font-size: 0.9375rem; font-weight: 700; color: #FF3E44; margin: 0; text-shadow: 0 0 8px rgba(255, 62, 68, 0.4);'>Please fill in all fields</p>
                        <p style='font-size: 0.75rem; color: #FFB800; margin: 0.25rem 0 0 0; font-weight: 600;'>Name, email, and resume are required</p>
                    </div>
                </div>
                <style>
                    @keyframes pulse-error {{
                        0%, 100% {{ box-shadow: 0 0 20px rgba(255, 62, 68, 0.3), inset 0 0 20px rgba(255, 62, 68, 0.1); }}
                        50% {{ box-shadow: 0 0 30px rgba(255, 62, 68, 0.5), inset 0 0 25px rgba(255, 62, 68, 0.15); }}
                    }}
                </style>
            """, unsafe_allow_html=True)
        else:
            st.markdown("""
                <div style='
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 99, 255, 0.1) 100%);
                    border: 2px solid rgba(0, 212, 255, 0.4);
                    border-radius: 1rem;
                    padding: 1.5rem;
                    margin: 1.5rem 0;
                    box-shadow: 0 0 25px rgba(0, 212, 255, 0.4), inset 0 0 25px rgba(0, 212, 255, 0.15);
                    backdrop-filter: blur(10px);
                    text-align: center;
                    animation: pulse-loading 1.5s ease-in-out infinite;
                '>
                    <div style='
                        display: inline-block;
                        font-size: 2rem;
                        margin-bottom: 0.75rem;
                        animation: spin 2s linear infinite;
                    '>🚀</div>
                    <p style='
                        font-size: 1rem;
                        font-weight: 700;
                        color: #00D4FF;
                        margin: 0;
                        text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
                    '>Analyzing your resume...</p>
                    <p style='
                        font-size: 0.8125rem;
                        color: #cbd5e1;
                        margin: 0.5rem 0 0 0;
                        font-weight: 600;
                    '>AI is reviewing your skills and experience</p>
                </div>
                <style>
                    @keyframes pulse-loading {{
                        0%, 100% {{ box-shadow: 0 0 25px rgba(0, 212, 255, 0.4), inset 0 0 25px rgba(0, 212, 255, 0.15); }}
                        50% {{ box-shadow: 0 0 35px rgba(0, 212, 255, 0.6), inset 0 0 30px rgba(0, 212, 255, 0.25); }}
                    }}
                    @keyframes spin {{
                        from {{ transform: rotate(0deg); }}
                        to {{ transform: rotate(360deg); }}
                    }}
                </style>
            """, unsafe_allow_html=True)
            with st.spinner(""):
                try:
                    files = {'file': (uploaded_file.name, uploaded_file.getvalue())}
                    data = {'user_name': user_name, 'email': email, 'phone': phone}
                    response = requests.post(f"{API_URL}/upload-resume", files=files, data=data)
                    
                    if response.status_code == 200:
                        result = response.json()
                        st.session_state.analysis_result = result['analysis']
                        st.session_state.resume_id = result.get('resume_id')
                        st.markdown("""
                            <div style='
                                background: linear-gradient(135deg, rgba(0, 255, 136, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%);
                                border: 2px solid rgba(0, 255, 136, 0.4);
                                border-radius: 1rem;
                                padding: 1.25rem 1.5rem;
                                margin: 1.5rem 0;
                                box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
                                backdrop-filter: blur(10px);
                                display: flex;
                                align-items: center;
                                gap: 1rem;
                                animation: pulse-success 1s ease-in-out;
                            '>
                                <div style='font-size: 1.5rem; text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);'>✓</div>
                                <div>
                                    <p style='font-size: 0.9375rem; font-weight: 700; color: #00FF88; margin: 0; text-shadow: 0 0 8px rgba(0, 255, 136, 0.4);'>Resume analyzed successfully!</p>
                                    <p style='font-size: 0.75rem; color: #00D4FF; margin: 0.25rem 0 0 0; font-weight: 600;'>Check the analysis results below</p>
                                </div>
                            </div>
                            <style>
                                @keyframes pulse-success {{
                                    0% {{ opacity: 0; transform: scale(0.95); }}
                                    50% {{ box-shadow: 0 0 30px rgba(0, 255, 136, 0.5), inset 0 0 25px rgba(0, 255, 136, 0.15); }}
                                    100% {{ opacity: 1; transform: scale(1); }}
                                }}
                            </style>
                        """, unsafe_allow_html=True)
                    else:
                        error_msg = response.json().get('detail', 'Analysis failed')
                        st.markdown(f"""
                            <div style='
                                background: linear-gradient(135deg, rgba(255, 62, 68, 0.15) 0%, rgba(255, 120, 0, 0.1) 100%);
                                border: 2px solid rgba(255, 62, 68, 0.4);
                                border-radius: 1rem;
                                padding: 1.25rem 1.5rem;
                                margin: 1.5rem 0;
                                box-shadow: 0 0 20px rgba(255, 62, 68, 0.3), inset 0 0 20px rgba(255, 62, 68, 0.1);
                                backdrop-filter: blur(10px);
                                display: flex;
                                align-items: center;
                                gap: 1rem;
                            '>
                                <div style='font-size: 1.5rem; text-shadow: 0 0 10px rgba(255, 62, 68, 0.5);'>✗</div>
                                <div>
                                    <p style='font-size: 0.9375rem; font-weight: 700; color: #FF3E44; margin: 0; text-shadow: 0 0 8px rgba(255, 62, 68, 0.4);'>Error: {error_msg}</p>
                                    <p style='font-size: 0.75rem; color: #FFB800; margin: 0.25rem 0 0 0; font-weight: 600;'>Please try again or contact support</p>
                                </div>
                            </div>
                        """, unsafe_allow_html=True)
                except Exception as e:
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(255, 62, 68, 0.15) 0%, rgba(255, 120, 0, 0.1) 100%);
                            border: 2px solid rgba(255, 62, 68, 0.4);
                            border-radius: 1rem;
                            padding: 1.25rem 1.5rem;
                            margin: 1.5rem 0;
                            box-shadow: 0 0 20px rgba(255, 62, 68, 0.3), inset 0 0 20px rgba(255, 62, 68, 0.1);
                            backdrop-filter: blur(10px);
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                        '>
                            <div style='font-size: 1.5rem; text-shadow: 0 0 10px rgba(255, 62, 68, 0.5);'>✗</div>
                            <div>
                                <p style='font-size: 0.9375rem; font-weight: 700; color: #FF3E44; margin: 0; text-shadow: 0 0 8px rgba(255, 62, 68, 0.4);'>Connection error: {str(e)}</p>
                                <p style='font-size: 0.75rem; color: #FFB800; margin: 0.25rem 0 0 0; font-weight: 600;'>Unable to reach the analysis server</p>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
    
    # Analysis Results
    if st.session_state.analysis_result:
        st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
        st.markdown("<div class='section-header'><span class='section-header-title'>Analysis Results</span></div>", unsafe_allow_html=True)
        
        analysis = st.session_state.analysis_result
        scores = analysis['scores']
        
        kpi_cols = st.columns(5)
        kpi_data = [
            ("Overall Score", f"{scores['overall_score']:.0f}", scores['overall_score']),
            ("Skills", f"{scores['skills_score']:.0f}", scores['skills_score']),
            ("Experience", f"{scores['experience_score']:.0f}", scores['experience_score']),
            ("Education", f"{scores['education_score']:.0f}", scores['education_score']),
            ("Formatting", f"{scores['formatting_score']:.0f}", scores['formatting_score']),
        ]
        
        for col, (label, value, score) in zip(kpi_cols, kpi_data):
            with col:
                badge_type, badge_text = get_score_badge(score)
                st.markdown(f"""
                <div class='kpi-card'>
                    <div class='kpi-label'>{label}</div>
                    <div class='kpi-value'>{value}/100</div>
                    <div style='margin-top: 8px;'><span class='badge badge-{badge_type}'>{badge_text}</span></div>
                </div>
                """, unsafe_allow_html=True)
        
        st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
        
        tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs(["📋 Summary", "🎯 Changes", "🔑 Keywords", "🛠️ ATS", "📚 Dev", "🎪 Roles"])
        
        with tab1:
            st.markdown("### 📋 Profile Summary")
            
            # Overall Strategy in Premium Full-Width Card
            if analysis.get('overall_strategy'):
                st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
                        border: 2px solid rgba(220, 38, 38, 0.35);
                        border-radius: 1.5rem;
                        padding: 2rem;
                        margin-bottom: 3rem;
                        box-shadow: 0 0 40px rgba(220, 38, 38, 0.15), inset 0 0 25px rgba(220, 38, 38, 0.05);
                        backdrop-filter: blur(10px);
                    '>
                        <div style='
                            display: flex;
                            align-items: flex-start;
                            gap: 1.5rem;
                        '>
                            <div style='
                                width: 60px;
                                height: 60px;
                                background: linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(220, 38, 38, 0.2) 100%);
                                border: 2.5px solid rgba(220, 38, 38, 0.6);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.75rem;
                                box-shadow: 0 0 25px rgba(220, 38, 38, 0.4), inset 0 0 10px rgba(220, 38, 38, 0.2);
                                flex-shrink: 0;
                            '>🎯</div>
                            <div style='flex: 1;'>
                                <h3 style='
                                    color: #DC2626;
                                    margin: 0 0 0.5rem 0;
                                    font-size: 1rem;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.1em;
                                    text-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
                                '>Strategic Focus</h3>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 1rem;
                                    line-height: 1.7;
                                    font-weight: 500;
                                '>{analysis['overall_strategy']}</p>
                            </div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
            
            # Two Column Layout for Strengths and Skills
            col1, col2 = st.columns(2, gap="large")
            
            with col1:
                # Strengths Header
                st.markdown("""
                    <div style='
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding: 0;
                    '>
                        <div style='
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.15) 100%);
                            border: 2px solid rgba(34, 197, 94, 0.5);
                            border-radius: 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
                        '>✅</div>
                        <div>
                            <h3 style='
                                color: #22C55E;
                                margin: 0;
                                font-size: 1.05rem;
                                font-weight: 700;
                                text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                            '>Your Strengths</h3>
                            <p style='
                                color: #cbd5e1;
                                margin: 0.25rem 0 0 0;
                                font-size: 0.8rem;
                            '>Key professional assets</p>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                # Strength Items
                for s in analysis.get('strengths', [])[:3]:
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
                            border: 1.5px solid rgba(34, 197, 94, 0.3);
                            border-radius: 1rem;
                            padding: 1.25rem;
                            margin-bottom: 1rem;
                            box-shadow: 0 0 15px rgba(34, 197, 94, 0.08);
                            transition: all 0.3s ease;
                        '>
                            <div style='
                                display: flex;
                                gap: 0.75rem;
                                align-items: flex-start;
                            '>
                                <div style='
                                    color: #22C55E;
                                    font-size: 1.1rem;
                                    font-weight: 700;
                                    margin-top: 0.1rem;
                                    flex-shrink: 0;
                                '>✓</div>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                    line-height: 1.5;
                                '>{s}</p>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
            
            with col2:
                # Skills Header
                st.markdown("""
                    <div style='
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        padding: 0;
                    '>
                        <div style='
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.35) 0%, rgba(0, 212, 255, 0.15) 100%);
                            border: 2px solid rgba(0, 212, 255, 0.5);
                            border-radius: 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            box-shadow: 0 0 20px rgba(0, 212, 255, 0.25);
                        '>📊</div>
                        <div>
                            <h3 style='
                                color: #00D4FF;
                                margin: 0;
                                font-size: 1.05rem;
                                font-weight: 700;
                                text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
                            '>Your Skills</h3>
                            <p style='
                                color: #cbd5e1;
                                margin: 0.25rem 0 0 0;
                                font-size: 0.8rem;
                            '>Standout technical abilities</p>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                # Skill Items
                for sk in analysis.get('skills_to_emphasize', []):
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.05) 100%);
                            border: 1.5px solid rgba(0, 212, 255, 0.3);
                            border-radius: 1rem;
                            padding: 1.25rem;
                            margin-bottom: 1rem;
                            box-shadow: 0 0 15px rgba(0, 212, 255, 0.08);
                            transition: all 0.3s ease;
                        '>
                            <div style='
                                display: flex;
                                gap: 0.75rem;
                                align-items: flex-start;
                            '>
                                <div style='
                                    width: 28px;
                                    height: 28px;
                                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.15) 100%);
                                    border: 1px solid rgba(0, 212, 255, 0.4);
                                    border-radius: 0.4rem;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 0.65rem;
                                    flex-shrink: 0;
                                    box-shadow: 0 0 8px rgba(0, 212, 255, 0.2);
                                '>→</div>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    font-weight: 600;
                                    line-height: 1.5;
                                '>{sk}</p>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
        
        with tab2:
            st.markdown("### 🎯 Priority Changes")
            st.markdown("""
                <p style='
                    color: #cbd5e1;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                '>Focus on these critical improvements to maximize your resume impact:</p>
            """, unsafe_allow_html=True)
            
            for i, change in enumerate(analysis.get('priority_changes', []), 1):
                st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.08) 100%);
                        border: 2px solid rgba(251, 146, 60, 0.3);
                        border-radius: 1.25rem;
                        padding: 1.75rem;
                        margin-bottom: 1.25rem;
                        box-shadow: 0 0 25px rgba(251, 146, 60, 0.1), inset 0 0 15px rgba(251, 146, 60, 0.03);
                        backdrop-filter: blur(10px);
                    '>
                        <div style='
                            display: flex;
                            align-items: flex-start;
                            gap: 1rem;
                            margin-bottom: 1rem;
                        '>
                            <div style='
                                width: 44px;
                                height: 44px;
                                background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.15) 100%);
                                border: 2px solid rgba(251, 146, 60, 0.5);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                color: #FB923C;
                                font-size: 1.1rem;
                                box-shadow: 0 0 15px rgba(251, 146, 60, 0.3);
                                flex-shrink: 0;
                            '>{i}</div>
                            <div style='flex: 1;'>
                                <h4 style='
                                    color: #FB923C;
                                    margin: 0;
                                    font-size: 1rem;
                                    font-weight: 700;
                                    text-shadow: 0 0 8px rgba(251, 146, 60, 0.25);
                                '>{change.get('change', 'Change')}</h4>
                            </div>
                        </div>
                        <div style='
                            display: flex;
                            flex-direction: column;
                            gap: 1rem;
                        '>
                            <div>
                                <h5 style='
                                    color: #FFB800;
                                    margin: 0 0 0.5rem 0;
                                    font-size: 0.85rem;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                '>Why This Matters</h5>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    line-height: 1.5;
                                '>{change.get('why', '')}</p>
                            </div>
                            <div style='
                                padding-top: 0.75rem;
                                border-top: 1px solid rgba(251, 146, 60, 0.2);
                            '>
                                <h5 style='
                                    color: #FFB800;
                                    margin: 0 0 0.5rem 0;
                                    font-size: 0.85rem;
                                    font-weight: 700;
                                    text-transform: uppercase;
                                    letter-spacing: 0.05em;
                                '>How to Implement</h5>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    line-height: 1.5;
                                '>{change.get('how', '')}</p>
                            </div>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
        
        with tab3:
            st.markdown("### 🔑 Keywords & Metrics")
            
            col1, col2 = st.columns(2, gap="large")
            
            with col1:
                st.markdown("""
                    <div style='
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    '>
                        <div style='
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, rgba(239, 68, 68, 0.35) 0%, rgba(239, 68, 68, 0.15) 100%);
                            border: 2px solid rgba(239, 68, 68, 0.5);
                            border-radius: 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
                        '>🔍</div>
                        <div>
                            <h3 style='
                                color: #EF4444;
                                margin: 0;
                                font-size: 1.05rem;
                                font-weight: 700;
                                text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
                            '>Missing Keywords</h3>
                            <p style='
                                color: #cbd5e1;
                                margin: 0.25rem 0 0 0;
                                font-size: 0.8rem;
                            '>Add these to boost ATS score</p>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                for kw in analysis.get('missing_keywords', []):
                    keyword = kw.get('keyword', '') if isinstance(kw, dict) else kw
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
                            border: 1.5px solid rgba(239, 68, 68, 0.3);
                            border-radius: 1rem;
                            padding: 1rem;
                            margin-bottom: 0.75rem;
                            box-shadow: 0 0 12px rgba(239, 68, 68, 0.08);
                        '>
                            <div style='
                                display: flex;
                                gap: 0.75rem;
                                align-items: center;
                            '>
                                <div style='
                                    color: #EF4444;
                                    font-size: 1rem;
                                    flex-shrink: 0;
                                '>+</div>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                '>{keyword}</p>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
            
            with col2:
                st.markdown("""
                    <div style='
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    '>
                        <div style='
                            width: 50px;
                            height: 50px;
                            background: linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.15) 100%);
                            border: 2px solid rgba(34, 197, 94, 0.5);
                            border-radius: 0.75rem;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.5rem;
                            box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
                        '>📊</div>
                        <div>
                            <h3 style='
                                color: #22C55E;
                                margin: 0;
                                font-size: 1.05rem;
                                font-weight: 700;
                                text-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
                            '>Metrics to Add</h3>
                            <p style='
                                color: #cbd5e1;
                                margin: 0.25rem 0 0 0;
                                font-size: 0.8rem;
                            '>Quantifiable achievements</p>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
                
                for m in analysis.get('metrics_to_add', []):
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
                            border: 1.5px solid rgba(34, 197, 94, 0.3);
                            border-radius: 1rem;
                            padding: 1rem;
                            margin-bottom: 0.75rem;
                            box-shadow: 0 0 12px rgba(34, 197, 94, 0.08);
                        '>
                            <div style='
                                display: flex;
                                gap: 0.75rem;
                                align-items: center;
                            '>
                                <div style='
                                    color: #22C55E;
                                    font-size: 1rem;
                                    flex-shrink: 0;
                                '>✓</div>
                                <p style='
                                    color: #E8F0FE;
                                    margin: 0;
                                    font-size: 0.95rem;
                                    font-weight: 500;
                                '>{m}</p>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
        
        with tab4:
            st.markdown("### 🛠️ ATS Optimization")
            st.markdown("""
                <p style='
                    color: #cbd5e1;
                    font-size: 0.9rem;
                    margin-bottom: 1.5rem;
                '>Implement these ATS-friendly improvements to maximize applicant tracking system compatibility:</p>
            """, unsafe_allow_html=True)
            
            for i, tip in enumerate(analysis.get('ats_optimization', []), 1):
                st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 99, 255, 0.08) 100%);
                        border: 2px solid rgba(0, 212, 255, 0.3);
                        border-radius: 1.25rem;
                        padding: 1.75rem;
                        margin-bottom: 1.25rem;
                        box-shadow: 0 0 25px rgba(0, 212, 255, 0.1), inset 0 0 15px rgba(0, 212, 255, 0.03);
                        backdrop-filter: blur(10px);
                    '>
                        <div style='
                            display: flex;
                            align-items: flex-start;
                            gap: 1rem;
                        '>
                            <div style='
                                width: 44px;
                                height: 44px;
                                background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.15) 100%);
                                border: 2px solid rgba(0, 212, 255, 0.5);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-weight: 700;
                                color: #00D4FF;
                                font-size: 1.1rem;
                                box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
                                flex-shrink: 0;
                            '>{i}</div>
                            <p style='
                                color: #E8F0FE;
                                margin: 0;
                                font-size: 0.95rem;
                                font-weight: 500;
                                line-height: 1.6;
                            '>{tip}</p>
                        </div>
                    </div>
                """, unsafe_allow_html=True)
        
        
        with tab5:
            st.markdown("### 🎯 Development Plan")
            ra = analysis.get('role_specific_advice', {})
            
            # Development Plan Header
            st.markdown("""
                <div style='
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 99, 255, 0.06) 100%);
                    border-left: 5px solid #00D4FF;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 0 25px rgba(0, 212, 255, 0.12), inset 0 0 15px rgba(0, 212, 255, 0.04);
                    backdrop-filter: blur(10px);
                '>
                    <h3 style='
                        color: #00D4FF;
                        margin-top: 0;
                        font-size: 1.35rem;
                        font-weight: 700;
                        text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
                    '>📋 Your Career Development Roadmap</h3>
                    <p style='
                        color: #cbd5e1;
                        margin: 0.5rem 0 0 0;
                        font-size: 0.95rem;
                    '>Strategic insights to accelerate your professional growth</p>
                </div>
            """, unsafe_allow_html=True)
            
            # Three Column Layout with Premium Design
            col1, col2, col3 = st.columns(3, gap="medium")
            
            with col1:
                target_role = ra.get('target_role', 'Research target roles')
                st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
                        border: 2px solid rgba(220, 38, 38, 0.3);
                        border-radius: 1.25rem;
                        padding: 2rem 1.5rem;
                        box-shadow: 0 0 30px rgba(220, 38, 38, 0.12), inset 0 0 20px rgba(220, 38, 38, 0.04);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                        text-align: left;
                    '>
                        <div style='
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            margin-bottom: 1rem;
                        '>
                            <div style='
                                width: 50px;
                                height: 50px;
                                background: linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(220, 38, 38, 0.15) 100%);
                                border: 2px solid rgba(220, 38, 38, 0.5);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.5rem;
                                box-shadow: 0 0 15px rgba(220, 38, 38, 0.3);
                            '>🎯</div>
                            <h4 style='
                                color: #DC2626;
                                margin: 0;
                                font-size: 0.75rem;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.1em;
                            '>Target Role</h4>
                        </div>
                        <p style='
                            color: #E8F0FE;
                            margin: 0;
                            font-size: 1.15rem;
                            font-weight: 600;
                            line-height: 1.5;
                        '>{target_role}</p>
                    </div>
                """, unsafe_allow_html=True)
            
            with col2:
                skills_gap = ra.get('required_skills_gap', 'Identify key skills needed')
                st.markdown(f"""
                    <div style='
                        background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 146, 60, 0.08) 100%);
                        border: 2px solid rgba(251, 146, 60, 0.3);
                        border-radius: 1.25rem;
                        padding: 2rem 1.5rem;
                        box-shadow: 0 0 30px rgba(251, 146, 60, 0.12), inset 0 0 20px rgba(251, 146, 60, 0.04);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                        text-align: left;
                    '>
                        <div style='
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            margin-bottom: 1rem;
                        '>
                            <div style='
                                width: 50px;
                                height: 50px;
                                background: linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(251, 146, 60, 0.15) 100%);
                                border: 2px solid rgba(251, 146, 60, 0.5);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.5rem;
                                box-shadow: 0 0 15px rgba(251, 146, 60, 0.3);
                            '>⚡</div>
                            <h4 style='
                                color: #FB923C;
                                margin: 0;
                                font-size: 0.75rem;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.1em;
                            '>Skills Gap</h4>
                        </div>
                        <p style='
                            color: #E8F0FE;
                            margin: 0;
                            font-size: 1.15rem;
                            font-weight: 600;
                            line-height: 1.5;
                        '>{skills_gap}</p>
                    </div>
                """, unsafe_allow_html=True)
            
            with col3:
                st.markdown("""
                    <div style='
                        background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
                        border: 2px solid rgba(34, 197, 94, 0.3);
                        border-radius: 1.25rem;
                        padding: 2rem 1.5rem;
                        box-shadow: 0 0 30px rgba(34, 197, 94, 0.12), inset 0 0 20px rgba(34, 197, 94, 0.04);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                        text-align: left;
                    '>
                        <div style='
                            display: flex;
                            align-items: center;
                            gap: 1rem;
                            margin-bottom: 1rem;
                        '>
                            <div style='
                                width: 50px;
                                height: 50px;
                                background: linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.15) 100%);
                                border: 2px solid rgba(34, 197, 94, 0.5);
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 1.5rem;
                                box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
                            '>✨</div>
                            <h4 style='
                                color: #22C55E;
                                margin: 0;
                                font-size: 0.75rem;
                                font-weight: 700;
                                text-transform: uppercase;
                                letter-spacing: 0.1em;
                            '>Positioning</h4>
                        </div>
                        <p style='
                            color: #E8F0FE;
                            margin: 0;
                            font-size: 1.15rem;
                            font-weight: 600;
                            line-height: 1.5;
                        '>Highlight relevant achievements</p>
                    </div>
                """, unsafe_allow_html=True)
            
            st.markdown("<div style='margin: 2rem 0;'></div>", unsafe_allow_html=True)
            
            # Certifications Section
            st.markdown("""
                <div style='
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 99, 255, 0.05) 100%);
                    border-left: 4px solid #00FF88;
                    border-radius: 0.5rem;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                '>
                    <h4 style='
                        color: #00FF88;
                        margin-top: 0;
                        font-size: 1rem;
                        font-weight: 700;
                    '>🎓 Certifications to Consider</h4>
                    <p style='
                        color: #cbd5e1;
                        margin: 0.75rem 0 0 0;
                        font-size: 0.9rem;
                        line-height: 1.6;
                    '>Based on your target role, these certifications would strengthen your profile:</p>
                </div>
            """, unsafe_allow_html=True)
            
            # Display certifications if available
            certifications = ra.get('recommended_certifications', [])
            if certifications:
                for cert in certifications:
                    st.markdown(f"""
                        <div style='
                            background: rgba(0, 255, 136, 0.05);
                            border: 1px solid rgba(0, 255, 136, 0.2);
                            border-radius: 0.5rem;
                            padding: 1rem;
                            margin-bottom: 0.75rem;
                        '>
                            <p style='
                                color: #00FF88;
                                font-weight: 600;
                                margin: 0;
                            '>✓ {cert}</p>
                        </div>
                    """, unsafe_allow_html=True)
            else:
                st.markdown("""
                    <div style='
                        background: rgba(0, 255, 136, 0.05);
                        border: 1px solid rgba(0, 255, 136, 0.2);
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                    '>
                        <p style='
                            color: #00FF88;
                            font-weight: 600;
                            margin: 0;
                        '>✓ AWS Solutions Architect Certification</p>
                    </div>
                    <div style='
                        background: rgba(0, 255, 136, 0.05);
                        border: 1px solid rgba(0, 255, 136, 0.2);
                        border-radius: 0.5rem;
                        padding: 1rem;
                        margin-bottom: 0.75rem;
                    '>
                        <p style='
                            color: #00FF88;
                            font-weight: 600;
                            margin: 0;
                        '>✓ Google Cloud Professional Cloud Architect</p>
                    </div>
                """, unsafe_allow_html=True)
            
            st.markdown("<div style='margin: 2rem 0;'></div>", unsafe_allow_html=True)
            
            # Comparable Roles Section - Premium Design
            st.markdown("""
                <div style='
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 99, 255, 0.06) 100%);
                    border: 2px solid rgba(0, 212, 255, 0.25);
                    border-radius: 1.25rem;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 0 30px rgba(0, 212, 255, 0.15), inset 0 0 20px rgba(0, 212, 255, 0.04);
                    backdrop-filter: blur(10px);
                '>
                    <div style='
                        display: flex;
                        align-items: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                    '>
                        <div style='
                            width: 44px;
                            height: 44px;
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(0, 212, 255, 0.15) 100%);
                            border: 2px solid rgba(0, 212, 255, 0.5);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 1.35rem;
                            box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
                        '>🔄</div>
                        <div>
                            <h4 style='
                                color: #00D4FF;
                                margin: 0;
                                font-size: 1.15rem;
                                font-weight: 700;
                                text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
                            '>Comparable Career Paths</h4>
                            <p style='
                                color: #cbd5e1;
                                margin: 0.25rem 0 0 0;
                                font-size: 0.85rem;
                            '>Explore related roles that match your skillset</p>
                        </div>
                    </div>
                </div>
            """, unsafe_allow_html=True)
            
            # Display comparable roles in a 2-column grid
            comparable_roles = ra.get('comparable_roles', [])
            
            # Validate and prepare role data - ensure we have full role names
            default_roles = [
                'Senior Software Engineer',
                'Technical Architect',
                'DevOps Engineer',
                'Solutions Architect',
                'Engineering Lead',
                'Platform Engineer'
            ]
            
            # Use API roles if they're meaningful (length > 2), otherwise use defaults
            if comparable_roles and all(isinstance(role, str) and len(role) > 2 for role in comparable_roles):
                role_data = comparable_roles[:6]  # Limit to 6 roles
            else:
                role_data = default_roles
            
            # Display in 2-column grid
            cols = st.columns(2)
            for idx, role in enumerate(role_data):
                col_idx = idx % 2
                with cols[col_idx]:
                    st.markdown(f"""
                        <div style='
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.12) 0%, rgba(0, 99, 255, 0.08) 100%);
                            border: 2px solid rgba(0, 212, 255, 0.3);
                            border-radius: 1rem;
                            padding: 1.5rem;
                            margin-bottom: 1rem;
                            box-shadow: 0 0 20px rgba(0, 212, 255, 0.1), inset 0 0 15px rgba(0, 212, 255, 0.03);
                            backdrop-filter: blur(10px);
                            transition: all 0.3s ease;
                        '>
                            <div style='
                                display: flex;
                                align-items: flex-start;
                                gap: 1rem;
                            '>
                                <div style='
                                    width: 40px;
                                    height: 40px;
                                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 100%);
                                    border: 1.5px solid rgba(0, 212, 255, 0.4);
                                    border-radius: 0.5rem;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 1.2rem;
                                    flex-shrink: 0;
                                    box-shadow: 0 0 12px rgba(0, 212, 255, 0.25);
                                '>💼</div>
                                <div style='flex: 1;'>
                                    <p style='
                                        color: #E8F0FE;
                                        margin: 0;
                                        font-size: 1rem;
                                        font-weight: 600;
                                        line-height: 1.3;
                                    '>{role}</p>
                                    <p style='
                                        color: #00D4FF;
                                        margin: 0.5rem 0 0 0;
                                        font-size: 0.8rem;
                                        font-weight: 700;
                                    '>→ Explore this path</p>
                                </div>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
        
        with tab6:
            st.markdown("### Predicted Roles")
            if analysis.get('predicted_roles'):
                roles_df = pd.DataFrame(analysis['predicted_roles'])
                fig = px.bar(roles_df, x='match_score', y='role', orientation='h', color='match_score', color_continuous_scale=['#ef4444', '#f59e0b', '#10b981'])
                fig.update_layout(height=400, plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)', showlegend=False)
                st.plotly_chart(fig, use_container_width=True)

# ============================================================================
# PAGE: DASHBOARD
# ============================================================================

elif st.session_state.current_page == "Dashboard":
    render_header(
        "📊 Dashboard",
        "Analytics and insights from all analyses"
    )
    
    if not st.session_state.admin_token:
        st.markdown("""
            <style>
                .login-container {
                    background: linear-gradient(135deg, rgba(0, 99, 255, 0.15) 0%, rgba(0, 212, 255, 0.1) 100%);
                    border: 2px solid rgba(0, 212, 255, 0.3);
                    border-radius: 1.5rem;
                    padding: 3rem 2rem;
                    margin: 2rem auto;
                    max-width: 500px;
                    box-shadow: 0 0 40px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05);
                    backdrop-filter: blur(10px);
                }
                
                .login-title {
                    text-align: center;
                    font-size: 2rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #00D4FF 0%, #0099FF 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
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
            # Use cached API calls for better performance
            analytics = fetch_analytics_data(st.session_state.admin_token)
            
            if analytics:
                stats = analytics.get('stats', {})
                
                st.markdown("<div class='section-header'><span class='section-header-title'>Key Metrics</span></div>", unsafe_allow_html=True)
                
                kpi_cols = st.columns(4)
                metrics = [
                    ("Total Resumes", stats.get('total_resumes', 0)),
                    ("Avg Score", f"{stats.get('average_score', 0):.1f}"),
                    ("Highest", f"{stats.get('highest_score', 0):.1f}"),
                    ("Lowest", f"{stats.get('lowest_score', 0):.1f}"),
                ]
                
                for col, (label, value) in zip(kpi_cols, metrics):
                    with col:
                        # Custom glowing KPI card
                        st.markdown(f"""
                        <div class='kpi-card' style='
                            background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(0, 99, 255, 0.03) 100%);
                            backdrop-filter: blur(10px);
                            border: 2px solid rgba(0, 212, 255, 0.3);
                            border-radius: 1.25rem;
                            padding: 2rem 1.5rem;
                            text-align: center;
                            box-shadow: 0 0 30px rgba(0, 212, 255, 0.2), inset 0 0 20px rgba(0, 212, 255, 0.05);
                            transition: all 0.3s ease;
                            position: relative;
                            overflow: hidden;
                        '>
                            <div style='
                                position: absolute;
                                top: -50%;
                                right: -50%;
                                width: 200px;
                                height: 200px;
                                background: radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%);
                                border-radius: 50%;
                                opacity: 0.3;
                            '></div>
                            <div style='position: relative; z-index: 1;'>
                                <div class='kpi-value' style='
                                    font-size: 2.5rem;
                                    font-weight: 800;
                                    background: linear-gradient(135deg, #00D4FF 0%, #00E8FF 100%);
                                    -webkit-background-clip: text;
                                    -webkit-text-fill-color: transparent;
                                    background-clip: text;
                                    margin: 0.75rem 0 0.25rem 0;
                                    letter-spacing: -0.03em;
                                    text-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
                                '>{value}</div>
                                <div class='kpi-label' style='
                                    font-size: 0.75rem;
                                    font-weight: 700;
                                    color: #94a3b8;
                                    text-transform: uppercase;
                                    letter-spacing: 0.08em;
                                '>{label}</div>
                            </div>
                        </div>
                    """, unsafe_allow_html=True)
                
                st.markdown("<div class='divider'></div>", unsafe_allow_html=True)
                
                # ANALYTICS VISUALIZATION - 2 Column Layout (Pie Chart + Bar Chart)
                st.markdown("<div class='section-header'><span class='section-header-title'>Analytics</span></div>", unsafe_allow_html=True)
                
                # Get extended analytics data with roles and locations
                analytics_data = analytics
                
                if analytics_data:
                    top_roles = analytics_data.get('top_roles', [])
                    
                    # Fetch resumes data once for both bar chart and resume records
                    resumes_response = fetch_resumes_data(st.session_state.admin_token)
                    
                    # Display two columns: Left = Pie Chart, Right = Bar Chart
                    col1, col2 = st.columns(2)
                    
                    # LEFT COLUMN: Job Roles Distribution Pie Chart
                    with col1:
                        if top_roles:
                            role_names = [r['role_name'] for r in top_roles]
                            role_counts = [r['count'] for r in top_roles]
                            
                            # Color palette for roles
                            colors_roles = ['#00D4FF', '#0099FF', '#00E8FF', '#00C0D0', '#FFB800']
                            
                            fig_roles = go.Figure(data=[go.Pie(
                                labels=role_names,
                                values=role_counts,
                                marker=dict(
                                    colors=colors_roles[:len(role_names)],
                                    line=dict(color='#0A1F3F', width=3)
                                ),
                                textposition='inside',
                                textinfo='percent',
                                textfont=dict(size=13, color='#FFFFFF', family='Arial Black'),
                                hovertemplate='<b style="color:#00FF88">%{label}</b><br>Count: %{value}<br>%{percent}<extra></extra>',
                                hoverlabel=dict(bgcolor='rgba(15, 35, 65, 0.95)', bordercolor='#00FF88')
                            )])
                            
                            fig_roles.update_layout(
                                paper_bgcolor='rgba(10, 31, 63, 0)',
                                plot_bgcolor='rgba(10, 31, 63, 0)',
                                font=dict(color='#E8F0FE', family='Arial', size=10),
                                height=400,
                                showlegend=True,
                                legend=dict(
                                    x=0.5,
                                    y=-0.15,
                                    xanchor='center',
                                    yanchor='top',
                                    orientation='h',
                                    font=dict(size=10, color='#00D4FF')
                                ),
                                margin=dict(l=10, r=10, t=10, b=60),
                                hovermode='closest'
                            )
                            st.plotly_chart(fig_roles, use_container_width=True)
                        else:
                            st.info("No job roles data")
                    
                    # RIGHT COLUMN: Individual Resume Scores Bar Chart
                    with col2:
                        if resumes_response:
                            resumes = resumes_response.get('resumes', [])
                            if resumes:
                                # Prepare all resumes with their scores (limit to 20)
                                resume_ids = [f"{i+1}" for i in range(min(20, len(resumes)))]
                                scores = [resumes[i].get('score', 0) for i in range(min(20, len(resumes)))]
                                
                                # Color code based on score ranges
                                bar_colors = []
                                for score in scores:
                                    if score >= 80:
                                        bar_colors.append('#00FF88')  # Excellent - Green
                                    elif score >= 60:
                                        bar_colors.append('#00D4FF')  # Very Good - Cyan
                                    elif score >= 40:
                                        bar_colors.append('#FFB800')  # Good - Orange
                                    else:
                                        bar_colors.append('#FF3E44')  # Fair/Poor - Red
                                
                                fig_scores = go.Figure(data=[go.Bar(
                                    x=resume_ids,
                                    y=scores,
                                    marker=dict(
                                        color=bar_colors,
                                        line=dict(color='#0A1F3F', width=2),
                                        cornerradius='5px'
                                    ),
                                    text=[f"{int(score)}" for score in scores],
                                    textposition='outside',
                                    textfont=dict(size=12, color='#00D4FF', family='Arial Black'),
                                    hovertemplate='<b style="color:#00FF88">Resume #%{x}</b><br><b>Score:</b> %{y}<extra></extra>',
                                    hoverlabel=dict(bgcolor='rgba(15, 35, 65, 0.95)', bordercolor='#00D4FF', font=dict(size=12, color='#E8F0FE'))
                                )])
                                
                                fig_scores.update_layout(
                                    title=dict(
                                        text="<b>Resume Scores</b>",
                                        font=dict(size=14, color='#00D4FF', family='Arial Black'),
                                        x=0.5,
                                        xanchor='center',
                                        y=0.95
                                    ),
                                    paper_bgcolor='rgba(10, 31, 63, 0)',
                                    plot_bgcolor='rgba(10, 31, 63, 0.05)',
                                    font=dict(color='#E8F0FE', family='Arial', size=10),
                                    xaxis=dict(
                                        title='Resume #',
                                        title_font=dict(size=12, color='#00D4FF', family='Arial Black'),
                                        tickfont=dict(size=10, color='#E8F0FE'),
                                        showgrid=False,
                                        zeroline=False
                                    ),
                                    yaxis=dict(
                                        title='Score',
                                        title_font=dict(size=12, color='#00D4FF', family='Arial Black'),
                                        tickfont=dict(size=10, color='#E8F0FE'),
                                        range=[0, 105],
                                        showgrid=True,
                                        gridwidth=1,
                                        gridcolor='rgba(0, 212, 255, 0.1)',
                                        zeroline=False
                                    ),
                                    height=400,
                                    showlegend=False,
                                    margin=dict(l=50, r=20, t=60, b=50),
                                    hovermode='x unified',
                                    bargap=0.2,
                                    bargroupgap=0.1
                                )
                                st.plotly_chart(fig_scores, use_container_width=True)
                            else:
                                st.info("No resumes found")
                        else:
                            st.warning("⚠️ Unable to fetch resume scores")
                else:
                    st.info("📊 No analytics data available yet. Upload resumes to see distribution analysis.")
                
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
                        
                        # Reorder columns to show location prominently
                        cols_order = ['id', 'user_name', 'email', 'phone', 'city', 'country', 'file_name', 'upload_date', 'file_size']
                        available_cols = [col for col in cols_order if col in df.columns]
                        df_display = df[available_cols]
                        
                        st.dataframe(df_display, use_container_width=True, height=400)
                        
                        # Download option
                        csv = df.to_csv(index=False)
                        st.download_button(
                            label="📥 Download All Records (CSV)",
                            data=csv,
                            file_name="all_resumes.csv",
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
    
    tabs = st.tabs(["📖 Courses", "🎥 Videos", "📑 Guides", "⭐ Tips"])
    
    with tabs[0]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Learning Platforms</span></div>", unsafe_allow_html=True)
        try:
            response = requests.get(f"{API_URL}/courses")
            if response.status_code == 200:
                courses = response.json()
                for category, platforms in courses.items():
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
        except:
            st.info("Courses data unavailable")
    
    with tabs[1]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Videos</span></div>", unsafe_allow_html=True)
        try:
            response = requests.get(f"{API_URL}/videos")
            if response.status_code == 200:
                videos = response.json()
                cols = st.columns(2)
                for idx, (topic, url) in enumerate(videos.items()):
                    with cols[idx % 2]:
                        st.markdown(f"""
                        <div class='resource-card'>
                            <div class='resource-title'>{topic}</div>
                            <a href='{url}' target='_blank' style='color: var(--accent-primary);'>Watch →</a>
                        </div>
                        """, unsafe_allow_html=True)
        except:
            st.info("Videos unavailable")
    
    with tabs[2]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Guides</span></div>", unsafe_allow_html=True)
        try:
            response = requests.get(f"{API_URL}/guides")
            if response.status_code == 200:
                guides = response.json()
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
        except:
            st.info("Guides unavailable")
    
    with tabs[3]:
        st.markdown("<div class='section-header'><span class='section-header-title'>Tips</span></div>", unsafe_allow_html=True)
        try:
            response = requests.get(f"{API_URL}/tips")
            if response.status_code == 200:
                tips_data = response.json()
                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("#### ✅ Do This")
                    for tip in tips_data.get('do', []):
                        st.markdown(f"✓ {tip}")
                with col2:
                    st.markdown("#### ❌ Avoid This")
                    for tip in tips_data.get('dont', []):
                        st.markdown(f"✗ {tip}")
        except:
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
