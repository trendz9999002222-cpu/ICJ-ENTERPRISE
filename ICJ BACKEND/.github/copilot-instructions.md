# ICJ ENTERPRISE PLATFORM - MASTER COPILOT INSTRUCTIONS

## POLICY HIERARCHY & AUTOMATIC LOADING ORDER
> [!IMPORTANT]
> **Single Source of Truth Mandate**:
> The Master Policy [`docs/COPILOT_MASTER_POLICY.md`](../docs/COPILOT_MASTER_POLICY.md) is the root authority and Single Source of Truth for all AI agent behavior, enterprise rules, and architecture principles.
> Every Copilot session automatically loads the policy hierarchy in the following exact sequence:

### Mandatory Loading Sequence:
1. **Root Source of Truth**: [`docs/COPILOT_MASTER_POLICY.md`](../docs/COPILOT_MASTER_POLICY.md) (Loaded First - SSOT)
2. **Inspection Policy**: [`docs/COPILOT_INSPECTION_POLICY.md`](../docs/COPILOT_INSPECTION_POLICY.md)
3. **Development Policy**: [`docs/COPILOT_DEVELOPMENT_POLICY.md`](../docs/COPILOT_DEVELOPMENT_POLICY.md)
4. **Security Policy**: [`docs/COPILOT_SECURITY_POLICY.md`](../docs/COPILOT_SECURITY_POLICY.md)
5. **Testing Policy**: [`docs/COPILOT_TESTING_POLICY.md`](../docs/COPILOT_TESTING_POLICY.md)
6. **Release Policy**: [`docs/COPILOT_RELEASE_POLICY.md`](../docs/COPILOT_RELEASE_POLICY.md)

---

## OBJECTIVE
==================================================
UNDERSTAND BEFORE IMPLEMENTATION POLICY
==================================================

MISSION

Understanding the task correctly is more important than writing code quickly.

Before writing, modifying or generating any code:

1. Carefully read and understand the relevant sections of COPILOT_MASTER_POLICY.md.

2. Read all applicable Core Policies and Appendices before starting implementation.

3. Never start coding immediately.

4. First understand:

* Business Requirements

* Existing Architecture

* Dependencies

* Workflow

* Security Rules

* RBAC

* Database Design

* Services

* Shared Components

* Applicable Policies

5. Think before reading files.

6. Spend sufficient time understanding the task.

7. Identify the minimum files required.

8. Plan the smallest safe implementation.

9. Reuse existing architecture, services, components, hooks and utilities.

10. Never guess.

11. Never assume.

12. Never redesign without instruction.

13. Never modify working code unless required.

14. Never read unnecessary files.

15. Never scan the complete repository unless absolutely required.

16. Begin coding ONLY after the task and architecture are fully understood.

17. If any requirement is unclear, analyze the existing implementation first instead of making assumptions.

18. The goal is to reduce:

* Wrong implementations

* Unnecessary code changes

* Repeated builds

* Repeated validation

* AI Credits

* Development Cost

* Future maintenance effort

Quality of understanding is always more important than coding speed.

==================================================
END OF UNDERSTAND BEFORE IMPLEMENTATION POLICY
==================================================

Build one Universal Enterprise Platform capable of powering multiple industries from a single codebase.

The same platform must support:

- Web
- Android
- iOS
- Future Desktop

All platforms must reuse the same backend, business logic, authentication, permissions, organization engine and cloud foundation.

Never build separate software for different industries.

Everything must be configurable.

---

# EXECUTION MODE

Always use:

- Minimum Credit Mode
- Minimum Token Mode
- Minimum Context Mode
- Minimum File Read Mode
- Minimum File Change Mode
- Minimum Build Mode
- Minimum Validation Mode

---

# DEVELOPMENT RULES

- Read only the minimum required files.
- Never scan the entire repository.
- Never redesign completed architecture.
- Never rewrite completed modules.
- Never duplicate business logic.
- Never duplicate storage.
- Reuse existing services.
- Reuse hooks.
- Reuse utilities.
- Reuse components.
- Preserve backward compatibility.
- Modify the minimum number of files.
- Modify the minimum number of lines.
- Never introduce breaking changes.
- Keep implementation modular, scalable and production-ready.
- Apply changes directly to existing files.
- Do not return complete files unless explicitly requested.
- Build only once after all edits.
- Validate only the requested workflow.
- Stop immediately after successful validation.

---

# ARCHITECTURE

Always preserve:

- Cloud Data Foundation
- Master Person Architecture (MPA)
- Organization Engine
- RBAC
- Permission Engine
- Authentication
- Authorization
- Security Architecture
- Audit Logs
- Canonical Person Identity
- Canonical Organization Identity
- Cloud-first Architecture

Never redesign these foundations.

---

# UNIVERSAL PLATFORM PRINCIPLE

Build ONE platform.

Configure MANY businesses.

New industries must be created through configuration, not by rewriting code.

Everything should be configurable:

- Modules
- Menus
- Dashboard
- Forms
- Roles
- Permissions
- Workflows
- Themes
- Colors
- Branding
- Logos
- Organization Types
- Membership Types
- Finance Rules
- Document Types
- Notifications
- Reports

Avoid hardcoded values whenever practical.

---

# UI / UX

Design should be inspired by:

- Google
- Microsoft
- Apple
- Salesforce

Maintain:

- Responsive layout
- Professional spacing
- Clean typography
- Consistent cards
- Consistent buttons
- Consistent forms
- Mobile-first design

Forms must:

- Stay centered
- Use a reasonable max-width
- Never occupy the full page width
- Maintain balanced spacing

Every Password, Confirm Password, PIN and Secret field must include:

- Show Password
- Hide Password
- Eye Icon

Reuse one common password component.

Never duplicate password visibility logic.

---

# MOBILE STRATEGY

Design every feature so it works for:

- Web
- Android
- iOS

Never create platform-specific business logic unless absolutely necessary.

Reuse APIs and services across all platforms.

---

# WHITE LABEL STRATEGY

The platform should support multiple organizations using configuration only.

Changing:

- Logo
- Theme
- Colors
- Organization Name
- Modules
- Permissions

should create a different business experience without changing the core architecture.

---

# PERFORMANCE

Always prefer:

- Reuse over rewrite
- Configuration over duplication
- Components over copies
- Services over repeated logic
- Lazy loading where appropriate
- Modular architecture
- Scalable implementation

---

# OUTPUT FORMAT

Return only:

1. Files changed
2. Why each file changed
3. Build result
4. Validation result
5. Remaining blockers (if any)

Do not include unnecessary explanations.

---

# EXECUTION POLICY

If a TASK is provided:

Execute only that task.

If no TASK is provided:

Automatically continue with the next pending module according to the ICJ Enterprise Platform roadmap.

Only stop if there is a genuine blocking issue.
# EFFICIENCY & COST OPTIMIZATION POLICY

Always optimize for engineering efficiency, execution speed and minimum AI usage.

Follow these rules strictly:

