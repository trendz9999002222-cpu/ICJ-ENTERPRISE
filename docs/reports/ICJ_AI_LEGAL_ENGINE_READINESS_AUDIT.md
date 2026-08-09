# ICJ Enterprise Platform — AI Legal Engine Readiness Audit Report

**Date:** August 8, 2026  
**Auditor:** Senior AI Enterprise Architect / CTO Suite  
**Scope:** Comprehensive Codebase & Architecture Audit of AI Legal, Document, and Case Intelligence Modules  
**Policy Standard:** ICJ Enterprise Master Policy (Single Source of Truth)  
**Audit Mode:** Non-destructive Inspection & Analysis  

---

## 1. Executive Summary

This audit evaluates the current implementation status of the **AI Legal Engine**, **Document Intelligence**, **Case Management**, and **Legal Research** capabilities within the ICJ Enterprise Platform.

The evaluation reveals a robust, well-architected client-side and service-level foundation:
- **Pluggable Vector RAG Engine**: Implemented in [`src/services/aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js) featuring 128-dimensional dense semantic embeddings, cosine similarity search, context-aware legal sentence chunking, source/page citation generators, and evidence guardrails.
- **Legal Ecosystem & Case Memory**: Implemented in [`src/services/legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js) and [`src/services/legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) supporting persistent case timelines, court order mergers, case filing, advocate assignment, and risk assessments.
- **AI Legal Drafting**: Fully functional UI and service in [`src/pages/LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx) with 16 legal document templates, variable substitution, digital verification tokens, and version history.
- **Finance & Credit Engine**: Fully functional payment, invoice, fee breakdown (`aiProcessingFee`, `documentAnalysisFee`), 18% GST calculation, and 70:30 advocate/trust revenue split engine in [`src/services/paymentBillingService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/paymentBillingService.js).

Key areas requiring production elevation include integrating a true Tesseract/Cloud OCR engine, connecting external Indian legal research databases (e.g. eCourts/Indian Kanoon APIs), and building a dedicated multi-step Partnership Agreement questionnaire workflow.

---

## 2. Feature-by-Feature Status Table

| # | Feature | Status | Existing Files/Components | Actual Capability | Missing Capability |
|---|---|---|---|---|---|
| 1 | **Document Upload** | `B. PARTIAL` | [`documentService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/documentService.js), [`Documents.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/Documents.jsx) | Handles single file upload (PDF/JPG/PNG) to base64 DataURL or Supabase Storage bucket `documents`. | Multi-file batch upload parser, automated MIME validation, server-side virus scanning. |
| 2 | **OCR / Text Extraction** | `D. MOCK / PLACEHOLDER` | [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js), [`LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx) | Text input area accepts manual text/OCR snippets; engine generates simulated chunk text. | Real OCR engine (Tesseract.js / Cloud Vision / Textract) for extracting text from scanned PDFs/images. |
| 3 | **Document Classification** | `C. FOUNDATION ONLY` | [`LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx), [`documentService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/documentService.js) | Dropdown select with 16 legal document types ("Legal Notice", "Writ Petition", "Affidavit", etc.). | Automated zero-shot or classifier model to infer document type from raw uploaded file content. |
| 4 | **Case Creation** | `A. COMPLETE` | [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js), [`Legal.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/Legal.jsx) | Full CRUD, unique Case ID generation (`CASE-2026-xxx`), client/advocate linkages, status tracking, persistent local storage. | None for client-side functionality. |
| 5 | **Document-to-Case Linking** | `B. PARTIAL` | [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js), [`profileService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/profileService.js) | Links document chunks to `caseId` in vector store and joins member documents by `owner`/`member_id`. | Foreign key relational schema UI for linking multi-file attachments directly to case records. |
| 6 | **Date Extraction** | `C. FOUNDATION ONLY` | [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js) | Case model contains `filingDate`, `nextHearing`, `createdAt`. Injects current date into generated drafts. | Automated NLP extraction of document dates, violation dates, or event dates from raw unstructured text. |
| 7 | **Chronology / Timeline** | `A. COMPLETE` | [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js) | Persistent case timeline store (`icj_case_timelines`), date-ordered events, automatic timeline logging on case actions. | None for timeline state management. |
| 8 | **Duplicate Detection** | `C. FOUNDATION ONLY` | [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js), [`paymentBillingService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/paymentBillingService.js) | Vector store checks exact text/page overlap; payment engine checks duplicate transactions within 10s. | Cryptographic file hashing (SHA256 of file buffer) and image perceptual hash comparison for uploaded files. |
| 9 | **Document Versioning** | `D. MOCK / PLACEHOLDER` | [`LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx) | Displays version ledger table (`v1.0`, `v1.1`, `v2.0`), SHA-256 draft hashes, and rollback action buttons. | Real document content diffing, git-style version storage, and active draft rollback execution. |
| 10 | **Master Case File / Case Memory** | `B. PARTIAL` | [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js), [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) | Ingests documents into `icj_master_vector_kb` / `icj_production_vector_store` and merges court orders into case memory. | Scalable PostgreSQL `pgvector` backend integration (currently runs via browser localStorage / memory store). |
| 11 | **Fact Extraction** | `D. MOCK / PLACEHOLDER` | [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js), [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) | Methods exist returning summary, legal provisions, and risk analysis strings. | Real Named Entity Recognition (NER) pipeline for extracting parties, addresses, amounts, and clauses. |
| 12 | **Contradiction Detection** | `E. NOT FOUND` | None | No implementation found. | Automated comparison engine to detect conflicting dates, mismatched names, or monetary discrepancies across documents. |
| 13 | **Missing Document Detection** | `B. PARTIAL` | [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js), [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) | Keyword-based detection for missing mandatory documents ("aadhaar", "id", "agreement", "contract", "affidavit"). | Deep semantic audit comparing required filing checklists against uploaded case file contents. |
| 14 | **AI Review / Human Verification** | `B. PARTIAL` | [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js), [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js) | Trust approval status tracking (`Approved`, `Under Review`), confidence scoring, and advocate disclaimers. | Dedicated advocate verification interface for inline line-by-line paragraph correction and signature sign-off. |
| 15 | **Legal Research** | `D. MOCK / PLACEHOLDER` | [`Research.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/Research.jsx), [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) | Displays hardcoded landmark Indian case laws (e.g. *Maneka Gandhi v. UOI*, *M.C. Mehta v. UOI*) and constitutional articles. | Live integration with eCourts, Indian Kanoon API, or statutory gazette search databases. |
| 16 | **RAG / Embeddings** | `A. COMPLETE` | [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js) | Pluggable embedding architecture (`DenseSemanticEmbeddingProvider`, `OpenAIEmbeddingProvider`), cosine similarity search, chunking, citations. | None for client-side vector search capability. |
| 17 | **AI Model Integration** | `B. PARTIAL` | [`aiService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiService.js), [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js), [`apiKeyVault.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/apiKeyVault.js) | API integration callers configured for OpenAI (`api.openai.com`), Supabase Edge Function (`ai-assistant`), and custom `VITE_AI_API_URL`. | Production deployment of remote AI endpoints (currently falls back to client-side dense algorithms when API keys are unconfigured). |
| 18 | **AI Cost Optimization** | `B. PARTIAL` | [`aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js), [`legalIntelligenceEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalIntelligenceEngine.js) | Local vector store chunk caching, text hashing deduplication prior to vector insertion. | Dynamic LLM model tier routing (e.g. GPT-4o vs Flash-lite) based on prompt complexity or token cost budget. |
| 19 | **Payment / Credit / Subscription Logic** | `A. COMPLETE` | [`paymentBillingService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/paymentBillingService.js), [`walletService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/walletService.js), [`tokenService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/tokenService.js) | Itemized fee breakdown (`aiProcessingFee`, `documentAnalysisFee`), 18% GST calculation, UPI QR generation, 70:30 advocate/trust revenue split, token balances. | None for financial ledger and bill generation. |
| 20 | **Legal Draft Generation** | `A. COMPLETE` | [`LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx), [`legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js) | 16 legal document templates, variable substitution, digital verification tokens, SHA-256 signatures, toolbar copy/download actions. | None for template rendering. |
| 21 | **Partnership / Agreement Workflow** | `C. FOUNDATION ONLY` | [`LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx) | "Agreement / MOU" option exists in 16 document templates dropdown. | Dedicated multi-step wizard form for capturing partner personal details, business objectives, capital contributions, profit sharing ratios, and custom covenants. |
| 22 | **Audit Trail** | `A. COMPLETE` | [`activityService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/activityService.js), [`ActivityLog.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/ActivityLog.jsx) | Centralized activity logging service persisting events to `icj_activity_events` in localStorage for AI runs, drafts, payments, and document syncs. | None for event audit tracking. |

---

## 3. Existing AI Architecture

The system features a clean, modular AI architecture centered around [`src/services/aiCoreEngine.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/aiCoreEngine.js):
- **Pluggable Embedding Providers**: `BaseEmbeddingProvider` abstract class extended by `DenseSemanticEmbeddingProvider` (128-dim normalized L2-norm vectors via text n-gram hashing) and `OpenAIEmbeddingProvider` (`text-embedding-3-small`).
- **Pluggable Vector Store**: `BaseVectorStore` abstract class extended by `IndexedVectorStore` (persistent browser `localStorage` + in-memory store with Cosine Similarity vector matching).
- **Semantic Legal Chunker**: `SemanticLegalChunker` splits documents into target chunks (400 chars) while preserving paragraph and legal sentence boundaries with context overlap (50 chars).
- **Hybrid RAG Retrieval Engine**: `RAGRetrievalEngine` combines dense vector similarity with lexical term matching to return top-$K$ passages with mandatory source citations (`[Source: Document Name, Page N]`).
- **AI Evidence Guardrails**: `AIEvidenceGuardrails` verifies that AI answers are grounded strictly in retrieved passages and attaches confidence scores.

