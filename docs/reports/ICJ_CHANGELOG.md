# ICJ ENTERPRISE PLATFORM — CHANGELOG
**Master Incremental System Log**

---

## [v2.1.0-PROD] — 2026-08-07

### 🚀 Added
- **Master Legal Consent Engine v1.0 (`ConsentService.js`, `MasterLegalConsent.jsx`):**
  - Replaced duplicate consent checkboxes with ONE unified Master Legal Consent checkbox.
  - Policy Viewer Modal displaying 8 comprehensive policy documents (Terms, Privacy, AI Processing, Document Verification, Refund & Financial, Data Protection, Code of Conduct, Arbitration & Jurisdiction).
  - DPDP Act 2023, IT Act 2000 Section 10A, and BSA 2023 Section 65B compliance.
  - Immutable consent records with SHA-256 digital consent hash signatures (`HASH-SHA256-...`), user ID, timestamp, IP address, device info, browser info, and policy version (`v1.0-2026`).
  - Fresh consent requirement upon policy version changes.
  - Automated verification test suite (`scripts/test_master_legal_consent.js`) passed **4 / 4 tests (100%)**.

---

## [v2.0.0-PROD] — 2026-08-07

### 🚀 Added
- **Master India Location Database & Legal Jurisdiction Engine v2.0 (`locationService.js`, `LocationSelector.jsx`, `LocationMasterAdmin.jsx`):**
  - Official Government of India Local Government Directory (LGD) dataset covering 36 States/UTs, LGD Districts, High Court Benches, eCourts District Courts & Police Stations.
  - Legal Jurisdiction Resolver (`resolveJurisdiction()`) auto-determining High Court Bench, District Court, and Police Station mapping.