- Think before reading files.
- Read only the files required for the current task.
- Never scan the entire repository unless absolutely required.
- Never repeatedly read the same files.
- Cache understanding from already-read files within the current task.
- Do not re-analyze completed modules.
- Do not re-check code that has not changed.
- Do not repeatedly inspect unchanged architecture.
- Avoid unnecessary searches.
- Avoid unnecessary repository indexing.
- Avoid unnecessary dependency analysis.
- Avoid unnecessary refactoring.
- Avoid unnecessary formatting-only edits.
- Avoid unnecessary code movement.
- Avoid unnecessary file creation.
- Avoid unnecessary file deletion.
- Avoid unnecessary builds.
- Avoid unnecessary application restarts.
- Avoid unnecessary browser reloads.
- Avoid unnecessary Playwright runs.
- Avoid unnecessary validation.
- Validate only the feature being changed.
- Never validate unrelated modules.
- Build only once after all required edits.
- If build succeeds, do not build again unless new code changes are made.
- If validation succeeds, stop immediately.
- Never continue exploring after successful completion.
- Never modify working code without a clear reason.
- Prefer extending existing modules over creating new ones.
- Prefer configuration over new code.
- Prefer reusable components over duplicate implementations.
- Keep patches as small as possible.
- Keep responses concise and focused.
- Do not explain internal reasoning unless explicitly requested.

Always maximize:
- Code reuse
- Component reuse
- Service reuse
- Hook reuse
- Configuration reuse

Always minimize:
- Tokens
- Context
- File reads
- File writes
- Code changes
- Build time
- Validation time
- Compute cost
- Development cost

The goal is to achieve enterprise-grade quality with the smallest safe implementation.
# ZERO DATA LOSS POLICY

Never remove or overwrite existing user data unless explicitly instructed.

Always preserve existing records, relationships and history.

When changing data structures, prefer safe migration over destructive replacement
# API FIRST POLICY

Every new business feature should be designed so it can be consumed by:

- Web
- Android
- iOS
- Desktop
- Future APIs

Keep business logic in services, not UI components.

Avoid platform-specific business logic whenever possible.
# FUTURE SCALABILITY POLICY

Design every implementation assuming the platform will support:

- Multiple Organizations
- Multiple Countries
- Multiple Languages
- Multiple Currencies
- Multiple Time Zones
- Millions of Users

Prefer configuration over hardcoding.

Keep the Core stable and extend functionality through reusable modules.
==================================================
APPENDIX A

ENTERPRISE ROLE BASED ACCESS CONTROL (RBAC)

==================================================

MISSION

The platform shall implement Enterprise Grade Role Based Access Control.

Every authenticated user shall automatically receive:

* Dashboard
* Sidebar
* Menus
* Routes
* Permissions
* Reports
* Notifications
* Workflows

based only on the assigned Role.

Never hardcode UI visibility.

Always use the Permission Engine.

==================================================
ROLE HIERARCHY

Highest Authority

↓

Super Admin

↓

System Admin

↓

National Admin

↓

State Admin

↓

District Admin

↓

City Admin

↓

Branch Admin

↓

Institution Admin

↓

Reviewer

↓

Operator

↓

Approved Member

↓

Pending Member

↓

Public Visitor

==================================================
AUTHORITY RULE

Higher Authority decisions are FINAL.

A lower authority must NEVER:

Modify

Delete

Reject

Suspend

Reactivate

Override

any decision made by a higher authority.

Authority Lock shall be enforced in BOTH:

Frontend

Backend

==================================================
ROLE DETECTION

Immediately after Login:

Automatically detect Role.

Automatically load:

Dashboard

Menus

Routes

Permissions

Widgets

Reports

Modules

No manual selection shall be required.

==================================================
ROLE DASHBOARD

Public Visitor

Home

About

Register

Login

Contact

--------------------------------

Pending Member

My Dashboard

My Profile

Application Status

Upload Documents

Notifications

Change Password

--------------------------------

Approved Member

Pending Features +

Digital ID

Certificate

Wallet

AI Assistant

My Services

Directory (if permitted)

--------------------------------

Branch Admin

Branch Members

Limited Reports

Verification (if permitted)

Documents

Search

Filters

--------------------------------

City Admin

City Dashboard

Verification

Reports

Certificates

ID Cards

--------------------------------

District Admin

District Dashboard

District Reports

Verification

--------------------------------

State Admin

State Dashboard

State Reports

Verification

--------------------------------

National Admin

National Dashboard

National Reports

Verification

--------------------------------

Institution Admin

Institution Members

Institution Reports

Institution Dashboard

--------------------------------

Super Admin

Everything

==================================================
PERMISSION MATRIX

Every Role shall define:

View

Create

Edit

Delete

Approve

Reject

Suspend

Reactivate

Verify

Upload

Download

Print

Export PDF

Export Excel

Export CSV

Generate Certificate

Generate ID Card

Generate QR

Reports

Dashboard

Settings

Notifications

Audit Logs

==================================================
MENU POLICY

Unauthorized Menus

must never be rendered.

Hidden is preferred over Disabled.

==================================================
ROUTE POLICY

Unauthorized Routes

must redirect safely.

Never expose protected screens.

==================================================
SECURITY

Permission must be verified:

Before rendering UI

Before executing Service

Before Database mutation

Before Export

Before Print

Before Delete

==================================================
AUDIT

Every privileged action shall record:

Who

When

Role

Organization

Previous Value

New Value

Reason

IP (if available)

==================================================
VALIDATION

Every release shall verify:

Role Detection

Dashboard

Sidebar

Menus

Routes

Permissions

Workflow
==================================================
APPENDIX B

ENTERPRISE MEMBERSHIP POLICY

==================================================

MISSION

The Membership Module shall operate as a complete Enterprise Membership Management System.

There shall be ONE shared Master Membership Form.

Never create separate registration forms for:

* Public Registration
* Admin Registration
* Member Registration

All registration flows must reuse the same components, services, validation rules and storage model.

==================================================
MASTER MEMBERSHIP FORM

Every member record shall support:

* Profile Photo
* Signature
* Full Name
* Membership Number
* Membership Type
* Organization
* Designation
* Profession
* Gender
* Date of Birth
* Auto Calculated Age
* Mobile
* WhatsApp
* Email
* Address
* State
* District
* City
* Post Office
* PIN Code
* Need Services
* Provide Services
* Remarks

==================================================
ADDRESS POLICY

Address shall follow Government hierarchy.

State

↓

District

↓

City

↓

Post Office

↓

PIN Code

Dropdowns must load automatically.

Never hardcode values.

==================================================
PHOTO POLICY

Every member shall support:

Upload

Preview

Replace

Delete

Crop (if available)

Photo must automatically appear in:

* Profile
* Member List
* Dashboard
* Certificate
* ID Card
* Reports
* Print

==================================================
DOCUMENT POLICY

Every member shall support:

Upload

Preview

Download

Replace

Delete

History

Document Type

Remarks

Verification Status

Documents shall be reusable throughout the platform.

==================================================
MEMBERSHIP WORKFLOW

Every member shall follow:

Pending

↓

Approved

↓

Verified

↓

Suspended

↓

Reactivated

↓

Rejected

↓

Archived (if supported)

Every transition must update automatically:

* Dashboard
* Reports
* Filters
* Statistics
* Counters
* Audit Logs

==================================================
SEARCH & FILTER

Verify support for:

Search

Status

Verification Status

Membership Type

State

District

City

Profession

Organization

==================================================
REPORTS

Generate:

All Members

Pending

Approved

Verified

Rejected

Suspended

Individual

Institutional

Verify:

PDF

Excel

CSV

Print

Every generated output must contain:

Correct Member Count

Correct Status

