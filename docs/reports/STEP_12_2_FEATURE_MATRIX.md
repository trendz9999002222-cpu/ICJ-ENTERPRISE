# ICJ ENTERPRISE PLATFORM — STEP 12.2 FEATURE MATRIX
**Complete Governance Feature Matrix**

---

## MODULE CONTROL (Phase A) — 15 Modules

| Module ID | Name | Enabled | Visible | Locked | Maintenance |
|---|---|---|---|---|---|
| mod_dashboard | Super Admin Dashboard | ✅ | ✅ | ❌ | ❌ |
| mod_membership | Master Membership Engine | ✅ | ✅ | ❌ | ❌ |
| mod_legal | Master Legal Registry | ✅ | ✅ | ❌ | ❌ |
| mod_advocate | Enterprise Advocate Centre | ✅ | ✅ | ❌ | ❌ |
| mod_client | Client Command Portal | ✅ | ✅ | ❌ | ❌ |
| mod_calendar | Court Cause List Calendar | ✅ | ✅ | ❌ | ❌ |
| mod_ai_drafter | 16-Template AI Legal Drafter | ✅ | ✅ | ❌ | ❌ |
| mod_finance | Finance, Accounts & Wallet | ✅ | ✅ | ❌ | ❌ |
| mod_analytics | Reports & AI Analytics | ✅ | ✅ | ❌ | ❌ |
| mod_documents | Master Digital Vault | ✅ | ✅ | ❌ | ❌ |
| mod_notifications | Notification Centre | ✅ | ✅ | ❌ | ❌ |
| mod_administration | System Administration | ✅ | ✅ | ❌ | ❌ |
| mod_settings | Master Enterprise Settings | ✅ | ✅ | ❌ | ❌ |
| mod_database | PostgreSQL Database Engine | ✅ | ✅ | ❌ | ❌ |
| mod_governance | Enterprise Governance Center | ✅ | ✅ | ❌ | ❌ |

---

## ROLE PERMISSION MATRIX (Phase E) — 9 Roles × 12 Permissions

| Role | view | create | update | delete | export | print | approve | reject | ai | finance | documents | reports |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| super_admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| advocate | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| client | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| member | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| finance | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| auditor | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| guest | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| read_only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## FEATURE FLAGS (Phase F) — 15 Flags

| Flag ID | Label | Category | Default State |
|---|---|---|---|
| ff_ai | AI Legal Drafter | AI | 🟢 Enabled |
| ff_wallet | Digital Wallet | Finance | 🟢 Enabled |
| ff_finance | Finance & Accounts | Finance | 🟢 Enabled |
| ff_court_calendar | Court Calendar | Legal | 🟢 Enabled |
| ff_reports | Reports & Analytics | Analytics | 🟢 Enabled |
| ff_notifications | Notifications | Communication | 🟢 Enabled |
| ff_email | Email Gateway | Communication | 🟢 Enabled |
| ff_sms | SMS Gateway | Communication | 🔴 Disabled |
| ff_whatsapp | WhatsApp Gateway | Communication | 🔴 Disabled |
| ff_payment | Payment Gateway | Finance | 🟢 Enabled |
| ff_ocr | OCR Document Scan | AI | 🟢 Enabled |
| ff_digital_sign | Digital Signature | Legal | 🟢 Enabled |
| ff_api | Public API Access | Infrastructure | 🔴 Disabled |
| ff_search | Global Search | Core | 🟢 Enabled |
| ff_analytics | Business Analytics | Analytics | 🟢 Enabled |

---

## SECURITY CONTROLS (Phase H) — 9 Controls

| Control | Default | Configurable |
|---|---|---|
| Maintenance Mode | OFF | ✅ Yes |
| Read-Only Mode | OFF | ✅ Yes |
| Copy Restriction | OFF | ✅ Yes |
| Print Restriction | OFF | ✅ Yes |
| Export Restriction | OFF | ✅ Yes |
| Session Timeout | 60 min | ✅ Yes (5–480 min) |
| IP Restriction | OFF | ✅ Yes (Allowlist) |
| Allowed IPs | — | ✅ Yes |
| Device Restriction | OFF | ✅ Yes |
