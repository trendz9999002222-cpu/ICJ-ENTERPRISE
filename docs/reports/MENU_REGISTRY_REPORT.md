# Menu Registry Audit Report
**ICJ Enterprise Platform — Sidebar & Navigation Audit**
**Date:** August 7, 2026

---

## 1. Menu Control Overview

The menu navigation architecture is controlled dynamically via `MenuControl` in `src/services/governanceEngine.js` with persistence key `icj_gov_menu_config`.

- **Total Configured Menu Items:** 15
- **Location:** `sidebar`
- **Default Visibility:** 100% Visible (`visible: true`)
- **Default Enabled State:** 100% Enabled (`enabled: true`)

---

## 2. Menu Item Inventory (`DEFAULT_MENU_CONFIG`)

| # | Menu Item ID | Label | Icon | Location | Target Route | Allowed Roles | Visible | Enabled | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `menu_dashboard` | Dashboard | `Dashboard` | `sidebar` | `/` | `["admin"]` | `true` | `true` | ✅ **Active** |
| 2 | `menu_membership` | Membership | `Group` | `sidebar` | `/membership` | `["admin", "employee"]` | `true` | `true` | ✅ **Active** |
| 3 | `menu_legal` | Legal Registry | `Gavel` | `sidebar` | `/legal` | `["admin", "employee"]` | `true` | `true` | ✅ **Active** |
| 4 | `menu_advocate` | Advocate Centre | `AccountBalance` | `sidebar` | `/advocate-dashboard` | `["admin", "employee"]` | `true` | `true` | ✅ **Active** |
| 5 | `menu_client` | Client Portal | `Person` | `sidebar` | `/client-portal` | `["admin", "member", "client"]` | `true` | `true` | ✅ **Active** |
| 6 | `menu_calendar` | Court Calendar | `CalendarMonth` | `sidebar` | `/court-calendar` | `["admin", "employee", "member"]` | `true` | `true` | ✅ **Active** |
| 7 | `menu_ai_drafter` | AI Legal Drafter | `AutoAwesome` | `sidebar` | `/ai-drafter` | `["admin", "employee", "member"]` | `true` | `true` | ✅ **Active** |
| 8 | `menu_finance` | Finance & Wallet | `AccountBalance` | `sidebar` | `/wallet`, `/finance` | `["admin", "employee"]` | `true` | `true` | ✅ **Active** |
| 9 | `menu_reports` | Reports | `BarChart` | `sidebar` | `/reports` | `["admin", "employee"]` | `true` | `true` | ✅ **Active** |
| 10 | `menu_documents` | Document Vault | `Folder` | `sidebar` | `/documents` | `["admin", "employee", "member"]` | `true` | `true` | ✅ **Active** |
| 11 | `menu_notifications` | Notifications | `Notifications` | `sidebar` | `/notifications` | `["admin", "employee", "member", "client"]` | `true` | `true` | ✅ **Active** |
| 12 | `menu_settings` | Settings | `Settings` | `sidebar` | `/settings` | `["admin"]` | `true` | `true` | ✅ **Active** |
| 13 | `menu_administration` | Administration | `ManageAccounts` | `sidebar` | `/administration` | `["admin"]` | `true` | `true` | ✅ **Active** |
| 14 | `menu_governance` | Governance Center | `Security` | `sidebar` | `/governance-center` | `["admin"]` | `true` | `true` | ✅ **Active** |
| 15 | `menu_database` | Database Engine | `Storage` | `sidebar` | `/database-config` | `["admin"]` | `true` | `true` | ✅ **Active** |

---

## 3. Discrepancy & Root Cause Analysis

1. **Missing API Config Menu Entry**:
   - `MASTER_ENTERPRISE_CATALOG` in `governanceRegistry.js` has 16 items (including `mod_api_config`).
   - `DEFAULT_MENU_CONFIG` in `governanceEngine.js` has only 15 menu items and lacks `menu_api_config` (`/api-config`).
   - *Impact:* The `/api-config` route is registered in the router and governance catalog, but does not automatically appear in default sidebar navigation unless dynamically added.

2. **Role Filter Boundary**:
   - 6 menus (`menu_dashboard`, `menu_settings`, `menu_administration`, `menu_governance`, `menu_database`, and `mod_api_config`) are strictly restricted to `["admin"]`. Non-admin accounts will hide these menu items automatically via `MenuControl`.

---

*Report generated automatically during Emergency Module Recovery Audit.*