Photo (if applicable)

No Blank Pages

No Corrupted Files

==================================================
PROFILE VALIDATION

Verify:

Create

Edit

Save

Reload

Refresh

Logout

Login Again

All information must persist correctly.

==================================================
QUALITY RULES

Never duplicate forms.

Reuse existing services.

Reuse existing validation.

Reuse existing storage.

Modify minimum files.

Build once.

Run one focused Membership E2E verification.

==================================================
RETURN

1. Working Features

2. Missing Features

3. Bugs Found

4. Files Modified

5. Remaining Files

6. Test Results

7. Production Readiness %

==================================================
END OF APPENDIX B
==================================================
==================================================
APPENDIX C

LEGAL SERVICES, ADVOCATE & CASE MANAGEMENT POLICY

==================================================

MISSION

The platform shall support Legal Professionals, Litigants, Organizations and Members through one unified Legal Services Module.

Never create separate legal workflows.

Reuse the existing Membership, RBAC, Document and Notification systems.

==================================================
SERVICE TYPES

Every member may select one or both:

* I Need Services
* I Want to Provide Services

Both options may be selected simultaneously.

==================================================
I NEED SERVICES

If selected, allow:

* Service Category
* Legal Category
* Court Type
* Court Name
* Case Summary
* Priority
* Remarks

Support document upload for:

* Petition
* Notice
* Judgment
* Order
* Affidavit
* Agreement
* FIR
* Charge Sheet
* Appeal
* Reply
* Written Statement
* Evidence
* Other Legal Documents

Document Type shall be selected from Master Data.

==================================================
DOCUMENT MANAGEMENT

Every uploaded document shall support:

* Upload
* Preview
* Download
* Replace
* Delete
* Version History
* Audit Trail

The original file name shall be captured automatically.

The user shall only classify:

* Document Type
* Category
* Remarks

Never require manual file name entry.

==================================================
I WANT TO PROVIDE SERVICES

If selected, allow:

* Profession
* Practice Area
* Experience
* Organization
* Designation
* Service Category
* Available Locations
* Consultation Mode
* Availability

==================================================
ADVOCATE REGISTRATION

If Profession = Advocate

Display additional fields:

* Enrollment Number
* Enrollment Date
* State Bar Council
* Bar Association
* Court Type
* Court Name
* Practice Area
* Years of Practice

All dropdown values shall come from Master Data.

Never hardcode Court or Bar Council names.

==================================================
COURT MASTER HIERARCHY

Court selection shall follow:

State

↓

Court Type

↓

Court

↓

Bench (if applicable)

↓

Jurisdiction

Court Types may include:

* Supreme Court
* High Court
* District Court
* Family Court
* Commercial Court
* Consumer Commission
* MACT
* Labour Court
* Revenue Court
* Tribunal
* Special Court
* Other Courts

Support future Court Types through configuration only.

==================================================
BAR COUNCIL HIERARCHY

State

↓

State Bar Council

↓

Bar Association

↓

Enrollment Details

All data shall come from Master Data.

==================================================
CASE MANAGEMENT

Every Legal Request shall support:

* Draft
* Submitted
* Under Review
* Assigned
* Accepted
* Rejected
* Closed
* Archived

Status changes shall update:

* Dashboard
* Reports
* Notifications
* Audit Logs

==================================================
SEARCH & FILTER

Support search by:

* Member
* Case
* Advocate
* Organization
* Court
* Bar Council
* District
* State
* Status
* Service Category

==================================================
REPORTS

Generate reports for:

* Service Requests
* Advocates
* Cases
* Court-wise
* State-wise
* District-wise
* Status-wise

Support:

* PDF
* Excel
* CSV
* Print

==================================================
SECURITY

Legal documents shall follow RBAC.

Only authorized roles may:

* View
* Download
* Print
* Assign
* Verify
* Close
* Delete

Every action shall be logged.

==================================================
VALIDATION

Verify:

* Registration
* Document Upload
* Case Creation
* Court Selection
* Bar Council Selection
* Search
* Filter
* Reports
* Print
* Export
* Notifications
* Audit Trail

==================================================
END OF APPENDIX C
==================================================
==================================================
APPENDIX D

NATIONAL MASTER DATA POLICY

==================================================

MISSION

The ICJ Enterprise Platform shall use one centralized National Master Data System.

All modules shall reuse the same Master Data.

Never duplicate Master Data.

Never hardcode Government data.

Every Master shall be configurable.

==================================================
MASTER DATA MODULES

Implement reusable Master Data for:

* Countries

* States

* Union Territories

* Divisions

* Districts

* Sub Divisions

* Tehsil

* Taluka

* Mandal

* Blocks

* Nagar Panchayat

* Municipal Council

* Municipal Corporation

* Villages

* Cities

* Wards

* Local Bodies

* Post Offices

* PIN Codes

==================================================
LOCATION HIERARCHY

Country

↓

State / UT

↓

Division (where applicable)

↓

District

↓

Sub Division

↓

Tehsil / Taluka / Mandal

↓

City / Town / Village

↓

Post Office

↓

PIN Code

Every dropdown shall load automatically.

Never require manual typing where Master Data exists.

==================================================
COURT MASTER

Implement one National Court Master.

Hierarchy:

Country

↓

State

↓

Court Category

↓

Court Type

↓

Court Name

↓

Bench (if applicable)

↓

Jurisdiction

Support future Courts without source code changes.

==================================================
COURT TYPES

Examples include:

* Supreme Court

* High Court

* District Court

* Sessions Court

* Civil Court

* Criminal Court

* Family Court

* Commercial Court

* Consumer Commission

* MACT

* Labour Court

* Revenue Court

* Gram Nyayalaya

* Debt Recovery Tribunal (DRT)

* Debt Recovery Appellate Tribunal (DRAT)

* NCLT

* NCLAT

* CAT

* SAT

* RERA

* Electricity Tribunal

* Railway Claims Tribunal

* Armed Forces Tribunal

* Tax Tribunal

* Green Tribunal (NGT)

* Cooperative Tribunal

* Wakf Tribunal

* Special Courts

* Any future Courts

==================================================
BAR COUNCIL MASTER

Hierarchy:

State

↓

State Bar Council

↓

Bar Association

↓

Enrollment Details

All values shall come from Master Data.

==================================================
GOVERNMENT MASTER

Maintain reusable Masters for:

* Ministries

* Departments

* Authorities

* Boards

* Commissions

* Corporations

* PSUs

* Local Bodies

==================================================
DOCUMENT MASTER

Create reusable Master Data for:

* Notice

* Petition

* Suit

* Appeal

* Affidavit

* Agreement

* Judgment

* Order

* FIR

* Charge Sheet

* Reply

* Written Statement

* Evidence

* Contract

* Other Documents

==================================================
SERVICE MASTER

Maintain configurable Masters for:

* Legal Services

* Arbitration

* Mediation

* Documentation

* Registration

* Consultation

* Compliance

* Tax

* Audit

* Research

* Training

* Certification

==================================================
MASTER DATA FEATURES

Every Master shall support:

Create

Update

Delete

Activate

Deactivate

Import Excel

Export Excel

Search

Filter

Audit Log

Version History

Soft Delete

Restore

==================================================
REUSE POLICY

All modules must reuse Master Data.

Membership

Legal Services

Case Management

HR

Finance

Reports

