# COPILOT DEVELOPMENT POLICY

> [!IMPORTANT]
> **Single Source of Truth Reference**:
> This policy delegates all root principles, enterprise roles, and core invariants to the Master Policy: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md).
> Specialized policies must inherit from the Master Policy and never duplicate rules.

## Mandatory Policy Loading Order
1. **Root SSOT**: [`COPILOT_MASTER_POLICY.md`](COPILOT_MASTER_POLICY.md)
2. **Inspection Policy**: [`COPILOT_INSPECTION_POLICY.md`](COPILOT_INSPECTION_POLICY.md)
3. **Development Policy**: [`COPILOT_DEVELOPMENT_POLICY.md`](COPILOT_DEVELOPMENT_POLICY.md) (This Document)
4. **Security Policy**: [`COPILOT_SECURITY_POLICY.md`](COPILOT_SECURITY_POLICY.md)
5. **Testing Policy**: [`COPILOT_TESTING_POLICY.md`](COPILOT_TESTING_POLICY.md)
6. **Release Policy**: [`COPILOT_RELEASE_POLICY.md`](COPILOT_RELEASE_POLICY.md)

---

## 1. Zero-Redesign & Reusability Mandate
- **No Redesign**: Never redesign completed architecture or rewrite stable modules.
- **No Duplication**: Never create duplicate components, forms, services, routes, or APIs.
- **Master Membership Form**: Standardize data schemas across views using shared master forms.
- **Reusability Enforcement**: Always reuse existing services, hooks, utilities, and components.

---

## 2. Patch & Editing Rules
- **Targeted Edits**: Modify the minimum possible lines and files. Use targeted replacement blocks.
- **Preserve Context**: Preserve all existing comments, docstrings, and surrounding formatting.
- **Single-Pass Edits**: Make targeted replacements in a single turn without whole-file rewrites.

---

## 3. Backward Compatibility & Control Flow
- **API Contracts**: Maintain strict parameter signatures and API contracts across invocations.
- **Control Flow Scoping**: Whenever modifying conditional logic or loops, evaluate against all execution paths.
- **Dynamic Layout**: Calculate dynamic container bounds instead of using arbitrary fixed offsets.
