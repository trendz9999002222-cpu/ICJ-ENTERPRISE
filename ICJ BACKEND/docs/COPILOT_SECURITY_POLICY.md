# COPILOT SECURITY POLICY

> [!IMPORTANT]
> **Single Source of Truth Reference**:
> This policy delegates all root principles, enterprise roles, and core invariants to the Master Policy: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md).
> Specialized policies must inherit from the Master Policy and never duplicate rules.

## Mandatory Policy Loading Order
1. **Root SSOT**: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md)
2. **Inspection Policy**: [`COPILOT_INSPECTION_POLICY.md`](COPILOT_INSPECTION_POLICY.md)
3. **Development Policy**: [`COPILOT_DEVELOPMENT_POLICY.md`](COPILOT_DEVELOPMENT_POLICY.md)
4. **Security Policy**: [`COPILOT_SECURITY_POLICY.md`](COPILOT_SECURITY_POLICY.md) (This Document)
5. **Testing Policy**: [`COPILOT_TESTING_POLICY.md`](COPILOT_TESTING_POLICY.md)
6. **Release Policy**: [`COPILOT_RELEASE_POLICY.md`](COPILOT_RELEASE_POLICY.md)

---

## 1. Backend-First Permission Enforcement
- **Service Validation**: Enforce role and permission checks in backend service logic (`memberService`, `financeService`, `legalService`, etc.).
- **UI Defense**: Frontend permission checks alone are NOT sufficient. Never rely solely on hidden UI buttons.
- **Action-Level Checks**: Call permission validation helpers prior to performing data mutations.

---

## 2. Authority Lock Hierarchy
- **Strict Hierarchy Order**:
  `Super Admin > National Admin > State Admin > District Admin > City Admin > Branch Admin > Member > Public Visitor`
- **Override Lock**: Lower authority roles must NEVER modify, approve, reject, suspend, reactivate, or override decisions made by a higher authority.

---

## 3. Data Protection & Masking
- **Sensitive Field Protection**: Enforce format validation, masking, and restricted access for sensitive KYC data (Aadhaar / PAN).
- **Session & Device Security**: Enforce active session tracking and trusted device revocation workflows.
- **Audit Event Stream**: Log decision maker ID, role, timestamp, IP, device, and payload for all sensitive actions.
