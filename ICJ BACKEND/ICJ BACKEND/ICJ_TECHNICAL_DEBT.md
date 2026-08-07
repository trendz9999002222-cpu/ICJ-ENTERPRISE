# ICJ ENTERPRISE PLATFORM — TECHNICAL DEBT LOG

**Current Technical Debt Score:** **Low (3.5 / 100)**

---

## 🔍 Logged Technical Items

1. **Cloud AI Edge Function Deployment (Optional Optimization):**
   - **Item:** `supabase/functions/ai-assistant` deployment to cloud runtime.
   - **Current Fallback:** Active in-app fallback (`aiService.js`) and `DenseSemanticEmbeddingProvider` (128-dim L2).
   - **Impact:** Minimal (Local offline AI engine fully functional).

2. **Scanned Binary PDF Native Parser (`pdfjs-dist`):**
   - **Item:** Client-side binary PDF page extraction.
   - **Current Fallback:** `SemanticLegalChunker` context-aware text slicer.
   - **Impact:** Low.

3. **External Cloud Communications Gateway Keys (SendGrid / Twilio):**
   - **Item:** Live SMS/Email gateway keys (`VITE_SENDGRID_API_KEY`).
   - **Current Fallback:** In-app notification & activity trail engine.
   - **Impact:** Low.
