# Hidden Modules Report
**ICJ Enterprise Platform — Hidden Modules & Role Boundary Audit**
**Date:** August 7, 2026

---

## 1. Executive Summary

This report identifies all modules and features that are hidden from specific user roles or disabled by system feature flags.

- **System-Wide Hidden Modules (`visible: false`):** 0
- **System-Wide Disabled Modules (`featureFlag: "Disabled"`):** 0
- **Disabled Gateways (via Feature Flags):** 3 (`ff_sms`, `ff_whatsapp`, `ff_api`)
- **Role-Based Hidden Modules:** Varies by active user role (`admin`, `employee`, `member`, `client`, `guest`).

---

## 2. Role-Based Module Visibility Breakdown

### A. Admin Role (`admin`)
- **Expected Modules:** 16
- **Visible Modules:** 16
- **Hidden Modules:** 0
- **Reason for Hidden:** N/A (Super Admin has full access to all 16 modules).

---

### B. Employee Role (`employee`)
- **Expected Modules:** 16
- **Visible Modules:** 8 (`mod_membership`, `mod_legal`, `mod_advocate`, `mod_calendar`, `mod_ai_drafter`, `mod_finance`, `mod_analytics`, `mod_documents`, `mod_notifications`)
- **Hidden Modules:** 7 (`mod_dashboard`, `mod_client`, `mod_settings`, `mod_administration`, `mod_governance`, `mod_database`, `mod_api_config`)
- **Reason for Hidden:**
  1. `mod_dashboard`: Super Admin system control panel restricted to `admin`.
  2. `mod_client`: Client command portal intended for member/client roles.
  3. `mod_settings`, `mod_administration`, `mod_governance`, `mod_database`, `mod_api_config`: Core infrastructure & administrative security tools restricted to `admin` role in `RoleControl` / `MenuControl`.

---

### C. Member Role (`member`)
- **Expected Modules:** 16
- **Visible Modules:** 5 (`mod_client`, `mod_calendar`, `mod_ai_drafter`, `mod_documents`, `mod_notifications`)
- **Hidden Modules:** 11 (`mod_dashboard`, `mod_membership`, `mod_legal`, `mod_advocate`, `mod_finance`, `mod_analytics`, `mod_settings`, `mod_administration`, `mod_governance`, `mod_database`, `mod_api_config`)
- **Reason for Hidden:** Operational and staff management tools restricted to `admin` and `employee` roles.

---

### D. Client Role (`client`)
- **Expected Modules:** 16
- **Visible Modules:** 2 (`mod_client`, `mod_notifications`)
- **Hidden Modules:** 14 (All staff & member operations)
- **Reason for Hidden:** Restricted client view scope.

---

## 3. Feature Flag Boundary Impact

| Feature Flag ID | Feature Name | Status | Impact on Navigation | Reason for Disabled State |
|---|---|---|---|---|
| `ff_sms` | SMS Gateway | ⛔ Disabled | Disables outbound SMS OTP configuration in UI | Awaiting SMS Provider API keys in `.env` |
| `ff_whatsapp` | WhatsApp Gateway | ⛔ Disabled | Disables Meta WhatsApp API config | Awaiting WhatsApp Business credentials in `.env` |
| `ff_api` | Public API Access | ⛔ Disabled | Disables external unauthenticated public REST endpoints | Security boundary until production deployment |

---

*Report generated automatically during Enterprise Sidebar Visibility Audit.*
