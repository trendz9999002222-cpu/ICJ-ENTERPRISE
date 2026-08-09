# COPILOT RELEASE POLICY

> [!IMPORTANT]
> **Single Source of Truth Reference**:
> This policy delegates all root principles, enterprise roles, and core invariants to the Master Policy: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md).
> Specialized policies must inherit from the Master Policy and never duplicate rules.

## Mandatory Policy Loading Order
1. **Root SSOT**: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md)
2. **Inspection Policy**: [`COPILOT_INSPECTION_POLICY.md`](COPILOT_INSPECTION_POLICY.md)
3. **Development Policy**: [`COPILOT_DEVELOPMENT_POLICY.md`](COPILOT_DEVELOPMENT_POLICY.md)
4. **Security Policy**: [`COPILOT_SECURITY_POLICY.md`](COPILOT_SECURITY_POLICY.md)
5. **Testing Policy**: [`COPILOT_TESTING_POLICY.md`](COPILOT_TESTING_POLICY.md)
6. **Release Policy**: [`COPILOT_RELEASE_POLICY.md`](COPILOT_RELEASE_POLICY.md) (This Document)

---

## 1. Branch Management Rules
- **Dedicated Policy Branch**: Work on dedicated feature/policy branches (e.g. `ai-policy-system`).
- **No Application Code Mutation**: Do not alter underlying application code when conducting policy system maintenance.

---

## 2. Release & Audit Reporting
- **File Impact Reporting**: Report exact modified files with relative paths upon task completion.
- **Verification Logs**: Attach empirical build & test output logs to release summaries.
- **Deployment Checklist Verification**: Validate changes against [`../DEPLOYMENT_CHECKLIST.md`](../DEPLOYMENT_CHECKLIST.md) prior to merging.
