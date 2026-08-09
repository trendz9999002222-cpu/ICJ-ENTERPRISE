# ICJ Enterprise Platform - TODO Master List

Date: 2026-07-30
Source: Enterprise blueprint generation output + current workspace audit baseline
Scope: Non-code implementation planning report

## Summary

- Total TODOs: 18
- Objective: Convert blueprint action items into an execution-ready backlog with order, priority, dependencies, and phased rollout.

## Master TODO Inventory

### TODO 01
- TODO Number: 01
- Title: Identity Recovery Workflows
- Implementation Status: Completed (2026-07-30)
- Description: Implement end-to-end forgot-password, forgot-user-id, and account recovery flows with audited events and secure token lifecycle.
- Priority: Critical
- Related Module: Authentication
- Files involved:
  - src/pages/Login.jsx
  - src/services/authService.js
  - src/services/auditLogService.js
  - src/router/index.jsx
  - supabase/migrations/20260730170000_upgrade_auth_registration_user_foundation.sql
- Estimated Effort: 8-12 engineering days
- Dependencies: None
- Recommended Order of Implementation: 1

### TODO 02
- TODO Number: 02
- Title: Anti-Abuse Security Controls
- Implementation Status: Completed (2026-07-30)
- Description: Add registration/login throttling, brute-force lockout, and adaptive risk scoring hooks at auth boundaries.
- Priority: Critical
- Related Module: Security
- Files involved:
  - src/services/authService.js
  - src/services/auth/registrationValidation.js
  - src/config/auth.config.js
  - src/services/auditLogService.js
  - src/pages/Administration.jsx
  - .env.example
  - docs/security/anti-abuse-security-controls.md
  - supabase/migrations/20260730223000_add_anti_abuse_security_controls.sql
  - supabase/migrations/20260730100000_enable_rls_and_policies.sql
- Estimated Effort: 7-10 engineering days
- Dependencies:
  - TODO 01
- Recommended Order of Implementation: 2

### TODO 03
- TODO Number: 03
- Title: Session Inventory and Global Revoke
- Implementation Status: Completed (2026-07-30)
- Description: Create enterprise session inventory with administrator visibility and revoke controls for active sessions.
- Priority: High
- Related Module: Session Management
- Files involved:
  - src/contexts/AuthContext.jsx
  - src/services/authService.js
  - src/services/supabase.js
  - src/pages/Administration.jsx
  - src/pages/Profile.jsx
  - src/core/permissions.js
  - src/config/auth.config.js
  - src/services/auditLogService.js
  - .env.example
  - supabase/migrations/20260730230000_add_session_inventory_and_global_revoke.sql
  - TODO_03_IMPLEMENTATION_REPORT.md
  - docs/runbooks/session-inventory-global-revoke.md
- Estimated Effort: 6-9 engineering days
- Dependencies:
  - TODO 01
  - TODO 02
- Recommended Order of Implementation: 3

### TODO 04
- TODO Number: 04
- Title: Device Registry and Trusted Device Revocation
- Implementation Status: Completed (2026-07-30)
- Description: Implement trusted-device inventory, trust status lifecycle, and remote logout per device.
- Priority: High
- Related Module: Device Management
- Files involved:
  - src/services/authService.js
  - src/services/auditLogService.js
  - src/pages/Profile.jsx
  - src/pages/Administration.jsx
  - src/contexts/AuthContext.jsx
  - src/core/permissions.js
  - src/config/auth.config.js
  - .env.example
  - supabase/migrations/20260730233000_add_device_registry_and_trusted_revocation.sql
  - docs/runbooks/trusted-device-registry-revocation.md
  - TODO_04_IMPLEMENTATION_REPORT.md
- Estimated Effort: 8-11 engineering days
- Dependencies:
  - TODO 03
- Recommended Order of Implementation: 4

### TODO 05
- TODO Number: 05
- Title: Action-Level Permission Enforcement
- Description: Enforce permissions uniformly for module actions in service methods and sensitive UI operations.
- Priority: Critical
- Related Module: Role and Permission
- Files involved:
  - src/core/permissions.js
  - src/core/rbac.js
  - src/services/memberService.js
  - src/services/financeService.js
  - src/services/legalService.js
  - src/services/documentService.js
  - src/services/tokenService.js
- Estimated Effort: 10-14 engineering days
- Dependencies:
  - TODO 01
  - TODO 02
- Recommended Order of Implementation: 5

### TODO 06
- TODO Number: 06
- Title: DB-Backed Role Assignment Workflow
- Description: Complete user role assignment and change workflow on role tables with approval and audit trail.
- Priority: High
- Related Module: Role Management
- Files involved:
  - src/services/adminService.js
  - src/core/roles.js
  - src/pages/Administration.jsx
  - supabase/migrations/20260730143000_create_role_permission_foundation.sql
