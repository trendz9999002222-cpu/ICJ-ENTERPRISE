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
    ProfessionalRegistrationSubmission,
    ProfessionalRegistrationSubmissionFile,
    VisualTheme,
)


class Command(BaseCommand):
    help = "Seed clean professional onboarding data aligned with the 3 official ICJ wings: Legal, Other Professional, and Volunteer."

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING("Resetting professional onboarding data to the 3 official wings..."))

        with transaction.atomic():
            # 1. Clear out test submissions referencing protected foreign keys
            ProfessionalRegistrationSubmissionFile.objects.all().delete()
            ProfessionalRegistrationSubmission.objects.all().delete()

            # 2. Clear out bloated catalog data
            ProfessionDocument.objects.all().delete()
            FieldOption.objects.filter(profession_field__isnull=False).delete()
            ProfessionField.objects.all().delete()
            Profession.objects.all().delete()
            Group.objects.all().delete()
            Category.objects.all().delete()
            Document.objects.all().delete()
            VisualTheme.objects.all().delete()

            # 2. Seed Catalog Documents
            docs = {
                "bar_council_id": Document.objects.create(
                    name="State Bar Council Enrollment Certificate / ID",
                    document_key="bar_council_id",
                    description="Clear scanned copy of State Bar Council identity card or enrollment certificate.",
                    allowed_file_types=["pdf", "jpg", "png"],
                    max_file_size_mb=5,
                    is_active=True,
                    display_order=10,
                ),
                "cop_certificate": Document.objects.create(
                    name="Certificate of Practice (COP) / Statutory Body Certificate",
                    document_key="cop_certificate",
                    description="Certificate of Practice from ICAI / ICSI / ICMAI / Bar Council.",
                    allowed_file_types=["pdf", "jpg", "png"],
                    max_file_size_mb=5,
                    is_active=True,
                    display_order=20,
                ),
                "student_ngo_id": Document.objects.create(
                    name="Student ID / College Bonafide / NGO Recommendation",
                    document_key="student_ngo_id",
                    description="Valid student identification, college recommendation letter, or NGO affiliation proof.",
                    allowed_file_types=["pdf", "jpg", "png"],
                    max_file_size_mb=5,
                    is_active=True,
                    display_order=30,
                ),
                "resume_cv": Document.objects.create(
                    name="Curriculum Vitae (CV) / Professional Profile",
                    document_key="resume_cv",
                    description="Detailed resume highlighting educational background, standing, and practice areas.",
                    allowed_file_types=["pdf", "docx"],
                    max_file_size_mb=5,
                    is_active=True,
                    display_order=40,
                ),
            }

            # 3. WING 1: LEGAL PROFESSIONAL
            cat_legal = Category.objects.create(
                name="Legal Professional Wing",
                slug="legal_professional",
                description="Advocates, Bar Practitioners, Senior Counsels, and Dispute Mediators.",
                is_active=True,
                display_order=10,
            )
            VisualTheme.objects.create(
                category=cat_legal,
                primary_color="#0f2942",
                secondary_color="#1e3a8a",
                accent_color="#b45309",
                background_color="#ffffff",
                text_color="#0f172a",
                border_color="#cbd5e1",
            )
            grp_legal = Group.objects.create(
                category=cat_legal,
                name="Bar Practitioners & Advocates",
                slug="legal_practitioners",
                description="Practicing lawyers enrolled under the Advocates Act, 1961.",
                is_active=True,
                display_order=10,
            )
            legal_professions = [
                ("advocate", "Advocate / Bar Practitioner", 10),
                ("senior_advocate", "Senior Advocate / Legal Counsel", 20),
                ("corporate_counsel", "Corporate Legal Counsel / Solicitor", 30),
                ("mediator_arbitrator", "Accredited Mediator / Arbitrator", 40),
            ]
            for slug, name, order in legal_professions:
                prof = Profession.objects.create(
                    group=grp_legal,
                    name=name,
                    slug=slug,
                    is_active=True,
                    display_order=order,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["bar_council_id"],
                    is_required=True,
                    display_order=10,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["resume_cv"],
                    is_required=False,
                    display_order=20,
                )
                ProfessionField.objects.create(
                    profession=prof,
                    name="Bar Council Enrollment Number",
                    field_key="enrollment_number",
                    field_type="text",
                    label="Bar Council Enrollment Number (e.g. D/1234/2018)",
                    placeholder="e.g. D/1234/2018",
                    is_required=True,
                    display_order=10,
                )
                f2 = ProfessionField.objects.create(
                    profession=prof,
                    name="State Bar Council",
                    field_key="state_council",
                    field_type="select",
                    label="State Bar Council",
                    is_required=True,
                    display_order=20,
                )
                for idx, sc in enumerate([
                    "Bar Council of Delhi",
                    "Bar Council of Maharashtra & Goa",
                    "Bar Council of Uttar Pradesh",
                    "Bar Council of Punjab & Haryana",
                    "Bar Council of Karnataka",
                    "Bar Council of Tamil Nadu",
                    "Bar Council of West Bengal",
                    "Bar Council of Gujarat",
                    "Bar Council of Rajasthan",
                    "Bar Council of Bihar",
                    "Other State Bar Council",
                ], 1):
                    FieldOption.objects.create(profession_field=f2, value=sc, label=sc, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Year of Bar Enrollment",
                    field_key="enrollment_year",
                    field_type="text",
                    label="Year of Bar Enrollment",
                    placeholder="e.g. 2018",
                    is_required=True,
                    display_order=30,
                )
                f4 = ProfessionField.objects.create(
                    profession=prof,
                    name="Years of Active Practice",
                    field_key="experience_years",
                    field_type="select",
                    label="Years of Active Practice",
                    is_required=True,
                    display_order=40,
                )
                for idx, exp in enumerate(["1-3 Years", "3-5 Years", "5-10 Years", "10-15 Years", "15+ Years"], 1):
                    FieldOption.objects.create(profession_field=f4, value=exp, label=exp, display_order=idx)

                f5 = ProfessionField.objects.create(
                    profession=prof,
                    name="Primary Courts of Practice",
                    field_key="primary_courts",
                    field_type="select",
                    label="Primary Courts of Practice",
                    is_required=True,
                    display_order=50,
                )
                for idx, court in enumerate([
                    "Supreme Court of India",
                    "High Courts (State Jurisdictions)",
                    "District & Sessions Courts",
                    "National Company Law Tribunal (NCLT/NCLAT)",
                    "Consumer Commissions (NCDRC/State)",
                    "Debt Recovery Tribunals (DRT/DRAT)",
                    "Labour & Industrial Courts",
                    "Taxation Tribunals (ITAT/CESTAT)",
                ], 1):
                    FieldOption.objects.create(profession_field=f5, value=court, label=court, display_order=idx)

                f6 = ProfessionField.objects.create(
                    profession=prof,
                    name="Primary Practice Discipline",
                    field_key="practice_areas",
                    field_type="select",
                    label="Primary Practice Discipline",
                    is_required=True,
                    display_order=60,
                )
                for idx, pa in enumerate([
                    "Constitutional & Writ Jurisdiction",
                    "Civil, Real Estate & Property Disputes",
                    "Criminal Defense & Bail Matters",
                    "Corporate, Commercial & Insolvency (IBC)",
                    "Direct & Indirect Taxation (GST / Income Tax)",
                    "Matrimonial, Custody & Family Law",
                    "Arbitration, Mediation & Conciliation (ADR)",
                    "Cyber Law, Data Protection & White Collar Crimes",
                    "Labour, Service & Employment Law",
                ], 1):
                    FieldOption.objects.create(profession_field=f6, value=pa, label=pa, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Chamber / Law Firm Name",
                    field_key="chamber_firm_name",
                    field_type="text",
                    label="Chamber / Law Firm / Office Name",
                    placeholder="e.g. Lex Chambers / Apex Advocates",
                    is_required=False,
                    display_order=70,
                )
                ProfessionField.objects.create(
                    profession=prof,
                    name="Profile Summary",
                    field_key="profile_summary",
                    field_type="textarea",
                    label="Brief Practice Profile & Standing Summary",
                    placeholder="Outline key legal achievements, landmark matters, or specialized practice focus...",
                    is_required=False,
                    display_order=80,
                )

            # 4. WING 2: OTHER PROFESSIONAL (CA, CS, FINANCE)
            cat_other = Category.objects.create(
                name="Other Professional Wing",
                slug="other_professional",
                description="Chartered Accountants, Company Secretaries, CMAs, and Corporate Governance Experts.",
                is_active=True,
                display_order=20,
            )
            VisualTheme.objects.create(
                category=cat_other,
                primary_color="#065f46",
                secondary_color="#047857",
                accent_color="#0d9488",
                background_color="#ffffff",
                text_color="#0f172a",
                border_color="#cbd5e1",
            )
            grp_other = Group.objects.create(
                category=cat_other,
                name="Accounting, Finance & Corporate Governance",
                slug="finance_governance",
                description="Certified professionals registered with statutory councils.",
                is_active=True,
                display_order=10,
            )
            other_professions = [
                ("chartered_accountant", "Chartered Accountant (CA)", 10),
                ("company_secretary", "Company Secretary (CS)", 20),
                ("cost_accountant", "Cost & Management Accountant (CMA)", 30),
                ("forensic_auditor", "Forensic Auditor & Financial Expert", 40),
            ]
            for slug, name, order in other_professions:
                prof = Profession.objects.create(
                    group=grp_other,
                    name=name,
                    slug=slug,
                    is_active=True,
                    display_order=order,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["cop_certificate"],
                    is_required=True,
                    display_order=10,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["resume_cv"],
                    is_required=False,
                    display_order=20,
                )
                ProfessionField.objects.create(
                    profession=prof,
                    name="Statutory Membership Number",
                    field_key="membership_number",
                    field_type="text",
                    label="Statutory Membership / Registration Number (e.g. ICAI / ICSI)",
                    placeholder="e.g. ICAI-123456 / FCS-9876",
                    is_required=True,
                    display_order=10,
                )
                f_body = ProfessionField.objects.create(
                    profession=prof,
                    name="Statutory Council / Institute",
                    field_key="statutory_body",
                    field_type="select",
                    label="Professional Statutory Council",
                    is_required=True,
                    display_order=20,
                )
                for idx, body in enumerate([
                    "Institute of Chartered Accountants of India (ICAI)",
                    "Institute of Company Secretaries of India (ICSI)",
                    "Institute of Cost Accountants of India (ICMAI)",
                    "Insolvency and Bankruptcy Board of India (IBBI)",
                ], 1):
                    FieldOption.objects.create(profession_field=f_body, value=body, label=body, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Year of Qualification",
                    field_key="year_of_qualification",
                    field_type="text",
                    label="Year of Qualification / Certificate of Practice",
                    placeholder="e.g. 2017",
                    is_required=True,
                    display_order=30,
                )
                f_exp = ProfessionField.objects.create(
                    profession=prof,
                    name="Years of Professional Standing",
                    field_key="experience_years",
                    field_type="select",
                    label="Years of Professional Standing",
                    is_required=True,
                    display_order=40,
                )
                for idx, exp in enumerate(["1-3 Years", "3-5 Years", "5-10 Years", "10-15 Years", "15+ Years"], 1):
                    FieldOption.objects.create(profession_field=f_exp, value=exp, label=exp, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Firm / Practice Name",
                    field_key="firm_name",
                    field_type="text",
                    label="Firm / Proprietorship / Corporate Name",
                    placeholder="e.g. Sharma & Associates, Chartered Accountants",
                    is_required=True,
                    display_order=50,
                )
                f_spec = ProfessionField.objects.create(
                    profession=prof,
                    name="Core Functional Expertise",
                    field_key="area_of_expertise",
                    field_type="select",
                    label="Core Functional Expertise",
                    is_required=True,
                    display_order=60,
                )
                for idx, spec in enumerate([
                    "Statutory & Tax Audit",
                    "Forensic Accounting & Financial Fraud Investigation",
                    "Corporate Governance & Secretarial Compliance",
                    "Mergers, Acquisitions & Due Diligence",
                    "Insolvency & Bankruptcy Resolution (IBC)",
                    "Direct & Indirect Taxation (GST / International Tax)",
                    "Valuation & Financial Advisory",
                ], 1):
                    FieldOption.objects.create(profession_field=f_spec, value=spec, label=spec, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Profile Summary",
                    field_key="profile_summary",
                    field_type="textarea",
                    label="Brief Firm / Professional Profile",
                    placeholder="Summary of corporate clients, audit engagements, or specialized financial standing...",
                    is_required=False,
                    display_order=70,
                )

            # 5. WING 3: VOLUNTEER & PARA-LEGAL WING
            cat_vol = Category.objects.create(
                name="Volunteer & Para-Legal Wing",
                slug="volunteer",
                description="Para-Legal Volunteers, Legal Aid Fellows, Law Students, and Citizen Activists.",
                is_active=True,
                display_order=30,
            )
            VisualTheme.objects.create(
                category=cat_vol,
                primary_color="#7c2d12",
                secondary_color="#9a3412",
                accent_color="#d97706",
                background_color="#ffffff",
                text_color="#0f172a",
                border_color="#cbd5e1",
            )
            grp_vol = Group.objects.create(
                category=cat_vol,
                name="Community Legal Aid & Fellowships",
                slug="social_justice",
                description="Social justice volunteers and research associates committed to public legal service.",
                is_active=True,
                display_order=10,
            )
            vol_professions = [
                ("para_legal_volunteer", "Para-Legal Volunteer (PLV)", 10),
                ("legal_aid_fellow", "Legal Aid Research Fellow", 20),
                ("law_student_associate", "Law Student & Research Associate", 30),
            ]
            for slug, name, order in vol_professions:
                prof = Profession.objects.create(
                    group=grp_vol,
                    name=name,
                    slug=slug,
                    is_active=True,
                    display_order=order,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["student_ngo_id"],
                    is_required=True,
                    display_order=10,
                )
                ProfessionDocument.objects.create(
                    profession=prof,
                    document=docs["resume_cv"],
                    is_required=False,
                    display_order=20,
                )
                ProfessionField.objects.create(
                    profession=prof,
                    name="Affiliated University / Institution / NGO",
                    field_key="institution_college",
                    field_type="text",
                    label="University / Law School / NGO Affiliation",
                    placeholder="e.g. Faculty of Law, University of Delhi",
                    is_required=True,
                    display_order=10,
                )
                ProfessionField.objects.create(
                    profession=prof,
                    name="Current Qualification / Degree",
                    field_key="current_qualification",
                    field_type="text",
                    label="Current Qualification / Degree Pursued",
                    placeholder="e.g. B.A. LL.B (Final Year) / Master of Social Work",
                    is_required=True,
                    display_order=20,
                )
                f_cause = ProfessionField.objects.create(
                    profession=prof,
                    name="Area of Legal Aid Interest",
                    field_key="cause_interest",
                    field_type="select",
                    label="Preferred Legal Aid & Social Justice Area",
                    is_required=True,
                    display_order=30,
                )
                for idx, cause in enumerate([
                    "Prisoners Rights & Undertrial Legal Assistance",
                    "Women, Child & Domestic Violence Legal Advocacy",
                    "Consumer Protection & Rural Legal Literacy Outreach",
                    "Environmental Protection & Public Health Advocacy",
                    "Legal Research, Statutory Documentation & Policy Analysis",
                    "Dispute Mediation & Community Lok Adalat Organizing",
                ], 1):
                    FieldOption.objects.create(profession_field=f_cause, value=cause, label=cause, display_order=idx)

                f_hrs = ProfessionField.objects.create(
                    profession=prof,
                    name="Available Time Commitment",
                    field_key="available_hours_per_week",
                    field_type="select",
                    label="Available Time Commitment (Hours / Week)",
                    is_required=True,
                    display_order=40,
                )
                for idx, hrs in enumerate([
                    "5-10 Hours / Week (Part-time / Weekend)",
                    "10-20 Hours / Week (Active Associate)",
                    "Full-time Internship / Legal Fellowship",
                ], 1):
                    FieldOption.objects.create(profession_field=f_hrs, value=hrs, label=hrs, display_order=idx)

                ProfessionField.objects.create(
                    profession=prof,
                    name="Statement of Motivation",
                    field_key="motivation_statement",
                    field_type="textarea",
                    label="Statement of Purpose / Motivation to Serve",
                    placeholder="Briefly state your passion for pro bono social justice and legal empowerment...",
                    is_required=True,
                    display_order=50,
                )

        self.stdout.write(self.style.SUCCESS("Clean ICJ Pathways successfully seeded!"))
        self.stdout.write(self.style.SUCCESS("  - 3 Official Wings: Legal Professional, Other Professional, Volunteer"))
        self.stdout.write(self.style.SUCCESS("  - 11 Focused Designations with precise relevant fields & documents."))
