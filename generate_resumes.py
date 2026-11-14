import os
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import parse_xml
import subprocess

def set_cell_margins(cell, top=0, bottom=0, left=0, right=0):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_heading(doc, title, space_before=5, space_after=2):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    
    run = p.add_run(title.upper())
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(15, 23, 42) # Slate-900
    
    # Modern bottom accent border
    pBdr = parse_xml(
        '<w:pBdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:bottom w:val="single" w:sz="6" w:space="2" w:color="CBD5E1"/>'
        '</w:pBdr>'
    )
    p._p.get_or_add_pPr().append(pBdr)
    return p

def add_role_line(doc, title, dates, space_before=3, space_after=1):
    table = doc.add_table(rows=1, cols=2)
    table.autofit = False
    table.columns[0].width = Inches(5.2)
    table.columns[1].width = Inches(2.3)
    
    cell_l, cell_r = table.rows[0].cells
    set_cell_margins(cell_l, top=0, bottom=0, left=0, right=0)
    set_cell_margins(cell_r, top=0, bottom=0, left=0, right=0)
    
    p_l = cell_l.paragraphs[0]
    p_l.paragraph_format.space_before = Pt(space_before)
    p_l.paragraph_format.space_after = Pt(space_after)
    p_l.paragraph_format.line_spacing = 1.05
    r_l = p_l.add_run(title)
    r_l.font.name = "Calibri"
    r_l.font.size = Pt(10)
    r_l.font.bold = True
    r_l.font.color.rgb = RGBColor(15, 23, 42)
    
    p_r = cell_r.paragraphs[0]
    p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_r.paragraph_format.space_before = Pt(space_before)
    p_r.paragraph_format.space_after = Pt(space_after)
    p_r.paragraph_format.line_spacing = 1.05
    r_r = p_r.add_run(dates)
    r_r.font.name = "Calibri"
    r_r.font.size = Pt(9)
    r_r.font.color.rgb = RGBColor(71, 85, 105) # Slate-600

def add_bullet(doc, text_parts, space_before=0.5, space_after=1.5, line_spacing=1.08):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    
    for txt, bold in text_parts:
        r = p.add_run(txt)
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.bold = bold
        r.font.color.rgb = RGBColor(30, 41, 59) # Slate-800
    return p

def add_header(doc, name="Avishkar AV", contact_line="Bengaluru, India  |  +91 8904628324  |  avishkarav44@gmail.com  |  linkedin.com/in/avishkarav  |  github.com/Avishkarav4  |  avishkarav.vercel.app"):
    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_before = Pt(0)
    p_name.paragraph_format.space_after = Pt(2)
    r_name = p_name.add_run(name)
    r_name.font.name = "Calibri"
    r_name.font.size = Pt(19)
    r_name.font.bold = True
    r_name.font.color.rgb = RGBColor(15, 23, 42)
    
    p_contact = doc.add_paragraph()
    p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_contact.paragraph_format.space_before = Pt(0)
    p_contact.paragraph_format.space_after = Pt(4)
    r_contact = p_contact.add_run(contact_line)
    r_contact.font.name = "Calibri"
    r_contact.font.size = Pt(9)
    r_contact.font.color.rgb = RGBColor(71, 85, 105)