- Estimated Effort: 7-10 engineering days
- Dependencies:
  - TODO 05
- Recommended Order of Implementation: 6

### TODO 07
- TODO Number: 07
- Title: Versioned API Layer and OpenAPI Contracts
- Description: Introduce backend API contract model (v1) and formal OpenAPI specifications for core domains.
- Priority: Critical
- Related Module: API Architecture
- Files involved:
  - src/services/supabase.js
  - src/services/authService.js
  - src/services/memberService.js
  - src/services/financeService.js
  - src/services/legalService.js
  - src/services/documentService.js
  - vite.config.js
- Estimated Effort: 15-25 engineering days
- Dependencies:
  - TODO 01
  - TODO 02
  - TODO 05
- Recommended Order of Implementation: 7

### TODO 08
- TODO Number: 08
- Title: API Gateway Security and Abuse Controls
- Description: Add API gateway-level rate limiting, request validation, abuse detection, and policy enforcement.
- Priority: High
- Related Module: Security/API
- Files involved:
  - DEPLOYMENT_CHECKLIST.md
  - vite.config.js
  - src/config/auth.config.js
- Estimated Effort: 8-12 engineering days
- Dependencies:
  - TODO 07
- Recommended Order of Implementation: 8

### TODO 09
- TODO Number: 09
- Title: OTP Provider Productionization
- Description: Replace OTP placeholders with provider adapters, secure OTP state machine, retries, and observability.
- Priority: High
- Related Module: OTP Framework
- Files involved:
  - src/services/auth/otpService.js
  - src/services/authService.js
  - src/config/auth.config.js
  - supabase/migrations/20260730170000_upgrade_auth_registration_user_foundation.sql
- Estimated Effort: 8-12 engineering days
- Dependencies:
  - TODO 01
  - TODO 02
  - TODO 07
- Recommended Order of Implementation: 9

### TODO 10
- TODO Number: 10
- Title: Notification Provider Adapters and Delivery Workers
- Description: Implement SMS/Email/WhatsApp delivery workers, provider adapters, retry policy, and queue observability.
- Priority: High
- Related Module: Notification Framework
- Files involved:
  - src/services/notificationService.js
  - src/services/notificationFoundationService.js
  - src/pages/Notifications.jsx
  - supabase/migrations/20260730170000_upgrade_auth_registration_user_foundation.sql
- Estimated Effort: 9-13 engineering days
- Dependencies:
  - TODO 07
  - TODO 09
- Recommended Order of Implementation: 10

### TODO 11
- TODO Number: 11
- Title: Aadhaar/PAN Validation, Masking, and Restricted Access
- Description: Add strict format validation, masking policy, controlled visibility, and encryption strategy for sensitive fields.
- Priority: Critical
- Related Module: KYC and Compliance
- Files involved:
  - src/pages/Membership.jsx
  - src/pages/MemberKYC.jsx
  - src/services/memberService.js
  - src/services/database.js
  - supabase/migrations/20260730090000_create_core_module_tables.sql
- Estimated Effort: 8-11 engineering days
- Dependencies:
  - TODO 05
  - TODO 07
- Recommended Order of Implementation: 11

### TODO 12
- TODO Number: 12
- Title: KYC Verifier Workflow and Decision Engine
- Description: Implement KYC workflow states, verifier role actions, and approval/rejection decision audit logic.
- Priority: High
- Related Module: Membership/KYC
- Files involved:
  - src/pages/MemberKYC.jsx
  - src/pages/MemberVerification.jsx
  - src/services/memberService.js
  - src/services/auditLogService.js
- Estimated Effort: 7-10 engineering days
- Dependencies:
  - TODO 06
  - TODO 11
- Recommended Order of Implementation: 12

### TODO 13
- TODO Number: 13
- Title: Document Retention and Legal Hold Lifecycle
- Description: Add retention classes, legal hold flags, and archival lifecycle controls for managed documents.
- Priority: High
- Related Module: Document Management
- Files involved:
  - src/pages/Documents.jsx
  - src/services/documentService.js
  - supabase/migrations/20260730130000_create_document_management_tables.sql
  - supabase/migrations/20260730130100_enable_rls_for_document_management.sql
- Estimated Effort: 8-12 engineering days
- Dependencies:
  - TODO 07
  - TODO 11
- Recommended Order of Implementation: 13