---

## 4. Existing Document Intelligence Architecture

- **Storage & Upload**: Managed by [`src/services/documentService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/documentService.js). Files are converted to base64 DataURLs or uploaded to Supabase Storage bucket `documents`.
- **Chunking & Indexing**: Handled by `CaseMemoryEngine.ingestDocumentIntoCaseMemory()` in `aiCoreEngine.js`, segmenting text page-by-page and chunk-by-chunk into the vector store.
- **Missing Document Rules**: `LegalEcosystemService.analyzeCaseDocuments()` scans text for key legal document markers (`aadhaar`, `agreement`, `affidavit`) and flags missing required filings.

---

## 5. Existing Case Intelligence Architecture

- **Case Management**: Implemented in [`src/services/legalEcosystemService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/legalEcosystemService.js). Handles full case state, case number assignment (`CASE-2026-xxx`), client/advocate linkages, and court details.
- **Timelines & Hearings**: Case actions append events to `icj_case_timelines`. Hearing schedules are tracked in `icj_court_hearings` and automatically update case `nextHearing` dates.
- **Court Order Merger**: `LegalIntelligenceEngine.mergeCourtOrder()` prepends new court order chunks into the master vector knowledge base and creates timeline events.

---

## 6. Existing Legal Research Architecture

- **Local Knowledge Precedents**: Static precedent citations (e.g. *Maneka Gandhi v. UOI*, *M.C. Mehta v. UOI*) and constitutional provisions (Article 14, Article 21, CPC Order XXXIX) embedded in `legalIntelligenceEngine.js` and `LegalDrafter.jsx`.
- **Analytics & Research Dashboard**: Implemented in [`src/pages/Research.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/Research.jsx), providing real-time data analytics on member growth, geographical distribution (cities/states), and KYC verification completeness.

---

## 7. Existing Payment/Credit Architecture

- **Multi-Gateway Billing & Taxes**: Implemented in [`src/services/paymentBillingService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/paymentBillingService.js). Computes itemized fee breakdowns including `aiProcessingFee` and `documentAnalysisFee`, applies promo codes (`ICJEARLY10`, `LEGAL20`), calculates 18% GST, and generates dynamic BHIM UPI QR codes.
- **Revenue Sharing & Ledger**: Automatically calculates the 70% Advocate Pool vs 30% ICJ Trust split, deducts 10% TDS under Section 194J, and tracks payment status (`Paid`, `Partial`, `Unpaid`).
- **Wallets & Tokens**: Managed via [`walletService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/walletService.js) and [`tokenService.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/tokenService.js), maintaining user balances and transaction ledgers.