# ═══════════════════════════════════════════════════════════════════════
# BUILD 1-PAGE APPLICATION RESUME (ATS-OPTIMIZED GOLD STANDARD)
# ═══════════════════════════════════════════════════════════════════════
def build_1page_resume(out_path):
    doc = docx.Document()
    
    # Precise 0.4 inch margins
    sec = doc.sections[0]
    sec.top_margin = Inches(0.38)
    sec.bottom_margin = Inches(0.38)
    sec.left_margin = Inches(0.45)
    sec.right_margin = Inches(0.45)
    
    add_header(doc)
    
    # 1. PROFESSIONAL SUMMARY
    add_heading(doc, "Professional Summary", space_before=4, space_after=1.5)
    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.space_before = Pt(1)
    p_sum.paragraph_format.space_after = Pt(3)
    p_sum.paragraph_format.line_spacing = 1.08
    r_sum = p_sum.add_run(
        "Fullstack Software Engineer with production experience architecting high-concurrency microservices, geospatial data engines, and scalable cloud platforms. "
        "Sole backend architect of bluedot.ngo (FastAPI, PostGIS, Cashfree 80G tax compliance) and core engineer of Passiton serving 16,000+ active users on GCP Cloud Run. "
        "Proven track record in database performance tuning, Redis in-memory caching, automated CI/CD pipelines, and regulatory data compliance (DPDP/GDPR)."
    )
    r_sum.font.name = "Calibri"
    r_sum.font.size = Pt(9.5)
    r_sum.font.color.rgb = RGBColor(30, 41, 59)
    
    # 2. TECHNICAL SKILLS
    add_heading(doc, "Technical Skills", space_before=4, space_after=1.5)
    skills = [
        ("Languages & Backend: ", "Python, SQL, JavaScript, TypeScript, Dart, Java, FastAPI, Flask, SQLAlchemy 2.0, Alembic, Pydantic, REST APIs, JWT, RBAC"),
        ("Databases & Cloud: ", "PostgreSQL, PostGIS (ST_Contains, ST_DWithin, SRID 4326), Redis, Supabase, MySQL, MongoDB, GCP (Cloud Run, Vertex AI), AWS (EC2), Docker, CI/CD"),
        ("FinTech, APIs & Tools: ", "Cashfree Payment Gateway (Webhooks, 80G Tax Receipts), YouTube Data API v3, MSG91, OpenStreetMap, Git, Linux, Postman")
    ]
    for label, val in skills:
        p_sk = doc.add_paragraph()
        p_sk.paragraph_format.space_before = Pt(0.5)
        p_sk.paragraph_format.space_after = Pt(1)
        p_sk.paragraph_format.line_spacing = 1.05
        r_lbl = p_sk.add_run(label)
        r_lbl.font.name = "Calibri"
        r_lbl.font.size = Pt(9.5)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(15, 23, 42)
        r_val = p_sk.add_run(val)
        r_val.font.name = "Calibri"
        r_val.font.size = Pt(9.5)
        r_val.font.color.rgb = RGBColor(30, 41, 59)
        
    # 3. WORK EXPERIENCE
    add_heading(doc, "Work Experience", space_before=4, space_after=1.5)
    add_role_line(doc, "Fullstack Developer, Third Eye Creative", "Dec 2025 – Present  |  Bengaluru, India", space_before=2.5, space_after=1)
    
    add_bullet(doc, [
        ("Passiton (16,000+ Active Users): ", True),
        ("Maintained production recycling marketplace on GCP Cloud Run with autoscaling; architected dual ASGI server running FastAPI for mobile and Flask for admin under a unified container.", False)
    ])
    add_bullet(doc, [
        ("BlueDot (Solo Backend Architect): ", True),
        ("Architected entire backend for bluedot.ngo as an async FastAPI REST API on PostgreSQL (Supabase) with SQLAlchemy 2.0 ORM, Pydantic schemas, and Alembic migrations.", False)
    ])
    add_bullet(doc, [
        ("Database Performance Tuning: ", True),
        ("Shrank production PostgreSQL footprint ", False),
        ("60% (2GB to 800MB)", True),
        (" and accelerated complex join queries ", False),
        ("40%", True),
        (" through zero-downtime poison-pill row cleanup and targeted indexing.", False)
    ])
    add_bullet(doc, [
        ("Latency & Cost Optimization: ", True),
        ("Slashed feed response latency from ", False),
        ("10s to <2s", True),
        (" with a Redis-cached feed algorithm; eliminated 100% of third-party map costs via OpenStreetMap.", False)
    ])
    add_bullet(doc, [
        ("PostGIS Geospatial Engine: ", True),
        ("Stored restoration boundary polygons (SRID 4326) and built automated PostgreSQL triggers with ST_Contains to increment cached tree counts without runtime aggregates.", False)
    ])
    add_bullet(doc, [
        ("FinTech & 80G Tax Compliance: ", True),
        ("Integrated Cashfree Payment Gateway supporting webhook signature verification, delayed PAN collection UX flow, and automated 80G tax receipt PDF generation.", False)
    ])
    add_bullet(doc, [
        ("AI Reliability Engineering: ", True),
        ("Cut Vertex AI API failure rate from ", False),
        ("33% to 3%", True),
        (" with exponential backoff retry logic; integrated dual-engine AI vision (Vertex AI & Pl@ntNet) with 70% threshold auto-publishing.", False)
    ])
    add_bullet(doc, [
        ("Cloud Infrastructure & CI/CD: ", True),
        ("Cut infrastructure spend ", False),
        ("46%", True),
        (" by migrating legacy cash-collection tool from AWS EC2 to DigitalOcean droplets with Docker; built multi-tenant CI/CD with GitHub Actions.", False)
    ])

    add_role_line(doc, "Fullstack Developer Intern, EarthlyExotica", "Jan 2025 – May 2025  |  Bengaluru, India", space_before=2.5, space_after=1)
    add_bullet(doc, [
        ("Built mobile-responsive frontend in Flutter for baadige.com utilizing modular UI components; integrated core REST APIs connecting payment flows and product catalog services.", False)
    ])

    # 4. TECHNICAL PROJECTS
    add_heading(doc, "Technical Projects", space_before=4, space_after=1.5)
    add_bullet(doc, [
        ("Autonomous YouTube Video Publishing Engine: ", True),
        ("Architected a zero-cost serverless media pipeline auto-publishing daily 1080p Shorts to YouTube via GitHub Actions CI/CD; automated OAuth 2.0 refresh-token handshake and resumable chunked video uploads (PUT protocol) using ", False),
        ("16% of daily free quota (1,600 / 10,000 units)", True),
        (", paired with Gemini Flash AI scriptwriting, local Kokoro-82M ONNX TTS, Faster-Whisper alignment, and 14 Mbps broadcast master headless Chrome CDP rendering.", False)
    ])
    add_bullet(doc, [
        ("Smart Attendance System: ", True),
        ("Real-time facial recognition pipeline on CCTV feeds that replaced manual logging with automated CSV attendance tracking using Python, OpenCV, and NumPy.", False)
    ])
    add_bullet(doc, [
        ("Weather Alert & SMS Notification System: ", True),
        ("Automated daemon broadcasting localized rainfall alerts via SMS from real-time meteorological sensor feeds using Python, OpenWeatherMap API, and Twilio API.", False)
    ])

    # 5. EDUCATION & CERTIFICATIONS
    add_heading(doc, "Education & Certifications", space_before=4, space_after=1.5)
    add_role_line(doc, "B.E. in Computer Science & Engineering, Visvesvaraya Technological University (VTU)", "Dec 2021 – June 2025  |  CGPA: 7.95 / 10.0", space_before=2, space_after=1)
    add_bullet(doc, [
        ("Certifications: ", True),
        ("Oracle Cloud Infrastructure 2025 Certified Generative AI Professional  •  Oracle OCI AI Foundations Associate  •  Java OOP Certification", False)
    ], space_before=0.5, space_after=1)

    doc.save(out_path)
    print(f"Generated 1-Page Resume: {out_path}")