Notifications

Dashboard

AI

Documents

Never create duplicate lookup tables.

==================================================
VALIDATION

Every release shall verify:

Master Creation

Master Editing

Master Activation

Master Deactivation

Import

Export

Search

Filter

Cascade Loading

Performance

RBAC

Audit Log

==================================================
END OF APPENDIX D
==================================================
==================================================
APPENDIX E

GOVERNMENT UI & FORM STANDARDS

==================================================

MISSION

The ICJ Enterprise Platform shall follow Enterprise Government UI Standards inspired by:

* NIC India
* Digital India
* Government eOffice
* DigiLocker
* GST Portal
* MCA Portal
* Income Tax Portal
* GeM Portal
* Passport Seva
* UIDAI

The objective is to provide a professional, clean, accessible and consistent Government-grade user experience.

==================================================
GENERAL UI PRINCIPLES

Every screen shall be:

* Professional
* Clean
* Responsive
* Mobile Friendly
* Tablet Friendly
* Desktop Friendly

Maintain:

* Consistent Typography
* Consistent Colors
* Consistent Icons
* Consistent Buttons
* Consistent Cards
* Consistent Tables
* Consistent Dialogs

Never mix multiple design styles.

==================================================
FORM STANDARDS

All forms shall use ONE common design.

Forms must:

* Stay centered
* Use a reasonable max-width
* Never occupy the full page width
* Maintain balanced spacing
* Show clear labels
* Show required fields
* Show validation messages
* Show loading indicators
* Show success messages
* Show error messages

Never create different form layouts for different modules.

==================================================
FIELD STANDARDS

Every field shall have:

* Label
* Placeholder
* Validation
* Helper Text (when required)

Use appropriate controls:

* Textbox
* Dropdown
* Date Picker
* Time Picker
* File Upload
* Checkbox
* Radio Button
* Toggle

Avoid free-text entry where Master Data exists.

==================================================
PASSWORD STANDARDS

Every Password, PIN or Secret field shall include:

* Show Password
* Hide Password
* Eye Icon

Reuse one common password component.

==================================================
TABLE STANDARDS

Every table shall support:

* Search
* Filter
* Sort
* Pagination
* Export
* Print
* Responsive Layout

==================================================
SEARCH & FILTER

All modules shall provide:

* Global Search
* Advanced Search
* Multi Filter
* Reset Filter
* Saved Filter (if applicable)

==================================================
DASHBOARD STANDARDS

Every dashboard shall display:

* Statistics Cards
* Charts (where applicable)
* Recent Activity
* Notifications
* Pending Tasks
* Quick Actions (Role Based)

Only authorized widgets shall be visible.

==================================================
PRINT STANDARDS

Every printable document shall have:

* Organization Logo
* Organization Name
* Title
* Date
* Page Number
* Footer
* QR Code (if applicable)

Print layouts shall be A4 compatible.

==================================================
REPORT STANDARDS

Every report shall support:

* PDF
* Excel
* CSV
* Print

Verify:

* Correct Records
* Correct Counts
* Proper Formatting
* No Blank Pages
* No Corrupted Files

==================================================
PHOTO & DOCUMENT STANDARDS

Photo Upload shall support:

* Preview
* Replace
* Delete

Documents shall support:

* Upload
* Preview
* Download
* Replace
* Delete
* Version History

==================================================
ACCESSIBILITY

Support:

* Keyboard Navigation
* Screen Readers
* Proper Color Contrast
* Responsive Fonts

==================================================
QUALITY CHECK

Before production verify:

* Layout Consistency
* Form Consistency
* Table Consistency
* Report Consistency
* Print Consistency
* Mobile Responsiveness
* Accessibility
* Performance

==================================================
END OF APPENDIX E
==================================================
==================================================
APPENDIX F

ENTERPRISE TESTING & PRODUCTION VERIFICATION POLICY

==================================================

MISSION

Before any module is marked Production Ready,
Copilot shall perform a complete end-to-end verification.

Never assume a feature works.

Always verify with real workflows.

==================================================
GENERAL TESTING RULES

Test only the requested module.

Reuse existing test data whenever possible.

Create the minimum required real records.

Do not use unnecessary mock data.

Build only once if code changes.

Run only focused validation.

Stop after verification.

==================================================
MEMBERSHIP TEST

Create at least TWO real members.

Member A

Complete full registration.

Member B

Complete full registration.

Verify:

* Save
* Edit
* Reload
* Refresh
* Search
* Filter
* Logout
* Login
* Profile

==================================================
VERIFY ALL MEMBERSHIP FIELDS

* Profile Photo
* Signature
* Full Name
* Membership Number
* Membership Type
* Profession
* Organisation
* Designation
* DOB
* Auto Age
* Gender
* Mobile
* WhatsApp
* Email
* Address
* State
* District
* City
* Post Office
* PIN Code
* Need Services
* Provide Services
* Remarks

Verify persistence after refresh.

==================================================
PHOTO TEST

Verify:

Upload

Preview

Replace

Delete

Persistence

Propagation to:

* Profile
* Member List
* Dashboard
* ID Card
* Certificate
* Reports
* Print

==================================================
DOCUMENT TEST

Verify:

Upload

Preview

Download

Replace

Delete

History

Document Type

==================================================
WORKFLOW TEST

Verify complete lifecycle.

Pending

↓

Approved

↓

Verified

↓

Suspended

↓

Reactivated

↓

Rejected

↓

Archived (if supported)

After every transition verify:

Dashboard

Reports

Counters

Statistics

Filters

Audit Logs

==================================================
ROLE TEST

Verify using actual roles.

Public Visitor

Pending Member

Approved Member

Reviewer

Operator

Branch Admin

City Admin

District Admin

State Admin

National Admin

Institution Admin

System Admin

Super Admin

Verify:

Dashboard

Sidebar

Menus

Routes

Permissions

Buttons

Actions

==================================================
REPORT TEST

Generate:

All Members

Pending

Approved

Verified

Rejected

Suspended

Individual

Institutional

==================================================
EXPORT TEST

Generate and OPEN:

PDF

Excel

CSV

Print

Verify:

Correct Records

Correct Counts

Photos

Status

Formatting

No Blank Pages

No Corrupted Files

==================================================
IDENTITY TEST

Generate:

Member ID Card

Membership Certificate

QR Code

Verify:

Photo

Member Details

QR Content

Print Layout

==================================================
SEARCH & FILTER TEST

Verify:

Search

Status

Verification

Membership Type

Profession

State

District

City

Organization

==================================================
LEGAL SERVICE TEST

Verify:

"I Need Services"

"I Want to Provide Services"

Case Upload

Judgment Upload

Notice Upload

Document Classification

==================================================
MASTER DATA TEST

Verify automatic cascading:

Country

↓

State

↓

District

↓

City

↓

Post Office

↓

PIN Code

Verify:

Court Master

Bar Council

Bar Association

Profession Master

Document Master

==================================================
SECURITY TEST

Verify:

Authority Lock

Permission Checks

Role Isolation

Route Protection

Menu Protection

Audit Logs

Lower roles shall never override higher authority decisions.

==================================================
PRODUCTION ACCEPTANCE

A module shall be Production Ready only if:

✓ No Critical Bugs

✓ No Data Loss

✓ No Permission Leak

✓ No Broken Workflow

✓ No Export Errors

