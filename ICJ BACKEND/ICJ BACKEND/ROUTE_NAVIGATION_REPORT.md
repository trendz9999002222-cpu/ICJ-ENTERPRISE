# Route Navigation Report
**ICJ Enterprise Platform — Route Reachability & Navigation Mapping**
**Date:** August 7, 2026

---

## 1. Reachability Overview

- **Total Registered App Routes:** 45
- **Direct Sidebar Routes:** 16
- **Sub-feature & Auxiliary Routes:** 26 (Directly linked from module dashboards, vault tables, or member navigation)
- **Public Entry Routes:** 3 (`/login`, `/register`, `/recovery`)
- **Unreachable Routes:** 0

---

## 2. Route Navigation Mapping

| Route Path | Associated Page Component | Primary Navigation Path | Auth Level | Reachability Status |
|---|---|---|---|---|
| `/login` | `Login.jsx` | Root landing / Redirect | Public | ✅ **Reachable** |
| `/register` | `Register.jsx` | Auth portal link | Public | ✅ **Reachable** |
| `/recovery` | `Recovery.jsx` | Auth portal link | Public | ✅ **Reachable** |
| `/` | `SuperAdminDashboard.jsx` | Sidebar -> `Dashboard` | Protected | ✅ **Reachable** |
| `/super-admin-dashboard` | `SuperAdminDashboard.jsx` | Sidebar -> `Dashboard` | Protected (`admin`) | ✅ **Reachable** |
| `/membership` | `Membership.jsx` | Sidebar -> `Membership` | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-registration` | `MemberRegistration.jsx` | Membership Dashboard button | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-directory` | `MemberDirectory.jsx` | Membership Dashboard button | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-verification` | `MemberVerification.jsx` | Membership Dashboard button | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-documents` | `MemberDocuments.jsx` | Vault / Member Navigation | Protected | ✅ **Reachable** |
| `/member-wallet` | `MemberWallet.jsx` | Member Navigation | Protected | ✅ **Reachable** |
| `/member-kyc` | `MemberKYC.jsx` | Membership / KYC action | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-identity` | `MemberIdentity.jsx` | Member Navigation | Protected | ✅ **Reachable** |
| `/member-certificates` | `MemberCertificates.jsx` | Membership / Certificates action | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-history` | `MemberHistory.jsx` | Member Profile action | Protected | ✅ **Reachable** |
| `/member-activity` | `MemberActivity.jsx` | Member Profile action | Protected | ✅ **Reachable** |
| `/member-settings` | `MemberSettings.jsx` | Member Navigation | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/member-card` | `MemberCard.jsx` | Member Navigation | Protected | ✅ **Reachable** |
| `/identity` | `MemberIdentity.jsx` | Member Navigation alias | Protected | ✅ **Reachable** |
| `/documents` | `Documents.jsx` | Sidebar -> `Document Vault` | Protected | ✅ **Reachable** |
| `/wallet` | `Wallet.jsx` | Sidebar -> `Finance & Wallet` | Protected | ✅ **Reachable** |
| `/token` | `Token.jsx` | Wallet / Finance tab | Protected | ✅ **Reachable** |
| `/donation` | `Donations.jsx` | Wallet / Finance tab | Protected | ✅ **Reachable** |
| `/settings` | `Settings.jsx` | Sidebar -> `Settings` | Protected (`admin`) | ✅ **Reachable** |
| `/activity-log` | `ActivityLog.jsx` | Settings / Admin tab | Protected | ✅ **Reachable** |
| `/transactions` | `Transactions.jsx` | Wallet / Finance tab | Protected | ✅ **Reachable** |
| `/member-profile` | `MemberProfile.jsx` | Topbar Profile Menu | Protected | ✅ **Reachable** |
| `/notifications` | `Notifications.jsx` | Sidebar -> `Notifications` | Protected | ✅ **Reachable** |
| `/reports` | `Reports.jsx` | Sidebar -> `Reports` | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/legal` | `Legal.jsx` | Sidebar -> `Legal Registry` | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/ai` | `AIAssistant.jsx` | Topbar AI Quick Action | Protected | ✅ **Reachable** |
| `/research` | `Research.jsx` | Legal Registry tab | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/administration` | `Administration.jsx` | Sidebar -> `Administration` | Protected (`admin`) | ✅ **Reachable** |
| `/finance` | `Wallet.jsx` | Sidebar -> `Finance & Wallet` (alias) | Protected | ✅ **Reachable** |
| `/advocate-dashboard` | `AdvocateDashboard.jsx` | Sidebar -> `Advocate Centre` | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/client-portal` | `ClientPortal.jsx` | Sidebar -> `Client Portal` | Protected | ✅ **Reachable** |
| `/trust-dashboard` | `TrustDashboard.jsx` | Administration / Trust action | Protected (`admin`) | ✅ **Reachable** |
| `/court-calendar` | `CourtCalendar.jsx` | Sidebar -> `Court Calendar` | Protected | ✅ **Reachable** |
| `/billing` | `BillingInvoicing.jsx` | Finance / Billing action | Protected (`admin`,`employee`) | ✅ **Reachable** |
| `/ai-drafter` | `LegalDrafter.jsx` | Sidebar -> `AI Legal Drafter` | Protected | ✅ **Reachable** |
| `/payment-management` | `PaymentManagement.jsx` | Finance / Payment action | Protected | ✅ **Reachable** |
| `/location-master` | `LocationMasterAdmin.jsx` | Administration / Location action | Protected (`admin`) | ✅ **Reachable** |
| `/database-config` | `DatabaseConfig.jsx` | Sidebar -> `Database Engine` | Protected (`admin`) | ✅ **Reachable** |
| `/governance-center` | `GovernanceCenter.jsx` | Sidebar -> `Governance Center` | Protected (`admin`) | ✅ **Reachable** |
| `/api-config` | `APIConfigCenter.jsx` | Sidebar -> `API Configuration` | Protected (`admin`) | ✅ **Reachable** |

---

## 3. Navigation Audit Conclusion

- All 45 registered routes in `AppRouter` are 100% reachable via Sidebar navigation or direct quick action links in the Topbar/Dashboards.
- 0 broken links or dangling routes detected.

---

*Report generated automatically following Route Navigation Reachability Audit.*
