# Sidebar Visibility Report
**ICJ Enterprise Platform — Enterprise Sidebar Visibility Audit**
**Date:** August 7, 2026

---

## 1. Executive Summary

An audit of sidebar navigation, module visibility, role permissions, and feature flag linkages was performed across the ICJ Enterprise Platform.

- **Total Registered Modules:** 16
- **Total Sidebar Menu Items:** 16
- **Default Visible Menu Items (Admin):** 16 (100% Visibility)
- **Explicitly Hidden Modules (`visible: false`):** 0
- **Disabled Feature Flags:** 3 (`ff_sms`, `ff_whatsapp`, `ff_api`)
- **Missing Navigation Links:** 0 (100% of routes reachable via primary sidebar or child module links)

---

## 2. Master Sidebar Inventory & Order

| Order | Menu ID | Module Name | Target Route | Icon | Roles Allowed | Admin Visible | Employee Visible | Member Visible | Client Visible |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `menu_dashboard` | Super Admin Dashboard | `/` | `Dashboard` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| 2 | `menu_membership` | Master Membership Engine | `/membership` | `Group` | `admin`, `employee` | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden |
| 3 | `menu_legal` | Master Legal Registry | `/legal` | `Gavel` | `admin`, `employee` | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden |
| 4 | `menu_advocate` | Enterprise Advocate Centre | `/advocate-dashboard` | `AccountBalance` | `admin`, `employee` | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden |
| 5 | `menu_client` | Client Command Portal | `/client-portal` | `Person` | `admin`, `member`, `client` | ✅ Visible | ❌ Hidden | ✅ Visible | ✅ Visible |
| 6 | `menu_calendar` | Court Cause List Calendar | `/court-calendar` | `CalendarMonth` | `admin`, `employee`, `member` | ✅ Visible | ✅ Visible | ✅ Visible | ❌ Hidden |
| 7 | `menu_ai_drafter` | 16-Template AI Legal Drafter | `/ai-drafter` | `AutoAwesome` | `admin`, `employee`, `member` | ✅ Visible | ✅ Visible | ✅ Visible | ❌ Hidden |
| 8 | `menu_finance` | Finance, Accounts & Wallet | `/wallet` | `AccountBalance` | `admin`, `employee` | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden |
| 9 | `menu_reports` | Reports & AI Analytics | `/reports` | `BarChart` | `admin`, `employee` | ✅ Visible | ✅ Visible | ❌ Hidden | ❌ Hidden |
| 10 | `menu_documents` | Master Digital Vault | `/documents` | `Folder` | `admin`, `employee`, `member` | ✅ Visible | ✅ Visible | ✅ Visible | ❌ Hidden |
| 11 | `menu_notifications` | Notification Centre | `/notifications` | `Notifications` | `admin`, `employee`, `member`, `client` | ✅ Visible | ✅ Visible | ✅ Visible | ✅ Visible |
| 12 | `menu_settings` | Master Enterprise Settings | `/settings` | `Settings` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| 13 | `menu_administration` | System Administration | `/administration` | `ManageAccounts` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| 14 | `menu_governance` | Enterprise Governance Center | `/governance-center` | `Security` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| 15 | `menu_database` | PostgreSQL Database Engine | `/database-config` | `Storage` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |
| 16 | `menu_api_config` | Enterprise API Configuration Center | `/api-config` | `SettingsInputAntenna` | `admin` | ✅ Visible | ❌ Hidden | ❌ Hidden | ❌ Hidden |

---

## 3. Dashboard Cards & Quick Action Inventory

- **Total Default Dashboard Cards:** 10 (`card_members`, `card_advocates`, `card_cases`, `card_hearings`, `card_revenue`, `card_documents`, `card_wallet`, `card_pending`, `card_online`, `card_ai`).
- **Dashboard Card Visibility:** 100% Enabled (`visible: true`).

---

*Report generated automatically during Enterprise Sidebar Visibility Audit.*