# ═══════════════════════════════════════════════════════════════════════
# BUILD 2-PAGE MASTER RESUME (COMPREHENSIVE ATS FORMAT)
# ═══════════════════════════════════════════════════════════════════════
def build_full_resume(out_path):
    doc = docx.Document()
    
    sec = doc.sections[0]
    sec.top_margin = Inches(0.48)
    sec.bottom_margin = Inches(0.48)
    sec.left_margin = Inches(0.55)
    sec.right_margin = Inches(0.55)
    
    add_header(doc)
    
    # 1. PROFESSIONAL SUMMARY
    add_heading(doc, "Professional Summary", space_before=6, space_after=2)
    p_sum = doc.add_paragraph()
    p_sum.paragraph_format.space_before = Pt(1.5)
    p_sum.paragraph_format.space_after = Pt(4)
    p_sum.paragraph_format.line_spacing = 1.12
    r_sum = p_sum.add_run(
        "Fullstack Software Engineer with production experience architecting high-concurrency microservices, geospatial data engines, and scalable cloud platforms. "
        "Sole backend architect of bluedot.ngo (FastAPI, PostGIS, Cashfree 80G tax compliance) and core engineer of Passiton serving 16,000+ active users on GCP Cloud Run. "
        "Proven track record in database performance tuning, Redis in-memory caching, automated CI/CD pipelines, and regulatory data compliance (DPDP/GDPR)."
    )
    r_sum.font.name = "Calibri"
    r_sum.font.size = Pt(10)
    r_sum.font.color.rgb = RGBColor(30, 41, 59)
    
    # 2. WORK EXPERIENCE
    add_heading(doc, "Work Experience", space_before=6, space_after=2)
    add_role_line(doc, "Fullstack Developer, Third Eye Creative", "Dec 2025 – Present  |  Bengaluru, India", space_before=3, space_after=1.5)
    
    add_bullet(doc, [
        ("BlueDot (Solo Backend & Platform Architect): ", True),
        ("Architected the entire backend for bluedot.ngo as an asynchronous FastAPI REST API backed by PostgreSQL (Supabase) with SQLAlchemy 2.0 ORM, Pydantic schemas, and Alembic migrations.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("PostGIS Geospatial Engine: ", True),
        ("Stored restoration site boundary polygons (geometry(POLYGON, 4326)) and built automated PostgreSQL triggers with ST_Contains to increment cached tree counts without runtime aggregates.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Anti-Point-Farming Algorithm: ", True),
        ("Engineered a spatial proximity rule using PostGIS ST_DWithin with a 5-meter threshold (within 5m counts as 15 XP verification; outside 5m creates 50 XP tree discovery).", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Botanical AI Classification: ", True),
        ("Integrated dual-engine AI vision (Vertex AI & Pl@ntNet) analyzing up to 5 multi-angle images with 70% confidence threshold auto-publishing to the public Eco Garden Map.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Offline Donor Reconciler (Ghost User Engine): ", True),
        ("Ingests offline donation CSVs, generates ghost accounts, and atomically merges historical records upon mobile OTP signup by phone number, retroactively awarding XP and badges.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("FinTech & 80G Tax Compliance: ", True),
        ("Integrated Cashfree Payment Gateway supporting webhook signature verification, delayed PAN collection UX flow, and automated 80G tax receipt PDF generation.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Legal & DPDP Act Compliance: ", True),
        ("Engineered compliance architecture for India's DPDP Act and GDPR: document versioning, affirmative consent capture (logging IP, user-agent, timestamp), and self-service privacy export and erasure APIs.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Sub-50ms Redis Caching: ", True),
        ("Built an in-memory caching layer for mobile leaderboards, computed via PostgreSQL window functions (RANK() OVER (ORDER BY total_impact_points DESC)).", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    
    add_bullet(doc, [
        ("Passiton (Marketplace for 16,000+ Users): ", True),
        ("Shipped and maintained the production peer-to-peer recycling marketplace serving 16,000+ active users on GCP Cloud Run with autoscaling and zero-downtime updates.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Dual-Framework ASGI Architecture: ", True),
        ("Architected a unified server hosting Flask at root (/) for the Admin Panel and FastAPI at /mobile for high-concurrency mobile APIs under a single ASGI container.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("11-Stage State Machine: ", True),
        ("Engineered an 11-stage item listing lifecycle state machine managing transitions across drafts, validation, requests, recipient selection, handoffs, and multi-quantity child cloning.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Database Performance Tuning: ", True),
        ("Shrank production PostgreSQL database footprint ", False),
        ("60% (2GB to 800MB)", True),
        (" and sped up complex join queries ", False),
        ("40%", True),
        (" through zero-downtime poison-pill row cleanup and targeted indexing.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Latency & Cost Reduction: ", True),
        ("Slashed feed response latency from ", False),
        ("10s to <2s", True),
        (" with a Redis-cached feed algorithm, and eliminated 100% of third-party map costs by integrating OpenStreetMap.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("AI Reliability Engineering: ", True),
        ("Cut Vertex AI image-validation failure rates from ", False),
        ("33% to 3%", True),
        (" through automated retry logic with exponential backoff in the marketplace ingestion pipeline.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Cloud Infrastructure Optimization: ", True),
        ("Cut infrastructure spend ", False),
        ("46%", True),
        (" for a legacy cash-collection tool by migrating from AWS EC2 to DigitalOcean droplets and containerizing the stack with Docker.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("CI/CD Automation: ", True),
        ("Built multi-tenant CI/CD pipelines using GitHub Actions and Docker Hub, accelerating build-to-delivery release cycles for 3 Play Store apps from hours to minutes.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("NDB Government Portal: ", True),
        ("Secured the NDB government portal for launch by implementing role-based access control (RBAC) and data masking policies.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)

    add_role_line(doc, "Fullstack Developer Intern, EarthlyExotica", "Jan 2025 – May 2025  |  Bengaluru, India", space_before=3, space_after=1.5)
    add_bullet(doc, [
        ("Built mobile-responsive, performant frontend interfaces in Flutter for baadige.com utilizing modular, reusable component architecture to accelerate UI development.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)
    add_bullet(doc, [
        ("Integrated core REST APIs to connect the Flutter mobile client to backend business logic, payment flows, and product catalog services.", False)
    ], space_before=1, space_after=2, line_spacing=1.1)

    # 3. TECHNICAL SKILLS
    add_heading(doc, "Technical Skills", space_before=6, space_after=2)
    full_skills = [
        ("Languages & Backend: ", "Python, SQL, JavaScript, TypeScript, Dart, Java, HTML5, CSS3, FastAPI, Flask, SQLAlchemy 2.0, Alembic, Pydantic, RESTful APIs, JWT Authentication, RBAC"),
        ("Geospatial & Databases: ", "PostGIS (ST_Contains, ST_DWithin, SRID 4326), PostgreSQL, Redis, Supabase, MySQL, MongoDB, Firebase, Spatial Indexing, OpenStreetMap"),
        ("Cloud, DevOps & Infra: ", "GCP (Cloud Run, Vertex AI, IAM), AWS (EC2), DigitalOcean, Docker, Docker Hub, GitHub Actions, Jenkins, Linux (Ubuntu/Debian), Vercel"),
        ("Payment Gateways & APIs: ", "Cashfree Payment Gateway (Webhooks, 80G Receipts), YouTube Data API v3, MSG91 (DLT SMS Templates, OTP), Cloudinary SDK"),
        ("Mobile Development: ", "Flutter, Dart, Android Studio, Cross-Platform UI Component Design")
    ]
    for label, val in full_skills:
        p_sk = doc.add_paragraph()
        p_sk.paragraph_format.space_before = Pt(1)
        p_sk.paragraph_format.space_after = Pt(1.5)
        p_sk.paragraph_format.line_spacing = 1.08
        r_lbl = p_sk.add_run(label)
        r_lbl.font.name = "Calibri"
        r_lbl.font.size = Pt(9.5)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(15, 23, 42)
        r_val = p_sk.add_run(val)
        r_val.font.name = "Calibri"
        r_val.font.size = Pt(9.5)
        r_val.font.color.rgb = RGBColor(30, 41, 59)

    # 4. TECHNICAL PROJECTS
    add_heading(doc, "Technical Projects", space_before=6, space_after=2)
    add_bullet(doc, [
        ("Autonomous YouTube Video Publishing Engine: ", True),
        ("Architected a zero-cost, 100% serverless media pipeline that scripts, narrates, renders, and auto-publishes 1080p Shorts to YouTube daily via GitHub Actions CI/CD (5 AM IST cron) on headless Ubuntu runners with Xvfb virtual framebuffers. Automated YouTube Data API v3 publishing via headless OAuth 2.0 refresh-token handshake and resumable chunked video uploads (PUT protocol) consuming only ", False),
        ("16% of daily free quota (1,600 / 10,000 units)", True),
        (". Integrated Gemini Flash with 2-pass quality & visual-sync proofreading and Supabase DB deduplication, paired with edge neural speech synthesis (Kokoro-82M ONNX, Faster-Whisper int8) and deterministic 14 Mbps broadcast master H.264 video rendering via Node.js Chrome DevTools Protocol (CDP) and FFmpeg.", False)
    ], space_before=1, space_after=2.5, line_spacing=1.1)
    add_bullet(doc, [
        ("Smart Attendance System: ", True),
        ("Real-time facial recognition pipeline on CCTV feeds that replaced manual logging with automated CSV attendance tracking using Python, OpenCV, and NumPy.", False)
    ], space_before=1, space_after=2.5, line_spacing=1.1)
    add_bullet(doc, [
        ("Weather Alert & SMS Notification System: ", True),
        ("Automated service broadcasting localized rainfall alerts by SMS from real-time meteorological sensor data using Python, OpenWeatherMap API, and Twilio API.", False)
    ], space_before=1, space_after=2.5, line_spacing=1.1)
    add_bullet(doc, [
        ("Real-Time Sign Language Translation System: ", True),
        ("Computer vision data-augmentation and noise-reduction pipeline translating sign language gestures into text in real time using Python, OpenCV, and ML.", False)
    ], space_before=1, space_after=2.5, line_spacing=1.1)

    # 5. EDUCATION & CERTIFICATIONS
    add_heading(doc, "Education", space_before=6, space_after=2)
    add_role_line(doc, "Bachelor of Engineering (B.E.) in Computer Science & Engineering", "Dec 2021 – June 2025  |  CGPA: 7.95 / 10.0", space_before=2.5, space_after=1)
    p_vtu = doc.add_paragraph()
    p_vtu.paragraph_format.space_before = Pt(0)
    p_vtu.paragraph_format.space_after = Pt(3)
    r_vtu = p_vtu.add_run("Visvesvaraya Technological University (VTU)  |  Bengaluru, India")
    r_vtu.font.name = "Calibri"
    r_vtu.font.size = Pt(9.5)
    r_vtu.font.color.rgb = RGBColor(71, 85, 105)

    add_heading(doc, "Certifications", space_before=6, space_after=2)
    add_bullet(doc, [("Oracle Cloud Infrastructure 2025 Certified Generative AI Professional", False)], space_before=0.5, space_after=1.5)
    add_bullet(doc, [("Oracle OCI AI Foundations Associate", False)], space_before=0.5, space_after=1.5)
    add_bullet(doc, [("Java Object-Oriented Programming (OOP) Certification", False)], space_before=0.5, space_after=1.5)

    doc.save(out_path)
    print(f"Generated Comprehensive Resume: {out_path}")

if __name__ == "__main__":
    p_1page = r"c:\Users\avish\OneDrive\Desktop\Personal Portfolio\Avishkar_AV_Resume_1Page_Application.docx"
    p_full = r"c:\Users\avish\OneDrive\Desktop\Personal Portfolio\Avishkar_AV_Resume.docx"
    
    build_1page_resume(p_1page)
    build_full_resume(p_full)