### TODO 14
- TODO Number: 14
- Title: Wallet and Finance Transaction Hardening
- Description: Add idempotency, reconciliation jobs, maker-checker approvals, and exception handling for finance flows.
- Priority: High
- Related Module: Wallet/Finance
- Files involved:
  - src/services/walletService.js
  - src/services/financeService.js
  - src/services/donationService.js
  - src/pages/Finance.jsx
  - src/pages/Wallet.jsx
- Estimated Effort: 10-14 engineering days
- Dependencies:
  - TODO 05
  - TODO 07
- Recommended Order of Implementation: 14

### TODO 15
- TODO Number: 15
- Title: Unified Enterprise Audit Event Bus and Query UX
- Description: Build centralized cross-module audit event stream and analytics-oriented query interface.
- Priority: High
- Related Module: Audit Architecture
- Files involved:
  - src/services/auditLogService.js
  - src/services/authService.js
  - src/services/documentService.js
  - src/pages/Administration.jsx
  - src/pages/ActivityLog.jsx
- Estimated Effort: 10-15 engineering days
- Dependencies:
  - TODO 05
  - TODO 07
  - TODO 10
- Recommended Order of Implementation: 15

### TODO 16
- TODO Number: 16
- Title: Database FK Hardening and Integrity Alignment
- Description: Strengthen foreign-key rigor and relationship consistency across extension tables and cross-module references.
- Priority: Medium
- Related Module: Database Architecture
- Files involved:
  - supabase/migrations/20260730090000_create_core_module_tables.sql
  - supabase/migrations/20260730113000_create_token_management_tables.sql
  - supabase/migrations/20260730121500_create_legal_management_tables.sql
  - supabase/migrations/20260730130000_create_document_management_tables.sql
- Estimated Effort: 6-9 engineering days
- Dependencies:
  - TODO 07
- Recommended Order of Implementation: 16

### TODO 17
- TODO Number: 17
- Title: Migration Smoke Tests and Rollback Validation in CI
- Description: Introduce migration verification, rollback checks, and schema drift gates in CI/CD quality pipeline.
- Priority: Medium
- Related Module: Deployment and Quality Engineering
- Files involved:
  - DEPLOYMENT_CHECKLIST.md
  - package.json
  - supabase/migrations/20240101000000_create_profiles_table.sql
  - supabase/migrations/20260730170000_upgrade_auth_registration_user_foundation.sql
- Estimated Effort: 5-8 engineering days
- Dependencies:
  - TODO 16
- Recommended Order of Implementation: 17

### TODO 18
- TODO Number: 18
- Title: AI Production Connector with Governance Guardrails
- Description: Add production-ready external AI connector with policy filters, DLP guardrails, and strict per-module authorization.
- Priority: Medium
- Related Module: AI Architecture
- Files involved:
  - src/pages/AIAssistant.jsx
  - src/services/aiService.js
  - src/services/ai/aiApiAdapter.js
  - src/services/ai/aiApiPlaceholder.js
- Estimated Effort: 7-10 engineering days
- Dependencies:
  - TODO 07
  - TODO 15
- Recommended Order of Implementation: 18

## Recommended Phasing

### Phase 1 TODOs (Platform Risk and Identity Stabilization)
- TODO 01: Identity Recovery Workflows
- TODO 02: Anti-Abuse Security Controls
- TODO 03: Session Inventory and Global Revoke
- TODO 04: Device Registry and Trusted Device Revocation
- TODO 05: Action-Level Permission Enforcement
- TODO 06: DB-Backed Role Assignment Workflow
- TODO 07: Versioned API Layer and OpenAPI Contracts

### Phase 2 TODOs (Compliance, Channels, and Operations)
- TODO 08: API Gateway Security and Abuse Controls
- TODO 09: OTP Provider Productionization
- TODO 10: Notification Provider Adapters and Delivery Workers
- TODO 11: Aadhaar/PAN Validation, Masking, and Restricted Access
- TODO 12: KYC Verifier Workflow and Decision Engine
- TODO 13: Document Retention and Legal Hold Lifecycle

### Phase 3 TODOs (Enterprise Maturity and Scale Hardening)
- TODO 14: Wallet and Finance Transaction Hardening
- TODO 15: Unified Enterprise Audit Event Bus and Query UX
- TODO 16: Database FK Hardening and Integrity Alignment
- TODO 17: Migration Smoke Tests and Rollback Validation in CI
- TODO 18: AI Production Connector with Governance Guardrails

## Execution Notes

- Recommended implementation order should be followed unless compliance/regulatory deadlines force reprioritization.
- Security, identity, and authorization controls should not be postponed behind feature expansion work.
- Channel enablement (OTP, outbound notification, AI external provider) should remain policy-gated until governance sign-off.
