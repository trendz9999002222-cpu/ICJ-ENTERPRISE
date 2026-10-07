import json
import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.services.models import ServiceCategory, JusticeService

# Mock data mapping
CATEGORIES = [
    {"name": "Specialized Law", "value": "specialized_law"},
    {"name": "Citizen Assistance", "value": "assistance"},
    {"name": "Dispute Resolution", "value": "dispute_resolution"},
    {"name": "Governance & Schemes", "value": "governance_schemes"},
    {"name": "Legal Information", "value": "legal_information"},
]

SERVICES = [
  {
    "slug": "real-estate-property-law",
    "title": "Real Estate & Property Law",
    "short_description": "Comprehensive legal guidance for property disputes, title verification, RERA compliance, and real estate transactions.",
    "category": "specialized_law",
    "icon_name": "HomeWork",
    "featured": True,
    "who_it_is_for": [
      "Homebuyers facing builder delays.",
      "Property owners dealing with illegal occupation or tenancy issues.",
      "Investors requiring due diligence and title verification."
    ],
    "how_icj_helps": [
      "Verify property documents and RERA compliance before purchase.",
      "Provide legal representation for property disputes in civil courts.",
      "Facilitate succession planning and drafting of wills."
    ],
    "available_assistance": [
      "Title Verification & Due Diligence",
      "RERA Dispute Resolution",
      "Drafting Sale Deeds & Lease Agreements",
      "Succession & Inheritance Legal Support"
    ],
    "next_steps": [
      "Gather relevant property documents (sale deed, tax receipts).",
      "Schedule a consultation with an ICJ empaneled property lawyer.",
      "Review the legal strategy proposed and initiate action."
    ],
    "related_professionals": ["Property Lawyers", "Real Estate Consultants", "Notaries"]
  },
  {
    "slug": "consumer-protection",
    "title": "Consumer Protection Rights",
    "short_description": "Expert assistance in filing consumer complaints against unfair trade practices, defective goods, or deficient services.",
    "category": "assistance",
    "icon_name": "ShoppingBag",
    "featured": True,
    "who_it_is_for": [
      "Consumers who received defective products.",
      "Individuals facing deficiency in services (e.g., medical, insurance, banking).",
      "Victims of misleading advertisements or unfair trade practices."
    ],
    "how_icj_helps": [
      "Drafting and serving legal notices to the defaulting party.",
      "Filing complaints in the appropriate Consumer Disputes Redressal Commission.",
      "Representation during hearings to secure compensation."
    ],
    "available_assistance": [
      "Legal Notice Drafting",
      "Consumer Court Filing",
      "Mediation with Service Providers",
      "E-commerce Dispute Resolution"
    ],
    "next_steps": [
      "Collect evidence (invoices, emails, photographs).",
      "Submit details via the ICJ Consumer Protection portal.",
      "Consult with a consumer rights advocate for the next course of action."
    ],
    "related_professionals": ["Consumer Rights Advocates", "Mediators"]
  },
  {
    "slug": "family-matrimonial-disputes",
    "title": "Family & Matrimonial Disputes",
    "short_description": "Sensitive and confidential legal support for divorce, child custody, alimony, and domestic violence cases.",
    "category": "specialized_law",
    "icon_name": "FamilyRestroom",
    "featured": True,
    "who_it_is_for": [
      "Individuals seeking divorce (mutual consent or contested).",
      "Parents fighting for child custody or visitation rights.",
      "Victims of domestic abuse seeking legal protection."
    ],
    "how_icj_helps": [
      "Provide empathetic legal counseling and explore mediation options.",
      "Draft petitions for divorce, maintenance, or custody.",
      "Represent clients in Family Courts with a focus on quick resolution."
    ],
    "available_assistance": [
      "Divorce & Separation Counseling",
      "Child Custody & Support Claims",
      "Domestic Violence Protection Orders",
      "Pre-nuptial Agreement Consultation"
    ],
    "next_steps": [
      "Book a confidential preliminary consultation.",
      "Discuss whether mediation is a viable first step.",
      "Prepare necessary personal and financial documents."
    ],
    "related_professionals": ["Family Lawyers", "Counselors", "Mediators"]
  },
  {
    "slug": "human-rights-civil-liberties",
    "title": "Human Rights & Civil Liberties",
    "short_description": "Advocacy and legal action against human rights violations, unlawful detention, and discrimination.",
    "category": "assistance",
    "icon_name": "Balance",
    "featured": False,
    "who_it_is_for": [
      "Victims of police brutality or unlawful detention.",
      "Individuals facing discrimination based on caste, religion, or gender.",
      "Whistleblowers and activists needing legal protection."
    ],
    "how_icj_helps": [
      "Filing writ petitions in High Courts or the Supreme Court.",
      "Coordinating with human rights commissions for fast-track intervention.",
      "Providing pro-bono legal aid for marginalized communities."
    ],
    "available_assistance": [
      "Writ Petitions (Habeas Corpus, Mandamus)",
      "Bail Applications",
      "Human Rights Commission Complaints",
      "Public Interest Litigation (PIL)"
    ],
    "next_steps": [
      "Contact the ICJ emergency legal aid helpline.",
      "Provide a detailed account of the incident and any available evidence.",
      "Engage with an assigned human rights lawyer."
    ],
    "related_professionals": ["Human Rights Lawyers", "Social Workers", "NGO Partners"]
  },
  {
    "slug": "cyber-crime-data-privacy",
    "title": "Cyber Crime & Data Privacy",
    "short_description": "Legal recourse for financial fraud, identity theft, cyberbullying, and data privacy breaches.",
    "category": "specialized_law",
    "icon_name": "Security",
    "featured": True,
    "who_it_is_for": [
      "Victims of online financial fraud or phishing scams.",
      "Individuals experiencing cyberbullying or harassment.",
      "Businesses dealing with data breaches or privacy compliance issues."
    ],
    "how_icj_helps": [
      "Assist in filing complaints with the Cyber Crime Cell.",
      "Take legal action against platforms failing to protect user data.",
      "Advise businesses on digital compliance and data protection laws."
    ],
    "available_assistance": [
      "Cyber Crime Cell Complaint Filing",
      "Digital Harassment Legal Action",
      "Data Breach Notification & Compliance",
      "IT Act Legal Consultation"
    ],
    "next_steps": [
      "Preserve digital evidence (screenshots, emails, transaction IDs).",
      "Report the incident on the ICJ Cyber Helpdesk.",
      "Consult a cyber law expert for immediate mitigation."
    ],
    "related_professionals": ["Cyber Law Experts", "Digital Forensics Analysts"]
  },
  {
    "slug": "mediation-arbitration",
    "title": "Mediation & Arbitration",
    "short_description": "Alternative Dispute Resolution (ADR) services for faster, cost-effective, and out-of-court settlements.",
    "category": "dispute_resolution",
    "icon_name": "Handshake",
    "featured": False,
    "who_it_is_for": [
      "Parties willing to settle disputes outside the traditional court system.",
      "Businesses engaged in commercial disagreements.",
      "Families looking for amicable resolutions."
    ],
    "how_icj_helps": [
      "Appoint neutral, certified mediators or arbitrators.",
      "Facilitate structured negotiation sessions.",
      "Draft legally binding settlement agreements."
    ],
    "available_assistance": [
      "Commercial Arbitration",
      "Family & Divorce Mediation",
      "Workplace Dispute Resolution",
      "Drafting Settlement Agreements"
    ],
    "next_steps": [
      "Submit a request for mediation outlining the dispute.",
      "ICJ contacts the other party to propose ADR.",
      "Schedule the first joint session with a mediator."
    ],
    "related_professionals": ["Certified Mediators", "Arbitrators", "Negotiators"]
  },
  {
    "slug": "corporate-commercial-law",
    "title": "Corporate & Commercial Law",
    "short_description": "Legal structuring, compliance, contract drafting, and dispute resolution for startups and established businesses.",
    "category": "specialized_law",
    "icon_name": "CorporateFare",
    "featured": False,
    "who_it_is_for": [
      "Entrepreneurs starting a new business.",
      "Companies requiring contract drafting and review.",
      "Businesses facing partner disputes or regulatory hurdles."
    ],
    "how_icj_helps": [
      "Assist with company registration and intellectual property filings.",
      "Draft employment, vendor, and non-disclosure agreements.",
      "Represent businesses in commercial litigation."
    ],
    "available_assistance": [
      "Company Incorporation & Registration",
      "Contract Drafting & Review",
      "IP Registration (Trademarks, Patents)",
      "Commercial Litigation"
    ],
    "next_steps": [
      "Identify the specific legal need (e.g., contract review, incorporation).",
      "Schedule a business consultation with a corporate lawyer.",
      "Provide necessary business documents for review."
    ],
    "related_professionals": ["Corporate Lawyers", "Chartered Accountants", "Company Secretaries"]
  },
  {
    "slug": "government-schemes-welfare",
    "title": "Government Schemes & Welfare",
    "short_description": "Guidance on accessing public welfare schemes, subsidies, and navigating bureaucratic processes.",
    "category": "governance_schemes",
    "icon_name": "WorkspacePremium",
    "featured": False,
    "who_it_is_for": [
      "Citizens unaware of their eligibility for government programs.",
      "Individuals facing bureaucratic delays in receiving benefits.",
      "Marginalized groups requiring assistance with documentation."
    ],
    "how_icj_helps": [
      "Identify applicable state and central government schemes.",
      "Assist with the application process and necessary documentation.",
      "Follow up with relevant departments to expedite processing."
    ],
    "available_assistance": [
      "Scheme Eligibility Check",
      "Application Assistance",
      "Documentation Support (Aadhaar, Ration Card)",
      "Grievance Redressal with Departments"
    ],
    "next_steps": [
      "Provide basic demographic and income details.",
      "Receive a customized list of eligible schemes.",
      "Connect with an ICJ welfare coordinator for application help."
    ],
    "related_professionals": ["Welfare Coordinators", "Social Workers", "Public Policy Experts"]
  },
  {
    "slug": "public-interest-litigation",
    "title": "Public Interest Litigation (PIL)",
    "short_description": "Filing petitions in courts for the protection of public interest, environment, and fundamental rights.",
    "category": "legal_information",
    "icon_name": "Gavel",
    "featured": False,
    "who_it_is_for": [
      "Activists and NGOs fighting for environmental protection.",
      "Citizens affected by systemic government negligence.",
      "Groups advocating for the rights of marginalized communities."
    ],
    "how_icj_helps": [
      "Evaluate the viability and public impact of the proposed PIL.",
      "Draft comprehensive petitions citing relevant constitutional law.",
      "Represent the public interest in High Courts or the Supreme Court."
    ],
    "available_assistance": [
      "Environmental Litigation",
      "Challenging Unconstitutional Policies",
      "Advocating for Public Infrastructure & Health",
      "Pro-bono Representation"
    ],
    "next_steps": [
      "Submit a detailed brief of the public issue.",
      "ICJ's legal panel reviews the case for PIL suitability.",
      "Collaborate on gathering data and drafting the petition."
    ],
    "related_professionals": ["Constitutional Lawyers", "Environmental Experts", "Activists"]
  }
]

