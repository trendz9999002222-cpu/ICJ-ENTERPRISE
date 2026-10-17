import json
import os
from pathlib import Path
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.professional_onboarding.models import (
    Category,
    CommonField,
    Document,
    FieldOption,
    Group,
    Profession,
    ProfessionDocument,
    ProfessionField,
    VisualTheme,
)

DEFAULT_ONBOARDING_DATA: dict[str, Any] = {
    "stepCatalog": {
        "category": {"title": "Select Category", "subtitle": "Choose your main category"},
        "group": {"title": "Select Group", "subtitle": "Choose professional group"},
        "profession": {"title": "Select Profession", "subtitle": "Choose your profession"},
        "association": {"title": "Association", "subtitle": "Select how to associate"},
        "specialisation": {"title": "Specialisation", "subtitle": "Select area of expertise"},
        "details": {"title": "Fill Details", "subtitle": "Complete registration"},
        "documents": {"title": "Upload Documents", "subtitle": "Verification documents"},
        "review": {"title": "Review & Submit", "subtitle": "Final submission"},
    },
    "defaultSteps": ["category", "group", "profession", "specialisation", "details", "documents", "review"],
    "sidebars": {
        "default": {
            "guidelines": [
                "Provide accurate and valid information.",
                "Upload clear and readable documents.",
                "Only verified profiles will be marked as \"ICJ Verified\".",
                "False information may lead to rejection or deactivation.",
            ],
            "whyRegister": [
                "Pan India Professional Network",
                "Get Verified by ICJ",
                "Increase Your Visibility",
                "Connect with Clients & Institutions",
                "Contribute to a Stronger Justice System",
            ],
            "security": "All information is encrypted and used only for verification and professional network purposes.",
        },
        "advocate": {
            "guidelines": [
                "Enrollment number must match your State Bar Council record.",
                "Upload a clear copy of your enrollment certificate.",
                "Practice details should reflect your current active practice.",
                "Verification usually completes within 3–5 working days.",
            ],
            "whyRegister": [
                "Pan India Professional Network",
                "Get Verified by ICJ",
                "Appear in client search results",
                "Connect with Clients & Institutions",
                "Contribute to a Stronger Justice System",
            ],
            "security": "All information is encrypted and used only for verification and professional network purposes.",
        },
    },
    "optionSets": {
        "gender": ["Male", "Female", "Other", "Prefer not to say"],
        "bloodGroup": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        "experience": ["0–2 Years", "3–5 Years", "6–10 Years", "11–20 Years", "20+ Years"],
        "qualification": ["LL.B.", "LL.M.", "B.A. LL.B.", "B.Com LL.B.", "Ph.D. (Law)", "Other"],
        "states": [
            "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
            "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
            "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
            "Uttarakhand", "West Bengal",
        ],
        "barCouncils": [
            "Bar Council of Delhi", "Bar Council of Maharashtra & Goa", "Bar Council of Uttar Pradesh",
            "Bar Council of Karnataka", "Bar Council of Tamil Nadu & Puducherry", "Bar Council of West Bengal",
            "Bar Council of Gujarat", "Bar Council of Rajasthan", "Bar Council of Punjab & Haryana",
            "Bar Council of Madhya Pradesh", "Bar Council of Kerala", "Other State Bar Council",
        ],
        "languages": ["English", "Hindi", "Regional Language", "Other"],
        "courts": ["Supreme Court", "High Court", "District Court", "Tribunal / Commission", "Other"],
        "practiceAreas": [
            "Criminal Law", "Civil Law", "Constitutional Law", "Family Law",
            "Corporate / Commercial Law", "Property Law", "Labour Law", "Consumer Law",
            "Cyber Law", "Tax Law", "Intellectual Property", "Other",
        ],
    },
    "forms": {
        "advocate": {
            "sections": [
                {
                    "id": "basic",
                    "title": "Basic Information",
                    "icon": "person",
                    "fields": [
                        {"name": "fullName", "label": "Full Name", "type": "text", "required": True, "placeholder": "Enter full name as per registration", "col": 3},
                        {"name": "fatherName", "label": "Father's / Guardian's Name", "type": "text", "placeholder": "Enter name", "col": 3},
                        {"name": "dob", "label": "Date of Birth", "type": "date", "optionalTag": True, "col": 3},
                        {"name": "gender", "label": "Gender", "type": "select", "optionsRef": "gender", "optionalTag": True, "col": 3},
                        {"name": "mobile", "label": "Mobile Number", "type": "tel", "required": True, "prefix": "+91", "placeholder": "Enter mobile number", "col": 3},
                        {"name": "email", "label": "Email ID", "type": "email", "required": True, "placeholder": "Enter email address", "col": 3},
                        {"name": "bloodGroup", "label": "Blood Group", "type": "select", "optionsRef": "bloodGroup", "optionalTag": True, "col": 3},
                        {"name": "altMobile", "label": "Alternate Mobile", "type": "tel", "prefix": "+91", "placeholder": "Enter alternate number", "optionalTag": True, "col": 3},
                    ],
                },
                {
                    "id": "professional",
                    "title": "Professional Information",
                    "icon": "work",
                    "fields": [
                        {"name": "enrollmentNumber", "label": "Enrollment Number", "type": "text", "required": True, "placeholder": "e.g. D/1101/2013", "col": 3},
                        {"name": "enrollmentYear", "label": "Enrollment Year", "type": "year", "required": True, "yearFrom": 1960, "col": 3},
                        {"name": "barCouncil", "label": "State Bar Council", "type": "select", "optionsRef": "barCouncils", "required": True, "col": 3},
                        {"name": "practiceCity", "label": "Current Practice Location", "type": "text", "required": True, "placeholder": "Enter city", "col": 3},
                        {"name": "experience", "label": "Years of Experience", "type": "select", "optionsRef": "experience", "required": True, "col": 4},
                        {"name": "practiceType", "label": "Type of Practice", "type": "radio", "required": True, "options": ["Independent", "With Firm", "In-House", "Other"], "col": 8},
                        {"name": "firmName", "label": "Firm / Organisation Name", "type": "text", "placeholder": "Enter firm name", "required": True, "col": 6, "visibleWhen": {"field": "practiceType", "equals": "With Firm"}},
                        {"name": "courts", "label": "Courts of Practice", "type": "checkboxGroup", "optionsRef": "courts", "required": True, "col": 6},
                        {"name": "practiceAreas", "label": "Areas of Practice", "type": "checkboxGroup", "optionsRef": "practiceAreas", "required": True, "helper": "Select multiple", "col": 6, "columns": 2},
                    ],
                },
                {
                    "id": "qualification",
                    "title": "Qualification Details",
                    "icon": "school",
                    "fields": [
                        {"name": "qualification", "label": "Highest Qualification", "type": "select", "optionsRef": "qualification", "required": True, "col": 3},
                        {"name": "university", "label": "University / Institution", "type": "text", "required": True, "placeholder": "Enter university name", "col": 3},
                        {"name": "passingYear", "label": "Year of Passing", "type": "year", "required": True, "yearFrom": 1960, "col": 3},
                        {"name": "languages", "label": "Languages Known", "type": "checkboxGroup", "optionsRef": "languages", "required": True, "helper": "Select multiple", "col": 3},
                    ],
                },
            ],
            "documents": [
                {"name": "photo", "label": "Profile Photograph", "required": True, "accept": "image/png,image/jpeg", "hint": "JPG, PNG (Max 2 MB)", "maxSizeMb": 2},
                {"name": "enrollmentCertificate", "label": "Enrollment Certificate", "required": True, "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
                {"name": "identityProof", "label": "Identity Proof (Aadhaar / PAN)", "required": True, "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
                {"name": "otherDocuments", "label": "Other Documents", "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
            ],
        },
        "default": {
            "sections": [
                {
                    "id": "basic",
                    "title": "Basic Information",
                    "icon": "person",
                    "fields": [
                        {"name": "fullName", "label": "Full Name", "type": "text", "required": True, "placeholder": "Enter full name", "col": 3},
                        {"name": "fatherName", "label": "Father's / Guardian's Name", "type": "text", "placeholder": "Enter name", "col": 3},
                        {"name": "dob", "label": "Date of Birth", "type": "date", "optionalTag": True, "col": 3},
                        {"name": "gender", "label": "Gender", "type": "select", "optionsRef": "gender", "optionalTag": True, "col": 3},
                        {"name": "mobile", "label": "Mobile Number", "type": "tel", "required": True, "prefix": "+91", "placeholder": "Enter mobile number", "col": 4},
                        {"name": "email", "label": "Email ID", "type": "email", "required": True, "placeholder": "Enter email address", "col": 4},
                        {"name": "state", "label": "State", "type": "select", "optionsRef": "states", "required": True, "col": 4},
                    ],
                },
                {
                    "id": "professional",
                    "title": "Professional Information",
                    "icon": "work",
                    "fields": [
                        {"name": "registrationNumber", "label": "Registration / Licence Number", "type": "text", "placeholder": "Enter number if applicable", "col": 4},
                        {"name": "issuingBody", "label": "Issuing Authority / Council", "type": "text", "placeholder": "Enter authority name", "col": 4},
                        {"name": "experience", "label": "Years of Experience", "type": "select", "optionsRef": "experience", "required": True, "col": 4},
                        {"name": "city", "label": "Current Work Location", "type": "text", "required": True, "placeholder": "Enter city", "col": 4},
                        {"name": "organisation", "label": "Organisation / Firm", "type": "text", "placeholder": "Enter organisation name", "col": 4},
                        {"name": "languages", "label": "Languages Known", "type": "checkboxGroup", "optionsRef": "languages", "required": True, "helper": "Select multiple", "col": 4},
                        {"name": "about", "label": "Brief Professional Summary", "type": "textarea", "placeholder": "Describe your practice in 2–3 lines", "rows": 3, "col": 12},
                    ],
                },
                {
                    "id": "qualification",
                    "title": "Qualification Details",
                    "icon": "school",
                    "fields": [
                        {"name": "qualification", "label": "Highest Qualification", "type": "text", "required": True, "placeholder": "Enter qualification", "col": 4},
                        {"name": "university", "label": "University / Institution", "type": "text", "required": True, "placeholder": "Enter university name", "col": 4},
                        {"name": "passingYear", "label": "Year of Passing", "type": "year", "required": True, "yearFrom": 1960, "col": 4},
                    ],
                },
            ],
            "documents": [
                {"name": "photo", "label": "Profile Photograph", "required": True, "accept": "image/png,image/jpeg", "hint": "JPG, PNG (Max 2 MB)", "maxSizeMb": 2},
                {"name": "identityProof", "label": "Identity Proof (Aadhaar / PAN)", "required": True, "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
                {"name": "qualificationProof", "label": "Qualification / Licence Proof", "required": True, "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
                {"name": "otherDocuments", "label": "Other Documents", "accept": "application/pdf", "hint": "PDF (Max 5 MB)", "maxSizeMb": 5},
            ],
        },
    },
    "categories": [
        {
            "id": "legal-court", "code": "01", "title": "Legal & Court",
            "description": "Advocates, Legal Advisors, Notary, Court Commissioners and more",
            "icon": "gavel", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
            "groups": [
                {
                    "id": "advocates", "code": "01", "title": "Advocates",
                    "description": "Advocate / Lawyer, Senior Advocate, Advocate-on-Record, Government Advocate and more",
                    "icon": "person", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "advocate", "sidebarId": "advocate",
                    "steps": ["category", "group", "profession", "specialisation", "details", "documents", "review"],
                    "professions": [
                        {"id": "advocate-lawyer", "title": "Advocate / Lawyer", "description": "General practice across courts"},
                        {"id": "senior-advocate", "title": "Senior Advocate", "description": "Designated by High Court / Supreme Court"},
                        {"id": "aor", "title": "Advocate-on-Record", "description": "Registered with the Supreme Court"},
                        {"id": "govt-advocate", "title": "Government Advocate", "description": "Appearing for state or central government"},
                        {"id": "other", "title": "Other", "description": "Specify your profession in the next step"},
                    ],
                    "specialisations": [
                        {"id": "criminal", "title": "Criminal Law"},
                        {"id": "civil", "title": "Civil Law"},
                        {"id": "constitutional", "title": "Constitutional & Writ"},
                        {"id": "family", "title": "Family & Matrimonial"},
                        {"id": "corporate", "title": "Corporate & Commercial"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "prosecution", "code": "02", "title": "Prosecution",
                    "description": "Public Prosecutor, Additional Public Prosecutor, Assistant Public Prosecutor, Special Public Prosecutor and more",
                    "icon": "gavel", "theme": {"color": "#15803d", "bg": "#ecfdf5", "border": "#bbf7d0"},
                    "formId": "default", "sidebarId": "default",
                    "steps": ["category", "group", "profession", "details", "documents", "review"],
                    "professions": [
                        {"id": "pp", "title": "Public Prosecutor"},
                        {"id": "app", "title": "Assistant Public Prosecutor"},
                        {"id": "addl-pp", "title": "Additional Public Prosecutor"},
                        {"id": "spl-pp", "title": "Special Public Prosecutor"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "notarial", "code": "03", "title": "Notarial & Commission",
                    "description": "Notary Public, Oath Commissioner, Court Commissioner, Local Commissioner, Court Receiver and more",
                    "icon": "document", "theme": {"color": "#a16207", "bg": "#fffbeb", "border": "#fde68a"},
                    "formId": "default", "sidebarId": "default",
                    "steps": ["category", "group", "profession", "details", "documents", "review"],
                    "professions": [
                        {"id": "notary", "title": "Notary Public"},
                        {"id": "oath-commissioner", "title": "Oath Commissioner"},
                        {"id": "court-commissioner", "title": "Court Commissioner"},
                        {"id": "court-receiver", "title": "Court Receiver"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "legal-advisory", "code": "04", "title": "Legal Advisory",
                    "description": "Legal Advisor, Legal Consultant, Legal Counsel, Legal Executive and more",
                    "icon": "people", "theme": {"color": "#be123c", "bg": "#fff1f2", "border": "#fecdd3"},
                    "formId": "default", "sidebarId": "default",
                    "steps": ["category", "group", "profession", "specialisation", "details", "documents", "review"],
                    "professions": [
                        {"id": "legal-advisor", "title": "Legal Advisor"},
                        {"id": "legal-consultant", "title": "Legal Consultant"},
                        {"id": "in-house-counsel", "title": "In-House Legal Counsel"},
                        {"id": "legal-executive", "title": "Legal Executive"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "litigation-support", "code": "05", "title": "Litigation Support",
                    "description": "Paralegal, Law Clerk, Legal Assistant, Litigation Support Professional and more",
                    "icon": "library", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
                    "formId": "default", "sidebarId": "default",
                    "steps": ["category", "group", "profession", "details", "documents", "review"],
                    "professions": [
                        {"id": "paralegal", "title": "Paralegal"},
                        {"id": "law-clerk", "title": "Law Clerk"},
                        {"id": "legal-assistant", "title": "Legal Assistant"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "other-legal", "code": "06", "title": "Other Legal Professional",
                    "description": "If your professional group is not listed above, you can select this option and specify your group in the next step.",
                    "icon": "more", "theme": {"color": "#0f766e", "bg": "#f0fdfa", "border": "#99f6e4"},
                    "formId": "default", "sidebarId": "default",
                    "steps": ["category", "group", "details", "documents", "review"],
                    "professions": [
                        {"id": "other-legal-pro", "title": "Other Legal Professional"},
                    ],
                },
            ],
        },
        {
            "id": "dispute-adr", "code": "02", "title": "Dispute Resolution & ADR",
            "description": "Arbitrators, Mediators, Conciliators, Negotiation Experts and more",
            "icon": "handshake", "theme": {"color": "#15803d", "bg": "#ecfdf5", "border": "#bbf7d0"},
            "groups": [
                {
                    "id": "arbitrators", "code": "01", "title": "Arbitrators",
                    "description": "Sole Arbitrator, Panel Arbitrator, Institutional Arbitrator and more",
                    "icon": "gavel", "theme": {"color": "#15803d", "bg": "#ecfdf5", "border": "#bbf7d0"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "sole", "title": "Sole Arbitrator"},
                        {"id": "panel", "title": "Panel Arbitrator"},
                        {"id": "institutional", "title": "Institutional Arbitrator"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "mediators", "code": "02", "title": "Mediators & Conciliators",
                    "description": "Court-annexed Mediator, Private Mediator, Conciliator and more",
                    "icon": "handshake", "theme": {"color": "#0f766e", "bg": "#f0fdfa", "border": "#99f6e4"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "court-mediator", "title": "Court-annexed Mediator"},
                        {"id": "private-mediator", "title": "Private Mediator"},
                        {"id": "conciliator", "title": "Conciliator"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "negotiation", "code": "03", "title": "Negotiation & Settlement",
                    "description": "Negotiation Experts, Settlement Advisors, Lok Adalat Panel Members and more",
                    "icon": "people", "theme": {"color": "#a16207", "bg": "#fffbeb", "border": "#fde68a"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "negotiation-expert", "title": "Negotiation Expert"},
                        {"id": "settlement-advisor", "title": "Settlement Advisor"},
                        {"id": "lok-adalat-member", "title": "Lok Adalat Panel Member"},
                    ],
                },
            ],
        },
        {
            "id": "corporate-tax-finance", "code": "03", "title": "Corporate, Tax & Finance",
            "description": "CA, CS, CMA, Tax Consultants, Insolvency Professionals and more",
            "icon": "chart", "theme": {"color": "#a16207", "bg": "#fffbeb", "border": "#fde68a"},
            "groups": [
                {
                    "id": "chartered-accountants", "code": "01", "title": "Chartered Accountants",
                    "description": "CA in practice, Audit Professionals, Statutory Auditors and more",
                    "icon": "chart", "theme": {"color": "#a16207", "bg": "#fffbeb", "border": "#fde68a"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "ca-practice", "title": "Chartered Accountant (Practice)"},
                        {"id": "ca-employment", "title": "Chartered Accountant (Employment)"},
                        {"id": "auditor", "title": "Statutory / Internal Auditor"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "company-secretaries", "code": "02", "title": "Company Secretaries",
                    "description": "CS in practice, Corporate Governance and Compliance Professionals",
                    "icon": "document", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "cs-practice", "title": "Company Secretary (Practice)"},
                        {"id": "cs-employment", "title": "Company Secretary (Employment)"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "insolvency", "code": "03", "title": "Insolvency & Valuation",
                    "description": "Insolvency Professionals, Registered Valuers, Liquidators and more",
                    "icon": "bank", "theme": {"color": "#9a3412", "bg": "#fff7ed", "border": "#fed7aa"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "ip", "title": "Insolvency Professional"},
                        {"id": "valuer", "title": "Registered Valuer"},
                        {"id": "liquidator", "title": "Liquidator"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "tax-consultants", "code": "04", "title": "Tax Consultants",
                    "description": "Income Tax Practitioners, GST Practitioners, Customs Consultants and more",
                    "icon": "chart", "theme": {"color": "#be123c", "bg": "#fff1f2", "border": "#fecdd3"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "itp", "title": "Income Tax Practitioner"},
                        {"id": "gstp", "title": "GST Practitioner"},
                        {"id": "customs", "title": "Customs & Trade Consultant"},
                        {"id": "other", "title": "Other"},
                    ],
                },
            ],
        },
        {
            "id": "ip-regulatory", "code": "04", "title": "Intellectual Property & Regulatory",
            "description": "Patent, Trademark, Copyright, Regulatory & Compliance Experts",
            "icon": "lightbulb", "theme": {"color": "#be123c", "bg": "#fff1f2", "border": "#fecdd3"},
            "groups": [
                {
                    "id": "patent-agents", "code": "01", "title": "Patent Professionals",
                    "description": "Registered Patent Agents, Patent Attorneys, Patent Analysts and more",
                    "icon": "lightbulb", "theme": {"color": "#be123c", "bg": "#fff1f2", "border": "#fecdd3"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "patent-agent", "title": "Registered Patent Agent"},
                        {"id": "patent-attorney", "title": "Patent Attorney"},
                        {"id": "patent-analyst", "title": "Patent Analyst / Searcher"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "trademark-copyright", "code": "02", "title": "Trademark & Copyright",
                    "description": "Trademark Agents, Copyright Consultants, Design Registration Experts and more",
                    "icon": "document", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "tm-agent", "title": "Trademark Agent"},
                        {"id": "copyright", "title": "Copyright Consultant"},
                        {"id": "design", "title": "Design Registration Expert"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "regulatory", "code": "03", "title": "Regulatory & Compliance",
                    "description": "Regulatory Affairs, Compliance Officers, Licensing Consultants and more",
                    "icon": "bank", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "regulatory-affairs", "title": "Regulatory Affairs Officer"},
                        {"id": "compliance-officer", "title": "Compliance Officer"},
                        {"id": "licensing-consultant", "title": "Licensing Consultant"},
                    ],
                },
            ],
        },
        {
            "id": "forensic-investigation", "code": "05", "title": "Forensic, Investigation & Experts",
            "description": "Forensic Experts, Investigators, Cyber Experts, Medical & Scientific Experts",
            "icon": "search", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
            "groups": [
                {
                    "id": "forensic-experts", "code": "01", "title": "Forensic Science Experts",
                    "description": "Handwriting, Ballistics, DNA, Toxicology and Document Examiners",
                    "icon": "search", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "handwriting", "title": "Handwriting & Document Examiner"},
                        {"id": "ballistics", "title": "Ballistics Expert"},
                        {"id": "dna", "title": "DNA / Serology Expert"},
                        {"id": "toxicology", "title": "Toxicology Expert"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "investigators", "code": "02", "title": "Investigators",
                    "description": "Private Detectives, Fraud Investigators, Corporate Investigators and more",
                    "icon": "search", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "private-detective", "title": "Private Detective"},
                        {"id": "fraud", "title": "Fraud Investigator"},
                        {"id": "corporate", "title": "Corporate Investigator"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "cyber-experts", "code": "03", "title": "Cyber & Digital Forensics",
                    "description": "Cyber Forensic Analysts, Digital Evidence Experts, Data Recovery Specialists",
                    "icon": "laptop", "theme": {"color": "#166534", "bg": "#f0fdf4", "border": "#bbf7d0"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "cyber-forensics", "title": "Cyber Forensic Analyst"},
                        {"id": "digital-evidence", "title": "Digital Evidence Expert"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "medical-experts", "code": "04", "title": "Medical & Scientific Experts",
                    "description": "Medico-legal Experts, Psychiatrists, Scientific Expert Witnesses and more",
                    "icon": "people", "theme": {"color": "#be123c", "bg": "#fff1f2", "border": "#fecdd3"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "medico-legal", "title": "Medico-Legal Expert"},
                        {"id": "psychiatrist", "title": "Forensic Psychiatrist"},
                        {"id": "expert-witness", "title": "Scientific Expert Witness"},
                    ],
                },
            ],
        },
        {
            "id": "property-realestate", "code": "06", "title": "Property, Real Estate & Technical",
            "description": "Property Consultants, Valuers, Surveyors, Engineers, Architects and more",
            "icon": "home", "theme": {"color": "#0f766e", "bg": "#f0fdfa", "border": "#99f6e4"},
            "groups": [
                {
                    "id": "property-consultants", "code": "01", "title": "Property & Title Consultants",
                    "description": "Title Search Experts, Property Consultants, Conveyancing Experts and more",
                    "icon": "home", "theme": {"color": "#0f766e", "bg": "#f0fdfa", "border": "#99f6e4"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "title-search", "title": "Title Search Expert"},
                        {"id": "conveyancing", "title": "Conveyancing Expert"},
                        {"id": "property-consultant", "title": "Property Consultant"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "valuers-surveyors", "code": "02", "title": "Valuers & Surveyors",
                    "description": "Registered Valuers, Land Surveyors, Chartered Surveyors and more",
                    "icon": "chart", "theme": {"color": "#a16207", "bg": "#fffbeb", "border": "#fde68a"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "valuer", "title": "Registered Valuer"},
                        {"id": "land-surveyor", "title": "Land Surveyor"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "engineers-architects", "code": "03", "title": "Engineers & Architects",
                    "description": "Civil Engineers, Structural Engineers, Registered Architects and more",
                    "icon": "home", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "civil-engineer", "title": "Civil Engineer"},
                        {"id": "structural-engineer", "title": "Structural Engineer"},
                        {"id": "architect", "title": "Registered Architect"},
                        {"id": "other", "title": "Other"},
                    ],
                },
            ],
        },
        {
            "id": "legal-research-doc", "code": "07", "title": "Legal Research & Documentation",
            "description": "Researchers, Drafting Experts, Translators, Record Managers and more",
            "icon": "document", "theme": {"color": "#9f1239", "bg": "#fdf2f8", "border": "#fbcfe8"},
            "groups": [
                {
                    "id": "researchers", "code": "01", "title": "Legal Researchers",
                    "description": "Legal Research Associates, Academic Researchers, Policy Researchers and more",
                    "icon": "library", "theme": {"color": "#9f1239", "bg": "#fdf2f8", "border": "#fbcfe8"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "research-associate", "title": "Legal Research Associate"},
                        {"id": "academic", "title": "Academic Researcher"},
                        {"id": "policy", "title": "Policy Researcher"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "drafting", "code": "02", "title": "Drafting & Documentation",
                    "description": "Deed Writers, Contract Drafting Experts, Documentation Specialists and more",
                    "icon": "document", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "deed-writer", "title": "Deed Writer"},
                        {"id": "contract-drafting", "title": "Contract Drafting Expert"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "translators", "code": "03", "title": "Translators & Record Managers",
                    "description": "Legal Translators, Transcribers, Court Record Managers and more",
                    "icon": "library", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "legal-translator", "title": "Legal Translator"},
                        {"id": "transcriber", "title": "Legal Transcriber"},
                        {"id": "record-manager", "title": "Court Record Manager"},
                    ],
                },
            ],
        },
        {
            "id": "government-public", "code": "08", "title": "Government, Public & Social Justice",
            "description": "Public Law Experts, Human Rights Professionals, Legal Aid, Policy Experts and more",
            "icon": "bank", "theme": {"color": "#1e40af", "bg": "#eff6ff", "border": "#bfdbfe"},
            "groups": [
                {
                    "id": "public-law", "code": "01", "title": "Public Law & Policy",
                    "description": "Public Law Experts, Policy Advisors, Legislative Drafting Experts and more",
                    "icon": "bank", "theme": {"color": "#1e40af", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "public-law-expert", "title": "Public Law Expert"},
                        {"id": "policy-advisor", "title": "Policy Advisor"},
                        {"id": "legislative-drafting", "title": "Legislative Drafting Expert"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "human-rights", "code": "02", "title": "Human Rights & Social Justice",
                    "description": "Human Rights Defenders, NGO Legal Officers, Social Justice Advocates and more",
                    "icon": "people", "theme": {"color": "#15803d", "bg": "#ecfdf5", "border": "#bbf7d0"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "hr-defender", "title": "Human Rights Defender"},
                        {"id": "ngo-legal", "title": "NGO Legal Officer"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "legal-aid", "code": "03", "title": "Legal Aid & Paralegal Volunteers",
                    "description": "Legal Aid Counsel, Paralegal Volunteers, Lok Adalat Support and more",
                    "icon": "people", "theme": {"color": "#9a3412", "bg": "#fff7ed", "border": "#fed7aa"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "legal-aid-counsel", "title": "Legal Aid Counsel"},
                        {"id": "paralegal-volunteer", "title": "Paralegal Volunteer"},
                        {"id": "lok-adalat-support", "title": "Lok Adalat Support Staff"},
                    ],
                },
            ],
        },
        {
            "id": "legal-tech-digital", "code": "09", "title": "Legal Technology & Digital Services",
            "description": "Legal-Tech, Cyber, Digital Documentation, IT Support and more",
            "icon": "laptop", "theme": {"color": "#166534", "bg": "#f0fdf4", "border": "#bbf7d0"},
            "groups": [
                {
                    "id": "legal-tech", "code": "01", "title": "Legal Technology Professionals",
                    "description": "Legal-Tech Product Experts, Automation Specialists, e-Discovery Experts and more",
                    "icon": "laptop", "theme": {"color": "#166534", "bg": "#f0fdf4", "border": "#bbf7d0"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "legaltech-specialist", "title": "Legal-Tech Specialist"},
                        {"id": "ediscovery", "title": "e-Discovery Expert"},
                        {"id": "automation", "title": "Legal Automation Specialist"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "cyber-law", "code": "02", "title": "Cyber Law & Data Protection",
                    "description": "Cyber Law Experts, Data Protection Officers, Privacy Consultants and more",
                    "icon": "search", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "cyber-law-expert", "title": "Cyber Law Expert"},
                        {"id": "dpo", "title": "Data Protection Officer"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "digital-documentation", "code": "03", "title": "Digital Documentation & IT Support",
                    "description": "e-Filing Experts, Digital Signature Providers, IT Support for law offices",
                    "icon": "document", "theme": {"color": "#6d28d9", "bg": "#f5f3ff", "border": "#ddd6fe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "efiling-expert", "title": "e-Filing Expert"},
                        {"id": "digital-sig-provider", "title": "Digital Signature Provider"},
                        {"id": "legal-it-support", "title": "Legal IT Support Specialist"},
                    ],
                },
            ],
        },
        {
            "id": "legal-support-allied", "code": "10", "title": "Legal Support & Allied Professionals",
            "description": "Court Typist, Case Managers, Administrative & Field Support and more",
            "icon": "people", "theme": {"color": "#9a3412", "bg": "#fff7ed", "border": "#fed7aa"},
            "groups": [
                {
                    "id": "court-support", "code": "01", "title": "Court Support Staff",
                    "description": "Court Typists, Stenographers, Filing Clerks and more",
                    "icon": "document", "theme": {"color": "#9a3412", "bg": "#fff7ed", "border": "#fed7aa"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "typist", "title": "Court Typist"},
                        {"id": "stenographer", "title": "Stenographer"},
                        {"id": "filing-clerk", "title": "Filing Clerk"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "case-managers", "code": "02", "title": "Case & Office Management",
                    "description": "Case Managers, Law Office Administrators, Practice Managers and more",
                    "icon": "people", "theme": {"color": "#1d4ed8", "bg": "#eff6ff", "border": "#bfdbfe"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "case-manager", "title": "Case Manager"},
                        {"id": "office-admin", "title": "Law Office Administrator"},
                        {"id": "other", "title": "Other"},
                    ],
                },
                {
                    "id": "field-support", "code": "03", "title": "Field & Process Support",
                    "description": "Process Servers, Field Verification Agents, Court Liaison Staff and more",
                    "icon": "more", "theme": {"color": "#0f766e", "bg": "#f0fdfa", "border": "#99f6e4"},
                    "formId": "default", "sidebarId": "default",
                    "professions": [
                        {"id": "process-server", "title": "Process Server"},
                        {"id": "field-agent", "title": "Field Verification Agent"},
                        {"id": "court-liaison", "title": "Court Liaison Staff"},
                    ],
                },
            ],
        },
    ],
}


def to_snake_key(name: str) -> str:
    """Convert camelCase or title name to snake_case field_key."""
    import re
    s1 = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    s2 = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s1)
    base = s2.lower().replace("-", "_")
    base = re.sub(r"[^a-z0-9_]+", "", base)
    base = re.sub(r"^_+|_\+$", "", base)
    if not base or not base[0].isalpha():
        base = f"f_{base}"
    return base


def map_type_to_model_type(type_str: str) -> str:
    mapping = {
        "text": CommonField.FieldType.TEXT,
        "textarea": CommonField.FieldType.TEXTAREA,
        "number": CommonField.FieldType.NUMBER,
        "year": CommonField.FieldType.NUMBER,
        "email": CommonField.FieldType.EMAIL,
        "tel": CommonField.FieldType.PHONE,
        "phone": CommonField.FieldType.PHONE,
        "date": CommonField.FieldType.DATE,
        "select": CommonField.FieldType.SELECT,
        "radio": CommonField.FieldType.RADIO,
        "checkbox": CommonField.FieldType.CHECKBOX,
        "checkboxGroup": CommonField.FieldType.CHECKBOX,
        "file": CommonField.FieldType.FILE,
    }
    return mapping.get(type_str, CommonField.FieldType.TEXT)


class Command(BaseCommand):
    help = "Seed professional onboarding database from JSON schema (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            help="Path to custom JSON file to seed data from.",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Wipe existing onboarding config before seeding.",
        )

    def handle(self, *args, **options):
        file_path = options.get("file")
        if file_path:
            p = Path(file_path)
            if not p.exists():
                self.stderr.write(self.style.ERROR(f"File not found: {file_path}"))
                return
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.stdout.write(f"Loaded schema from {file_path}")
        else:
            data = DEFAULT_ONBOARDING_DATA
            self.stdout.write("Using built-in schema definition.")

        if options.get("clear"):
            self.stdout.write(self.style.WARNING("Clearing existing onboarding configuration..."))
            FieldOption.objects.all().delete()
            ProfessionDocument.objects.all().delete()
            ProfessionField.objects.all().delete()
            CommonField.objects.all().delete()
            Document.objects.all().delete()
            VisualTheme.objects.all().delete()
            Profession.objects.all().delete()
            Group.objects.all().delete()
            Category.objects.all().delete()

        option_sets = data.get("optionSets", {})
        forms_data = data.get("forms", {})
        categories_data = data.get("categories", [])

        # 1. Seed Documents catalog
        self.stdout.write("1. Seeding Documents catalog...")
        doc_catalog: dict[str, Document] = {}
        all_docs_configs = []
        for f_key, f_val in forms_data.items():
            for doc_item in f_val.get("documents", []):
                all_docs_configs.append(doc_item)

        # Standard documents
        for doc_cfg in all_docs_configs:
            raw_name = doc_cfg["name"]
            doc_key = to_snake_key(raw_name)
            accept_types = [t.strip().lstrip(".").replace("image/", "").replace("application/", "") for t in doc_cfg.get("accept", "pdf").split(",") if t.strip()]
            if not accept_types:
                accept_types = ["pdf"]
            # Clean MIME types for allowed_file_types
            allowed_file_types = []
            for t in accept_types:
                if t in ("jpeg", "jpg", "png", "pdf", "docx", "doc"):
                    allowed_file_types.append(t)
                elif "pdf" in t:
                    allowed_file_types.append("pdf")
                elif "jpeg" in t or "jpg" in t:
                    allowed_file_types.append("jpeg")
                elif "png" in t:
                    allowed_file_types.append("png")
                else:
                    allowed_file_types.append(t)
            allowed_file_types = list(set(allowed_file_types))

            doc_obj, _ = Document.objects.update_or_create(
                document_key=doc_key,
                defaults={
                    "name": doc_cfg.get("label", raw_name),
                    "description": doc_cfg.get("hint", ""),
                    "allowed_file_types": allowed_file_types,
                    "max_file_size_mb": doc_cfg.get("maxSizeMb", 5),
                    "is_active": True,
                },
            )
            doc_catalog[doc_key] = doc_obj

        self.stdout.write(f"   Created/updated {len(doc_catalog)} catalog documents.")

        # 2. Seed Common Fields
        self.stdout.write("2. Seeding Common Fields...")
        common_fields_def = [
            {"name": "Full Name", "field_key": "full_name", "field_type": CommonField.FieldType.TEXT, "label": "Full Name", "placeholder": "Enter full name", "is_required": True, "display_order": 10},
            {"name": "Father's Name", "field_key": "father_name", "field_type": CommonField.FieldType.TEXT, "label": "Father's / Guardian's Name", "placeholder": "Enter name", "is_required": False, "display_order": 20},
            {"name": "Date of Birth", "field_key": "dob", "field_type": CommonField.FieldType.DATE, "label": "Date of Birth", "placeholder": "", "is_required": False, "display_order": 30},
            {"name": "Gender", "field_key": "gender", "field_type": CommonField.FieldType.SELECT, "label": "Gender", "placeholder": "", "is_required": False, "display_order": 40, "optionsRef": "gender"},
            {"name": "Mobile Number", "field_key": "mobile_number", "field_type": CommonField.FieldType.PHONE, "label": "Mobile Number", "placeholder": "Enter mobile number", "is_required": True, "display_order": 50},
            {"name": "Email ID", "field_key": "email", "field_type": CommonField.FieldType.EMAIL, "label": "Email ID", "placeholder": "Enter email address", "is_required": True, "display_order": 60},
        ]

        for cf_def in common_fields_def:
            cfield, _ = CommonField.objects.update_or_create(
                field_key=cf_def["field_key"],
                defaults={
                    "name": cf_def["name"],
                    "field_type": cf_def["field_type"],
                    "label": cf_def["label"],
                    "placeholder": cf_def.get("placeholder", ""),
                    "is_required": cf_def["is_required"],
                    "display_order": cf_def["display_order"],
                    "is_active": True,
                },
            )
            if "optionsRef" in cf_def and cf_def["optionsRef"] in option_sets:
                seen_opts = set()
                for idx, opt in enumerate(option_sets[cf_def["optionsRef"]]):
                    val_str = str(opt).strip()
                    if not val_str or val_str in seen_opts:
                        continue
                    seen_opts.add(val_str)
                    FieldOption.objects.update_or_create(
                        common_field=cfield,
                        value=val_str,
                        defaults={
                            "label": val_str,
                            "display_order": idx * 10,
                            "is_active": True,
                        },
                    )

        self.stdout.write("   Created/updated common fields and options.")

        # 3. Seed Categories, Groups, Professions, Themes, Fields & Documents
        self.stdout.write("3. Seeding Categories, Groups, Professions, Fields & Themes...")
        category_count = 0
        group_count = 0
        profession_count = 0

        for cat_idx, cat_data in enumerate(categories_data):
            cat_slug = cat_data["id"]
            cat_title = cat_data["title"]
            cat_desc = cat_data.get("description", "")
            cat_theme = cat_data.get("theme", {})

            category, _ = Category.objects.update_or_create(
                slug=cat_slug,
                defaults={
                    "name": cat_title,
                    "description": cat_desc,
                    "display_order": (cat_idx + 1) * 10,
                    "is_active": True,
                },
            )
            category_count += 1

            if cat_theme:
                color = cat_theme.get("color", "#1d4ed8")
                bg = cat_theme.get("bg", "#eff6ff")
                border = cat_theme.get("border", "#bfdbfe")
                VisualTheme.objects.update_or_create(
                    category=category,
                    defaults={
                        "primary_color": color,
                        "background_color": bg,
                        "border_color": border,
                        "secondary_color": color,
                        "accent_color": color,
                        "text_color": "#0f172a",
                        "icon_color": color,
                    },
                )

            for grp_idx, grp_data in enumerate(cat_data.get("groups", [])):
                grp_slug = grp_data["id"]
                grp_title = grp_data["title"]
                grp_desc = grp_data.get("description", "")
                grp_theme = grp_data.get("theme", {})
                form_id = grp_data.get("formId", "default")

                group, _ = Group.objects.update_or_create(
                    category=category,
                    slug=grp_slug,
                    defaults={
                        "name": grp_title,
                        "description": grp_desc,
                        "display_order": (grp_idx + 1) * 10,
                        "is_active": True,
                    },
                )
                group_count += 1

                if grp_theme:
                    color = grp_theme.get("color", "#1d4ed8")
                    bg = grp_theme.get("bg", "#eff6ff")
                    border = grp_theme.get("border", "#bfdbfe")
                    VisualTheme.objects.update_or_create(
                        group=group,
                        defaults={
                            "primary_color": color,
                            "background_color": bg,
                            "border_color": border,
                            "secondary_color": color,
                            "accent_color": color,
                            "text_color": "#0f172a",
                            "icon_color": color,
                        },
                    )

                professions_data = grp_data.get("professions", [])
                if not professions_data:
                    professions_data = [{"id": grp_slug, "title": grp_title, "description": grp_desc}]

                for prof_idx, prof_data in enumerate(professions_data):
                    prof_slug = prof_data["id"]
                    prof_title = prof_data["title"]
                    prof_desc = prof_data.get("description", "")

                    profession, _ = Profession.objects.update_or_create(
                        group=group,
                        slug=prof_slug,
                        defaults={
                            "name": prof_title,
                            "description": prof_desc,
                            "display_order": (prof_idx + 1) * 10,
                            "is_active": True,
                        },
                    )
                    profession_count += 1

                    # Seed Profession Documents
                    target_form = forms_data.get(form_id, forms_data.get("default", {}))
                    for doc_idx, doc_item in enumerate(target_form.get("documents", [])):
                        doc_key = to_snake_key(doc_item["name"])
                        catalog_doc = doc_catalog.get(doc_key)
                        if catalog_doc:
                            ProfessionDocument.objects.update_or_create(
                                profession=profession,
                                document=catalog_doc,
                                defaults={
                                    "is_required": doc_item.get("required", False),
                                    "instructions": doc_item.get("hint", ""),
                                    "display_order": (doc_idx + 1) * 10,
                                    "is_active": True,
                                },
                            )

                    # Seed Profession Fields (excluding basic common ones)
                    field_order = 10
                    for sec in target_form.get("sections", []):
                        if sec.get("id") == "basic":
                            # Process only fields not in common_fields
                            extra_basic_fields = [f for f in sec.get("fields", []) if f["name"] not in ("fullName", "fatherName", "dob", "gender", "mobile", "email")]
                            target_fields = extra_basic_fields
                        else:
                            target_fields = sec.get("fields", [])

                        for field_cfg in target_fields:
                            field_key = to_snake_key(field_cfg["name"])
                            m_type = map_type_to_model_type(field_cfg.get("type", "text"))
                            is_req = field_cfg.get("required", False)

                            p_field, _ = ProfessionField.objects.update_or_create(
                                profession=profession,
                                field_key=field_key,
                                defaults={
                                    "name": field_cfg.get("label", field_key),
                                    "field_type": m_type,
                                    "label": field_cfg.get("label", field_key),
                                    "placeholder": field_cfg.get("placeholder", ""),
                                    "help_text": field_cfg.get("helper", ""),
                                    "is_required": is_req,
                                    "display_order": field_order,
                                    "is_active": True,
                                },
                            )
                            field_order += 10

                            # Add options for select / radio / checkbox
                            opts = []
                            if "optionsRef" in field_cfg and field_cfg["optionsRef"] in option_sets:
                                opts = option_sets[field_cfg["optionsRef"]]
                            elif "options" in field_cfg and isinstance(field_cfg["options"], list):
                                opts = field_cfg["options"]

                            if opts and m_type in (CommonField.FieldType.SELECT, CommonField.FieldType.RADIO, CommonField.FieldType.CHECKBOX):
                                seen_opts = set()
                                for opt_idx, opt_val in enumerate(opts):
                                    val_str = str(opt_val).strip()
                                    if not val_str or val_str in seen_opts:
                                        continue
                                    seen_opts.add(val_str)
                                    FieldOption.objects.update_or_create(
                                        profession_field=p_field,
                                        value=val_str,
                                        defaults={
                                            "label": val_str,
                                            "display_order": opt_idx * 10,
                                            "is_active": True,
                                        },
                                    )

            self.stdout.write(f"   [+] Seeded category: {cat_title}")

        self.stdout.write(self.style.SUCCESS(
            f"Successfully seeded onboarding data:\n"
            f"  - {category_count} Categories\n"
            f"  - {group_count} Groups\n"
            f"  - {profession_count} Professions\n"
            f"  - {CommonField.objects.count()} Common Fields\n"
            f"  - {ProfessionField.objects.count()} Profession Fields\n"
            f"  - {FieldOption.objects.count()} Field Options\n"
            f"  - {Document.objects.count()} Documents\n"
            f"  - {ProfessionDocument.objects.count()} Profession-Document links\n"
        ))