✓ No Print Errors

✓ No Security Errors

✓ No UI Errors

✓ No Build Errors

==================================================
RETURN ONLY

1. Working Features

2. Failed Features

3. Bugs Found

4. Files Modified

5. Files Still Requiring Changes

6. Test Results

7. Production Readiness %

8. GO / NO-GO

Stop after the report.

==================================================
END OF APPENDIX F
==================================================
==================================================
APPENDIX G

ENTERPRISE SECURITY, AUDIT & AUTHORITY LOCK POLICY

==================================================

MISSION

The ICJ Enterprise Platform shall implement Enterprise Grade Security.

Every business action shall be:

* Authorized
* Auditable
* Traceable
* Recoverable
* Tamper Resistant

Security shall be enforced in:

* UI
* API
* Services
* Database
* Reports
* Exports

==================================================
SECURITY PRINCIPLES

Never trust the UI.

Always validate permissions at Service Layer.

Always validate permissions before Database mutation.

Never expose unauthorized data.

Never expose hidden routes.

Never expose unauthorized APIs.

==================================================
AUTHORITY HIERARCHY

Super Admin

↓

System Admin

↓

National Admin

↓

State Admin

↓

District Admin

↓

City Admin

↓

Branch Admin

↓

Institution Admin

↓

Reviewer

↓

Operator

↓

Approved Member

↓

Pending Member

↓

Public Visitor

==================================================
AUTHORITY LOCK

Higher authority decisions are FINAL.

Lower authority shall NEVER:

Approve

Reject

Suspend

Reactivate

Delete

Modify

Override

any decision made by a higher authority.

Authority Lock shall be verified before every mutation.

==================================================
PERMISSION ENFORCEMENT

Every action shall require permission verification.

Examples:

View

Create

Edit

Delete

Approve

Reject

Suspend

Reactivate

Verify

Upload

Download

Print

Export

Generate ID Card

Generate Certificate

Generate QR

Reports

Dashboard

Settings

Notifications

==================================================
AUDIT LOG

Every privileged action shall automatically record:

Audit ID

Timestamp

User ID

Member ID

Role

Organization

Module

Action

Previous Value

New Value

Reason

IP Address (if available)

Device Information (if available)

==================================================
IMMUTABLE HISTORY

Audit Logs shall never be deleted.

Audit Logs shall never be modified.

Only authorized roles may view Audit Logs.

==================================================
SOFT DELETE POLICY

Never permanently delete business records.

Use Soft Delete.

Support:

Restore

Archive

Audit

History

==================================================
LOGIN SECURITY

Verify:

Authentication

Authorization

Session Validation

Password Policy

Account Lock (if applicable)

Session Expiry

==================================================
EXPORT SECURITY

Before generating:

PDF

Excel

CSV

Print

Verify permission again.

Unauthorized users shall never export data.

==================================================
DOCUMENT SECURITY

Every uploaded document shall support:

Access Control

Audit Trail

Version History

Permission Verification

==================================================
API SECURITY

Every API shall verify:

Authentication

Authorization

Role

Permission

Organization Scope

Authority Lock

==================================================
DATA SECURITY

Never overwrite production data.

Never remove user history.

Never break relationships.

Always preserve:

Audit

History

Version

Ownership

==================================================
SECURITY VALIDATION

Before Production verify:

Authority Lock

Permission Checks

Role Isolation

Route Protection

Menu Protection

Export Protection

Audit Logging

Soft Delete

Restore

Session Security

API Security

==================================================
RETURN ONLY

1. Security Passed

2. Security Failed

3. Permission Errors

4. Authority Errors

5. Audit Errors

6. Exact Files

7. Production Readiness %

8. GO / NO-GO

==================================================
END OF APPENDIX G
==================================================
==================================================
APPENDIX H

ENTERPRISE DATABASE & API STANDARDS

==================================================

MISSION

The ICJ Enterprise Platform shall follow Enterprise Database and API standards.

The database shall be the Single Source of Truth.

Business logic shall never reside inside UI components.

All business logic shall reside in reusable Services and APIs.

==================================================
DATABASE PRINCIPLES

One Canonical Database

One Canonical Person

One Canonical Organization

One Identity

One Source of Truth

Never duplicate business data.

Never create parallel tables for the same entity.

==================================================
NAMING STANDARDS

Use consistent naming.

Tables

snake_case

Columns

snake_case

Primary Key

id

Foreign Key

<entity>_id

Timestamps

created_at

updated_at

deleted_at

==================================================
SOFT DELETE POLICY

Never permanently delete production data.

Every business entity shall support:

Soft Delete

Restore

Archive

Audit History

==================================================
VERSIONING

Critical records shall support:

Version Number

Created By

Updated By

Approved By

Verified By

Timestamp

==================================================
RELATIONSHIPS

Always use proper relationships.

One to One

One to Many

Many to Many

Never duplicate relational data.

==================================================
MASTER DATA

Reference Master Tables.

Never duplicate:

State

District

City

Court

Bar Council

Profession

Document Types

Member Types

Service Categories

==================================================
TRANSACTIONS

Critical operations shall be transactional.

Examples:

Membership Approval

Payment

Wallet

Certificate

ID Card

Legal Case

Organization Creation

==================================================
AUDIT

Every database mutation shall record:

Who

When

Role

Previous Value

New Value

Reason

==================================================
API PRINCIPLES

All APIs shall be reusable.

Web

Android

iOS

Desktop

Future Integrations

shall consume the same APIs.

==================================================
REST STANDARDS

Use RESTful endpoints.

Examples:

GET

POST

PUT

PATCH

DELETE

Avoid custom patterns where standard REST is sufficient.

==================================================
API VERSIONING

Support versioning.

Example:

/api/v1/

/api/v2/

Future APIs shall never break older clients.

==================================================
API RESPONSE

Every API shall return a consistent structure.

status

success

message

data

errors

meta

timestamp

==================================================
VALIDATION

Validate:

Authentication

Authorization

RBAC

Input

Business Rules

Organization Scope

Authority Lock

Never trust client-side validation.

==================================================
PAGINATION

Support:

Pagination

Sorting

Filtering

Searching

==================================================
ERROR HANDLING

Use standardized error responses.

Validation Error

Authentication Error

Authorization Error

Not Found

Conflict

Server Error

==================================================
PERFORMANCE

Avoid duplicate queries.

Reuse services.

Reuse repositories.

Use lazy loading where appropriate.

Optimize indexes.

==================================================
SECURITY

Every API shall verify:

Authentication

Permission

Role

Organization Scope

Authority Lock

Audit

==================================================
TESTING

Verify:

CRUD

Pagination

Filtering

Sorting

Transactions

Audit

Permissions

Performance

Backward Compatibility

==================================================
RETURN ONLY

1. APIs Verified

2. Database Verified

3. Errors Found

4. Files Modified

5. Remaining Issues

6. Production Readiness %

==================================================
END OF APPENDIX H
==================================================
==================================================
APPENDIX I

ENTERPRISE AI, AUTOMATION & FUTURE EXPANSION POLICY

==================================================

MISSION

The ICJ Enterprise Platform shall be AI-First, Automation-Ready and Future-Proof.

AI shall assist users and administrators but shall never bypass Security, RBAC, Audit Logs or Authority Lock.

All AI functionality shall reuse the existing architecture.

==================================================
AI PRINCIPLES

