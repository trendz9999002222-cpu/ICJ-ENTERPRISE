# COPILOT TESTING POLICY

> [!IMPORTANT]
> **Single Source of Truth Reference**:
> This policy delegates all root principles, enterprise roles, and core invariants to the Master Policy: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md).
> Specialized policies must inherit from the Master Policy and never duplicate rules.

## Mandatory Policy Loading Order
1. **Root SSOT**: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md)
2. **Inspection Policy**: [`COPILOT_INSPECTION_POLICY.md`](COPILOT_INSPECTION_POLICY.md)
3. **Development Policy**: [`COPILOT_DEVELOPMENT_POLICY.md`](COPILOT_DEVELOPMENT_POLICY.md)
4. **Security Policy**: [`COPILOT_SECURITY_POLICY.md`](COPILOT_SECURITY_POLICY.md)
5. **Testing Policy**: [`COPILOT_TESTING_POLICY.md`](COPILOT_TESTING_POLICY.md) (This Document)
6. **Release Policy**: [`COPILOT_RELEASE_POLICY.md`](COPILOT_RELEASE_POLICY.md)

---

## 1. Concrete Verification Mandate
- **Run Verification Commands**: Never declare success without running build/test validation (`npm run lint`, `npm run build`, `validate.bat`).
- **No Superficial Patches**: Never swallow exceptions, return dummy fallbacks, comment out broken assertions, or delete failing tests.

---

## 2. Test Data Minimality
- **Minimal Test Records**: Create only 1 or 2 test members/records during testing.
- **Data Reuse**: Reuse existing test data records whenever possible.
- **Cleanup**: Do not clutter database state with unnecessary test payloads.

---

## 3. Log Extraction & Retry Analysis
- **Empirical Diagnostics**: Base diagnostic conclusions strictly on full error tracebacks.
- **Command Failures**: Acknowledge command failures explicitly. Analyze root cause before retrying commands with duplicate arguments.