class Command(BaseCommand):
    help = "Seed Justice Services and Categories"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to seed Services...")
        
        # 1. Categories
        for i, cat in enumerate(CATEGORIES):
            obj, created = ServiceCategory.objects.get_or_create(
                value=cat["value"],
                defaults={
                    "name": cat["name"],
                    "display_order": i + 1,
                }
            )
            if created:
                self.stdout.write(f"Created category: {cat['name']}")
        
        # 2. Services
        for i, srv in enumerate(SERVICES):
            category = ServiceCategory.objects.get(value=srv["category"])
            obj, created = JusticeService.objects.get_or_create(
                slug=srv["slug"],
                defaults={
                    "title": srv["title"],
                    "short_description": srv["short_description"],
                    "category": category,
                    "icon_name": srv["icon_name"],
                    "is_featured": srv["featured"],
                    "who_it_is_for": srv["who_it_is_for"],
                    "how_icj_helps": srv["how_icj_helps"],
                    "available_assistance": srv["available_assistance"],
                    "next_steps": srv["next_steps"],
                    "related_professionals": srv["related_professionals"],
                    "display_order": i + 1,
                }
            )
            if created:
                self.stdout.write(f"Created service: {srv['title']}")
        
        self.stdout.write(self.style.SUCCESS("Successfully seeded Services."))