AI shall:

* Assist
* Recommend
* Validate
* Summarize
* Classify
* Search
* Automate repetitive work

AI shall never:

* Override permissions
* Approve records automatically without authorization
* Modify protected data
* Delete production records
* Bypass workflows

==================================================
AI ASSISTANT

Every authorized user may access AI according to role.

AI capabilities may include:

* Membership Assistance
* Legal Draft Assistance
* Case Summary
* Document Classification
* OCR Assistance
* Report Summary
* Notification Drafting
* Workflow Guidance
* Search Assistance
* Knowledge Base Assistance

==================================================
DOCUMENT AI

AI shall support:

* OCR

* Automatic Document Type Detection

* Metadata Extraction

* Duplicate Detection

* File Classification

* Language Detection

* Summary Generation

* Keyword Extraction

==================================================
LEGAL AI

Support:

* Case Summary

* Judgment Summary

* Notice Summary

* Petition Summary

* Legal Category Suggestion

* Court Suggestion

* Practice Area Suggestion

AI recommendations shall always require user confirmation.

==================================================
WORKFLOW AUTOMATION

Automate repetitive tasks:

* Notifications

* Email

* SMS

* Dashboard Refresh

* Report Generation

* Membership Reminders

* Renewal Alerts

* Verification Reminders

==================================================
SCHEDULER

Support scheduled jobs for:

Daily

Weekly

Monthly

Yearly

Manual Execution

Background Processing

==================================================
NOTIFICATIONS

Support:

In-App

Email

SMS

Push Notification

WhatsApp (where integrated)

==================================================
MULTI LANGUAGE

Platform shall support:

Multiple Languages

Language Packs

Unicode

Translation Resources

No hardcoded language strings in business logic.

==================================================
MULTI COUNTRY

Future support shall include:

Countries

Currencies

Time Zones

Tax Rules

Address Formats

Legal Systems

Without changing core architecture.

==================================================
CONFIGURATION FIRST

Future industries shall be enabled through:

Configuration

Master Data

Permissions

Workflows

Not by rewriting code.

==================================================
AI SECURITY

AI shall always respect:

RBAC

Authority Lock

Audit Logs

Organization Scope

Permission Engine

AI shall never expose unauthorized data.

==================================================
AUDIT

Every AI-assisted action shall record:

User

Role

Organization

Prompt (where applicable)

Suggested Action

Accepted/Rejected

Timestamp

==================================================
VALIDATION

Verify:

AI Assistance

Document AI

OCR

Automation

Notifications

Scheduler

Permissions

Audit Logs

Performance

==================================================
RETURN ONLY

1. AI Features Working

2. Automation Working

3. Missing Features

4. Security Issues

5. Files Modified

6. Production Readiness %

==================================================
END OF APPENDIX I
==================================================
==================================================
APPENDIX J

AI COST OPTIMIZATION & EXECUTION CONTROL POLICY

==================================================

MISSION

Always achieve Enterprise-grade quality using the minimum safe AI resources.

Optimize for:

* Minimum Credits
* Minimum Tokens
* Minimum Context
* Minimum File Reads
* Minimum File Writes
* Minimum Searches
* Minimum Builds
* Minimum Browser Actions
* Minimum Validation
* Maximum Code Reuse

==================================================
NEVER DO THESE UNLESS ABSOLUTELY REQUIRED

Do NOT scan the entire repository.

Do NOT read unrelated folders.

Do NOT read unchanged files.

Do NOT repeatedly read the same files.

Do NOT search the entire project when the target file is known.

Do NOT search node_modules.

Do NOT search dist.

Do NOT search build output.

Do NOT search coverage.

Do NOT search cache folders.

Do NOT search generated files.

Do NOT inspect completed modules.

Do NOT inspect modules outside the current task.

Do NOT inspect every route.

Do NOT inspect every component.

Do NOT inspect every service.

Do NOT inspect every hook.

Do NOT inspect every utility.

Do NOT inspect every page.

Do NOT inspect every context.

Do NOT inspect every reducer.

Do NOT inspect every store.

Do NOT inspect every API.

Do NOT inspect every model.

Do NOT inspect every database file.

Do NOT inspect every migration.

Do NOT inspect every configuration file.

Do NOT re-analyze architecture.

Do NOT redesign architecture.

Do NOT rewrite working modules.

Do NOT move files unnecessarily.

Do NOT rename files unnecessarily.

Do NOT create duplicate components.

Do NOT create duplicate services.

Do NOT create duplicate hooks.

Do NOT create duplicate utilities.

Do NOT create duplicate forms.

Do NOT create duplicate business logic.

Do NOT create duplicate APIs.

Do NOT create duplicate storage.

Do NOT create temporary files unless required.

Do NOT create unnecessary documentation.

Do NOT create unnecessary TODO lists.

Do NOT create unnecessary reports.

==================================================
SEARCH POLICY

Search only when the exact location is unknown.

If a symbol is already known,
open the file directly.

Limit searches to the smallest possible scope.

==================================================
FILE READ POLICY

Read only the minimum number of files.

Read only the required functions.

Read only required line ranges.

Never reread unchanged files.

Cache understanding during the current task.

==================================================
FILE CHANGE POLICY

Modify the minimum files.

Modify the minimum lines.

Patch existing code.

Prefer extension over replacement.

==================================================
BUILD POLICY

Build only once.

Never build after every edit.

Never rebuild if no code changed.

==================================================
BROWSER POLICY

Open only the required page.

Never navigate through unrelated pages.

Never repeat the same browser verification.

Never rerun successful tests.

==================================================
PLAYWRIGHT POLICY

Run only focused scenarios.

Never execute full E2E unless requested.

Reuse existing test data.

Create the minimum required records.

==================================================
TEST POLICY

Validate only the requested workflow.

Never test unrelated modules.

Never repeat successful validations.

Stop after successful verification.

==================================================
REPORT POLICY

Return only:

Files Changed

Reason

Build Result

Validation Result

Remaining Blockers

Do not generate long explanations.

==================================================
STOP POLICY

Immediately stop when:

Requested task is complete.

Validation succeeds.

No blocker remains.

Never continue exploring after success.

==================================================
ENTERPRISE GOAL

Maximize:

* Reuse
* Stability
* Scalability
* Maintainability

Minimize:

* Credits
* Tokens
* Context
* Reads
* Writes
* Searches
* Builds
* Browser Actions
* Playwright Actions
* Validation Time
* Development Cost

==================================================
END OF APPENDIX J
==================================================
[04:11, 04/08/2026] international Consortium of juristsourist: 
Do NOT continue development.

Do NOT scan unrelated modules.
[04:16, 04/08/2026] international Consortium of juristsourist: ==================================================
UNIVERSAL PLATFORM & FUTURE DEPLOYMENT POLICY
==================================================

MISSION

The ICJ Enterprise Platform shall be developed as ONE Universal Enterprise Platform from a single codebase.

Every implementation shall automatically support:

* Web
* Android
* iOS
* Windows Desktop
* macOS Desktop
* Linux Desktop
* Future Platforms

Never develop separate business logic for different platforms.

==================================================
UNIVERSAL ARCHITECTURE

Always reuse the same:

* Backend
* APIs
* Business Logic
* Authentication
* Authorization
* RBAC
* Permission Engine
* Organization Engine
* Master Data
* Audit Logs
* Notification Engine
* Document Engine
* Reporting Engine
* AI Services
* Cloud Storage