---

## 8. Existing Partnership/Legal Workflow Architecture

- **Document Drafting Templates**: [`src/pages/LegalDrafter.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/pages/LegalDrafter.jsx) includes an "Agreement / MOU" option within its 16 legal document template dropdown.
- **Universal Action Toolbar**: [`src/components/common/UniversalActionToolbar.jsx`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/components/common/UniversalActionToolbar.jsx) provides standardized document toolbar actions (Copy, Download, Print, Share, Version Badge).

---

## 9. AI Models/APIs Actually Configured

1. **Client-Side Dense Semantic Model**: Implemented in `DenseSemanticEmbeddingProvider` (`aiCoreEngine.js`). Generates 128-dimensional normalized dense vectors without external network calls.
2. **OpenAI Embedding API**: Configured in `OpenAIEmbeddingProvider` (`aiCoreEngine.js`) calling `https://api.openai.com/v1/embeddings` (`text-embedding-3-small`).
3. **Supabase Edge Function**: Configured in `AIService.js` (`ai-assistant` function call via `@supabase/supabase-js`).
4. **Custom HTTP AI Endpoint**: Configured in `AIService.js` driven by `VITE_AI_API_URL` environment variable.
5. **API Key Vault**: Managed by [`src/services/apiKeyVault.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/apiKeyVault.js) tracking status (`configured`, `partial`, `not_configured`) for AI, storage, payment, and messaging providers.

---

## 10. Database/Storage Components Relevant to AI Legal Engine

- **Browser Storage Keys** (`localStorage`):
  - `icj_master_vector_kb` / `icj_production_vector_store`: Stores chunked vectors and case memory.
  - `icj_legal_cases_v2`: Stores case metadata and client/advocate linkages.
  - `icj_case_timelines`: Stores date-ordered case events.
  - `icj_advocates`: Stores empaneled advocate records.
  - `icj_enterprise_invoices` & `icj_enterprise_transactions`: Stores billing and payment records.
  - `icj_activity_events`: Stores audit trail events.
  - `icj_infra_api_key_vault`: Stores masked API keys and service configurations.
- **Supabase PostgreSQL / Storage**:
  - `documents` storage bucket for uploaded file binaries.
  - `members`, `legal_cases`, `documents`, `wallets`, `tokens`, `system_settings` tables in database provider [`database.js`](file:///c:/Users/Pawan/OneDrive/Desktop/ICJ%20DEVELOPMENT/ICJ%20BACKEND/ICJ%20BACKEND/src/services/database.js).

---

## 11. Major Gaps

1. **Scanned PDF / Image OCR**: Lack of client-side or server-side OCR engine (e.g. Tesseract.js / AWS Textract) to convert scanned images/PDFs into plain text before vector chunking.
2. **Automated Fact & Contradiction Extraction**: Missing an NLP pipeline to extract structured entity pairs (Party A vs Party B, Amounts, Dates) and detect contradictions across case documents.
3. **Live Legal Research Integration**: Lack of live API integration with external Indian legal research providers (e.g. Indian Kanoon or eCourts APIs).
4. **Partnership Agreement Questionnaire Wizard**: Missing a dedicated multi-step form to collect partner details, capital contributions, profit sharing ratios, and custom agreement clauses.

---

## 12. Existing Components That Can Be Reused

- `AICoreEngine` (`aiCoreEngine.js`): Reusable RAG pipeline, dense embedding generator, cosine vector store, chunker, and citation engine.
- `LegalEcosystemService` (`legalEcosystemService.js`): Reusable case CRUD, timeline engine, advocate assignment, and draft generation helper.
- `PaymentBillingService` (`paymentBillingService.js`): Reusable invoice generator, tax calculator, UPI QR generator, and 70:30 revenue sharing logic.
- `LegalDrafter` (`LegalDrafter.jsx`): Reusable 16-template legal drafter UI, version control ledger table, and Universal Toolbar.
- `APIKeyVault` (`apiKeyVault.js`): Reusable key encryption/masking vault for managing external AI and cloud provider credentials.

---

## 13. Components That Should NOT Be Rebuilt

- **DO NOT rebuild the RAG / Vector Search Engine**: `aiCoreEngine.js` already provides a complete modular vector store, chunking engine, and cosine similarity search.
- **DO NOT rebuild Case Management & Timelines**: `legalEcosystemService.js` already manages cases, client/advocate links, and timelines.
- **DO NOT rebuild Payment & GST Billing**: `paymentBillingService.js` already handles itemized fees (`aiProcessingFee`), GST, UPI QR codes, and 70:30 advocate splits.
- **DO NOT rebuild Legal Draft UI Layout**: `LegalDrafter.jsx` already contains a 16-template selection engine and version ledger.

---

## 14. Recommended Development Sequence

1. **Step 1: Real OCR Integration**: Wire up Tesseract.js or Cloud Vision into `documentService.js` and `LegalDrafter.jsx` tab 1 to extract text from uploaded scanned PDF/image files.
2. **Step 2: Partnership & Agreement Questionnaire Engine**: Build a dedicated multi-step form wizard for partnership agreements, populating the existing "Agreement / MOU" draft generator.
3. **Step 3: Fact Extraction & Contradiction Inspector**: Implement a client-side NLP parser to extract entities (Names, Dates, Amounts) from chunked text and highlight contradictions.
4. **Step 4: Real Document Diffing & Version Rollback**: Connect the existing version ledger table in `LegalDrafter.jsx` to an active content history rollback state.

---

## 15. Risks / Security Concerns

- **Local Storage Limitations**: Browser `localStorage` holds vector chunks and case data. Large 1,000+ page documents may exceed browser storage quotas (typically ~5MB-10MB).
- **Client-Side API Key Exposure**: External AI keys (e.g. OpenAI) should be routed through server endpoints (`VITE_AI_API_URL` or Supabase Edge Functions) rather than exposed in client environment variables.
- **Legal Compliance Disclaimers**: All AI-generated legal drafts and assessments must maintain explicit disclaimers requiring mandatory advocate verification before court filing.

---

## 16. Build/Test Status

- **Code Validation**: `npm run build` executed successfully without errors (Vite built 11,814 modules in 3.26s).
- **Zero Breakage**: No source code, database schemas, or dependencies were altered during this audit.

---

## 17. Conclusion

### What Already Exists
- Full RAG retrieval engine with dense semantic embeddings, cosine similarity search, chunking, and mandatory citations (`aiCoreEngine.js`).
- Complete case CRUD, Case ID generator, client/advocate linkages, court order mergers, and timeline tracking (`legalEcosystemService.js`).
- Functional AI Legal Drafter UI supporting 16 legal document templates, digital verification hashes, and version history (`LegalDrafter.jsx`).
- Full payment billing engine with `aiProcessingFee`, 18% GST calculation, UPI QR generation, and 70:30 advocate revenue split (`paymentBillingService.js`).
- Event audit logging service (`activityService.js`).

### What Is Partially Implemented
- Document upload (supports single PDF/JPG/PNG file upload to base64 or Supabase Storage, but lacks batch parsing).
- Document classification (supports manual 16-template dropdown selection, but lacks automated zero-shot AI classifier).
- Missing document detection (uses keyword search for missing mandatory filings).
- AI model provider integration (API callers exist for OpenAI and Supabase Edge Functions, but fallback to local dense algorithms when keys are unconfigured).

### What Is Missing
- Real OCR text extraction engine for scanned image/PDF files.
- Fact extraction & contradiction detection across multiple case documents.
- Live integration with external legal research databases (eCourts / Indian Kanoon).
- Dedicated multi-step Partnership Agreement questionnaire form.
- Document diffing & real version rollback execution.

### What Should Be Built Next
1. **Real OCR Engine** for scanned documents.
2. **Partnership Agreement Questionnaire Wizard**.
3. **Fact & Contradiction Detection Engine**.
