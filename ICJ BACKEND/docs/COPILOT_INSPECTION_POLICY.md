# COPILOT INSPECTION POLICY

> [!IMPORTANT]
> **Single Source of Truth Reference**:
> This policy delegates all root principles, enterprise roles, and core invariants to the Master Policy: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md).
> Specialized policies must inherit from the Master Policy and never duplicate rules.

## Mandatory Policy Loading Order
1. **Root SSOT**: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md)
2. **Inspection Policy**: [`COPILOT_INSPECTION_POLICY.md`](COPILOT_INSPECTION_POLICY.md) (This Document)
3. **Development Policy**: [`COPILOT_DEVELOPMENT_POLICY.md`](COPILOT_DEVELOPMENT_POLICY.md)
4. **Security Policy**: [`COPILOT_SECURITY_POLICY.md`](COPILOT_SECURITY_POLICY.md)
5. **Testing Policy**: [`COPILOT_TESTING_POLICY.md`](COPILOT_TESTING_POLICY.md)
6. **Release Policy**: [`COPILOT_RELEASE_POLICY.md`](COPILOT_RELEASE_POLICY.md)

---

## 1. Audit-First Execution Sequence
AI agents must follow a mandatory sequence before taking any action:
1. **Search**: Search only exact symbols, functions, or components.
2. **Audit**: Read and inspect exact line ranges in authoritative files.
3. **Verify**: Verify existing implementation state against requirements.
4. **Patch**: Apply targeted modifications.
5. **Build & Test**: Run validation checks.

Never patch before verification. Never build before patching.

---

## 2. File Access & Quota Rules
- **Maximum Initial Files**: 2 files.
- **Maximum Total Files per Task**: 5 files.
- **Line View Limit**: Read only required functions/components. Never read complete files larger than 500 lines.
- **Re-Open Policy**: If a file was already verified, do not search for it again. Re-open it directly.

---

## 3. Log Extraction & Diagnostic Rules
- **Mandatory Log Inspection**: Never form a diagnostic hypothesis without reading the full, un-truncated error log.
- **Empirical Diagnostics**: Base error diagnoses strictly on empirical log evidence.
- **Log Retrieval Failure**: If a log extraction command fails, immediately switch to alternative log reading tools. Never diagnose blindly.

---

## 4. No-Guessing Rule
- Never guess code logic, schemas, or file paths.
- Inspect exact definitions from authoritative source code.
- If uncertain, read ONE additional required file only.