UI may differ by platform, but business logic must always remain common.

==================================================
PLATFORM INDEPENDENCE

Never implement:

* Web-only Business Logic

* Android-only Business Logic

* iOS-only Business Logic

* Desktop-only Business Logic

Platform-specific code shall be limited to UI integration only.

==================================================
MOBILE FIRST

Every implementation shall follow:

* Mobile First Design

* Responsive Design

* Touch Friendly Controls

* Tablet Friendly Layout

* Desktop Friendly Layout

The same feature must work correctly on every supported device.

==================================================
COMMON UI

Every screen shall work correctly on:

* Mobile Phones

* Tablets

* Laptops

* Desktop Computers

including:

* Forms

* Tables

* Reports

* Dashboards

* Certificates

* ID Cards

* QR Codes

* Print Layouts

* Notifications

==================================================
API FIRST

Business Logic shall remain inside reusable:

* Services

* APIs

* Shared Components

* Shared Utilities

UI shall consume reusable APIs.

Never move business logic into UI components.

==================================================
OFFLINE & FUTURE READY

Design every feature assuming future support for:

* Offline Sync

* Mobile App Packaging

* Desktop Packaging

* Cloud Deployment

* Hybrid Applications

without rewriting business logic.

==================================================
DEPLOYMENT READY

Assume the platform will later be packaged as:

* Android App

* iOS App

* Windows Application

* macOS Application

* Linux Application

The same source code shall support all deployments.

==================================================
VERIFICATION

Before completing any feature verify:

✓ Web Compatibility

✓ Android Compatibility

✓ iOS Compatibility

✓ Desktop Compatibility

✓ Responsive Layout

✓ API Compatibility

✓ Service Reuse

✓ No Platform-Specific Business Logic

✓ Production Deployment Readiness

A feature shall NOT be considered complete until it is verified to work correctly across all supported platforms using the shared architecture.

==================================================
END OF UNIVERSAL PLATFORM & FUTURE DEPLOYMENT POLICY
==================================================
==================================================
ENTERPRISE CODING STANDARDS & NAMING CONVENTION POLICY
==================================================

MISSION

Develop the ICJ Enterprise Platform using consistent Enterprise Coding Standards.

The platform shall remain readable, maintainable, scalable and production-ready throughout its lifecycle.

==================================================
GENERAL CODING PRINCIPLES

Write clean code.

Write reusable code.

Write modular code.

Write production-ready code.

Prefer extension over replacement.

Prefer configuration over hardcoding.

Prefer composition over duplication.

Never introduce breaking changes.

Never rewrite working modules unnecessarily.

==================================================
FILE NAMING

Use consistent naming conventions.

React Components:
PascalCase

Examples:

MemberForm.jsx

Dashboard.jsx

OrganizationProfile.jsx

Services:

camelCase

Examples:

memberService.js

financeService.js

walletService.js

Utilities:

camelCase

Examples:

dateUtils.js

permissionUtils.js

validationUtils.js

==================================================
VARIABLE NAMING

Use meaningful names.

Avoid:

temp

abc

test

data1

Prefer:

member

organization

membershipStatus

approvalDate

verificationStatus

==================================================
FUNCTION NAMING

Functions shall describe their purpose.

Examples:

createMember()

approveMember()

verifyMember()

generateCertificate()

generateIdCard()

exportPdf()

==================================================
COMPONENT POLICY

One component.

One responsibility.

Keep components reusable.

Avoid duplicate UI components.

Reuse existing shared components whenever possible.

==================================================
SERVICE POLICY

Business Logic belongs ONLY inside Services.

Never place Business Logic inside:

Pages

Components

Dialogs

Tables

Forms

Keep UI thin.

==================================================
MASTER DATA POLICY

Never hardcode:

States

Districts

Cities

PIN Codes

Court Names

Bar Councils

Professions

Membership Types

Roles

Permissions

All shall come from Master Data.

==================================================
DATABASE POLICY

One source of truth.

Never duplicate entities.

Use relationships.

Prefer Soft Delete.

Maintain Audit Logs.

==================================================
API POLICY

Reuse APIs.

Never duplicate endpoints.

Keep API responses consistent.

Support versioning.

==================================================
SECURITY POLICY

Validate:

Authentication

Authorization

RBAC

Permissions

Authority Lock

Audit Logs

Never trust client-side validation.

==================================================
DOCUMENTATION POLICY

Document only where necessary.

Avoid redundant comments.

Keep README and Policy files updated when architecture changes.

==================================================
TESTING POLICY

Before completion verify:

Build

Validation

Permissions

Workflow

Security

Reports

Print

Exports

Stop after successful verification.

==================================================
QUALITY POLICY

Every implementation must be:

Reusable

Scalable

Secure

Responsive

Maintainable

Configurable

Production Ready

==================================================
RETURN FORMAT

Return only:

1. Files Changed

2. Why Each File Changed

3. Build Result

4. Validation Result

5. Remaining Blockers

==================================================
END OF ENTERPRISE CODING STANDARDS & NAMING CONVENTION POLICY
==================================================
==================================================
OUTPUT COMPRESSION POLICY
==================================================

Return only meaningful engineering results.

Do NOT include:

* Read...
* Searched...
* Updated todo list...
* Thinking...
* Internal reasoning...
* File scanning logs...
* Playwright execution logs...
* Browser navigation logs...
* Terminal command logs...
* Build command logs...
* Validation command logs...
* Repeated progress updates...

Show ONLY:

1. Files Changed
2. Why Changed
3. Fixed Issues
4. Remaining Critical Issues
5. Build Result
6. Validation Result
7. Objective Completion Matrix
8. Next Priority Task
9. GO / NO-GO

Keep the response concise.

Do not repeat information.

Summarize long results.

Report only verified outcomes.
==================================================
END OF OUTPUT COMPRESSION POLICY
==================================================
==================================================
DEMO & TRAINING MODE POLICY
==================================================

Whenever requested to demonstrate or explain the software:

Do NOT write code.

Do NOT modify existing code unless explicitly instructed.

Demonstrate the CURRENT implementation using the existing application.

If demo users already exist, reuse them.

If they do not exist, create only the minimum required demo accounts and clearly provide:

* Login URL
* User ID / Email
* Password
* Role
* Default Permissions

These demo credentials must remain usable until explicitly removed.

Demonstrate the complete workflow exactly as a real user would operate the software.

Support demonstrations for:

* Super Admin
* System Admin
* National Admin
* State Admin
* District Admin
* Branch Admin
* Organization Admin
* Member
* Public User

For every role demonstrate:

* Login
* Accessible Menus
* Available Buttons
* Complete Workflow
* Reports
* PDF Generation
* Print
* ID Card
* Certificate
* QR Verification
* Dashboard
* Permissions
* Logout

Show exactly:

* Which page opens
* Which action is performed
* What changes in the database
* Which dashboard counters change
* Which reports update
* Which documents are generated
* Which permissions are checked

If any feature is incomplete or unavailable:

* Explain why.
* Identify the exact blocking issue.
* Identify the exact file(s) requiring modification.

Return only:

1. Demo Login Credentials
2. Step-by-Step Demonstration
3. Missing Features
4. Bugs Found
5. Files Requiring Modification
6. Production Readiness
7. GO / NO-GO

==================================================
END OF DEMO & TRAINING MODE POLICY
==================================================
==================================================
==================================================
LIVE DEMO SYNCHRONIZATION & AUTOMATED DEMONSTRATION POLICY
==================================================

MISSION

Every business module shall maintain its own integrated Live Demo, Guided Training and Business Demonstration.

The Demo is a permanent part of the product.

Do NOT create a separate Demo project.

Every module shall always remain synchronized with the current implementation.

==================================================
AUTOMATIC DEMO SYNCHRONIZATION
==================================================

Whenever any feature is:

* Created
* Modified
* Fixed
* Improved
* Extended
* Refactored
* Optimized
* Validated
* Released

Automatically update:

* Demo Screens
* Demo Workflow
* Guided Tour
* Training Steps
* Help Content
* User Documentation
* Sample Data
* Sample Reports
* Sample Documents
* Sample PDF
* Sample Print
* Sample Certificate
* Sample ID Card
* Sample QR
* Demo Users
* Demo Credentials

Never allow Demo, Training or Documentation to become outdated.

==================================================
AUTOMATED LIVE DEMONSTRATION
==================================================

After every verified implementation automatically execute a complete Live Demonstration.

Use the software exactly as a real user.

Create reusable Demo Accounts if they do not already exist.

Provide reusable credentials including:

* Login URL
* User ID / Email
* Password
* Role

==================================================
ROLE-BASED DEMONSTRATION
==================================================

Demonstrate the module for every applicable role.

Including:

* Super Admin
* System Admin
* National Admin
* State Admin
* District Admin
* Branch Admin
* Organization Admin
* Member
* Public User

Verify every role can perform ONLY the actions permitted by RBAC.

==================================================
SUPER ADMIN BUSINESS DEMONSTRATION
==================================================

Log in as Super Admin.

Demonstrate the complete module exactly as a real Super Admin.

Verify:

* Dashboard
* User Management
* Create Admin
* Edit Admin
* Delete Admin
* Assign Roles
* Assign Permissions
* Membership Management
* Documents
* Certificates
* ID Cards
* QR Verification
* Reports
* Search
* Filters
* Export
* PDF
* Print
* Notifications
* Audit Logs
* Settings
* Logout

==================================================
OUTPUT VALIDATION
==================================================

Actually generate and verify:

* Certificates
* ID Cards
* QR Codes
* Reports
* PDF Files
* Print Preview
* Excel Export
* CSV Export
* Documents

Verify every generated output opens correctly and contains correct data.

==================================================
BUSINESS VALIDATION
==================================================

Verify the complete workflow.

Confirm:

* Records save correctly.
* Dashboard updates correctly.
* Reports update correctly.
* Audit Logs update correctly.
* Notifications work correctly.
* Permissions are enforced.
* Print works.
* PDF works.
* Export works.
* QR Verification works.
* Certificates generate correctly.
* ID Cards generate correctly.

If any Demo step fails:

* Identify the exact step.
* Identify the exact error.
* Identify the exact file(s).
* Fix ONLY the verified issue.
* Re-run ONLY the affected Demo.
* Continue until the Demo completes successfully.

==================================================
COMPLETION RULE
==================================================

No feature shall be marked COMPLETE until ALL of the following have passed:

✓ Implementation Complete
✓ Validation Complete
✓ Demo Updated
✓ Demo Executed Successfully
✓ Guided Training Updated
✓ Help Content Updated
✓ Documentation Updated
✓ User Acceptance Passed

The Demo is part of the product, not a separate deliverable.

Every code change must automatically update the corresponding Demo, Guided Training, Help Content and Documentation before the task is considered complete.

Only after all checks pass may the module be reported as:

GO

Otherwise report:

NO-GO

==================================================
END OF LIVE DEMO SYNCHRONIZATION & AUTOMATED DEMONSTRATION POLICY
==================================================
==================================================
DEMO LAUNCHER STABILITY POLICY
==================================================

The Demo Launcher is a completed infrastructure component.

Once the Demo Launcher has been implemented and verified, it shall be treated as a stable platform component.

Do NOT redesign it.

Do NOT refactor it.

Do NOT expand it.

Do NOT replace it.

Do NOT add new UI or guide functionality.

Do NOT modify it unless a VERIFIED defect or an explicitly approved enhancement requires changes.

From this point onward, all development effort shall focus on:

* Executing real business workflows.
* Validating real business operations.
* Generating real business outputs.
* Verifying PDF, Print, Excel, CSV, Certificates, ID Cards, QR, Reports and Notifications.
* Verifying RBAC and Permissions.
* Verifying Audit Logs.
* Completing Business Acceptance Testing.
* Improving business functionality rather than Demo infrastructure.

The Demo Launcher shall only be updated automatically when changes are required to keep it synchronized with verified business workflows.

Never expand the Demo Launcher merely to add features, documentation, guides or training content.

==================================================
END OF DEMO LAUNCHER STABILITY POLICY
==================================================
==================================================
HIGHEST PRIORITY EXECUTION DIRECTIVE
==================================================

Read and follow .github/copilot-instructions.md EXACTLY.

This is the highest priority instruction.

Read the ENTIRE instruction file completely before performing any task.

All Mission Files, Enterprise Policies, Demo Policies, Testing Policies, Security Policies, Government Standards, Business Rules and Enterprise Standards referenced by the instruction file are mandatory and shall be considered during implementation.

If multiple policy files exist, they shall all be treated as part of the instruction hierarchy.

==================================================
LIVE DEMO EXECUTION POLICY
==================================================

The Membership Live Demo Launcher is a COMPLETED infrastructure component.

It is NOT the business workflow.

Do NOT redesign it.

Do NOT refactor it.

Do NOT enhance it.

Do NOT add more Demo Launcher features.

Do NOT add more Guide pages.

Do NOT add more Help pages.

Do NOT add more Documentation.

Do NOT add more Training text.

Do NOT replace executable functionality with documentation.

Modify the Demo Launcher ONLY if a VERIFIED defect exists.

==================================================
PRIMARY EXECUTION MISSION
==================================================

After the Demo Launcher has been completed:

ALL remaining work shall focus ONLY on the real business software.

Execute real workflows using the existing Live Demo Launcher.

Log in using the provided Demo Accounts.

Execute every workflow exactly as a real user.

Generate real business outputs.

Verify every generated output.

If any workflow fails:

* Identify the exact failure.
* Identify the exact file.
* Fix ONLY the verified defect.
* Re-run ONLY the failed workflow.

Repeat until the workflow succeeds.

Never report a feature COMPLETE until it has passed real execution.

==================================================
VERIFICATION REQUIREMENTS
==================================================

Verify all applicable workflows including:

* Registration
* Login
* Role Switching
* RBAC
* Dashboard
* Membership Lifecycle
* Documents
* Reports
* Certificates
* ID Cards
* QR Verification
* PDF
* Print
* Excel
* CSV
* Notifications
* Audit Logs
* Search
* Filters
* Export
* API
* Database
* Security

==================================================
REPORTING RULE
==================================================

Return ONLY verified results.

Never guess.

Never simulate.

Never assume success.

Every reported PASS must come from actual execution.

Every reported FAIL must include:

* Exact workflow
* Exact error
* Exact file
* Exact reason

==================================================
END OF DIRECTIVE
==================================================