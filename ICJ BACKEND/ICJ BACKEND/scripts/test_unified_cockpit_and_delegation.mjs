// ICJ ENTERPRISE — UNIFIED COMMAND COCKPIT & SAFE DELEGATION TEST
import { SafeDelegationGuardService, PERMISSION_SCOPES } from "../src/services/safeDelegationGuardService.js";
import fs from "fs";

console.log("==========================================================================");
console.log("🛡️ ICJ ENTERPRISE — UNIFIED COMMAND COCKPIT & SAFE DELEGATION AUDIT");
console.log("==========================================================================\n");

// TEST 1: Safe Delegation Sandbox Guardrail
console.log("--- 1. TESTING SAFE ROLE DELEGATION GUARDRAIL ---");

const maliciousAttempt = {
  delegateId: "26ADM08AA0007",
  delegateName: "ICJ Operations Officer",
  delegateEmail: "officer@icj.org",
  assignedRoleTitle: "Junior Operations Assistant",
  requestedScopes: [
    "SCOPE_MEMBER_VERIFY",
    "SCOPE_ROOT_DATABASE_RESET", // DESTRUCTIVE! Must be blocked!
    "SCOPE_FINANCIAL_DISBURSEMENT", // DESTRUCTIVE! Must be blocked!
    "SCOPE_SUPPORT_TICKETS",
  ],
};

const result = SafeDelegationGuardService.createDelegation(maliciousAttempt);

console.log(`✓ Requested Scopes Count: ${maliciousAttempt.requestedScopes.length}`);
console.log(`✓ Granted Safe Scopes Count: ${result.delegation.grantedScopes.length}`);
console.log(`✓ Blocked Destructive Root Scopes Count: ${result.strippedDestructiveScopesCount}`);
console.log(`✓ Final Granted Scopes: [${result.delegation.grantedScopes.join(", ")}]`);

if (result.delegation.grantedScopes.includes("SCOPE_ROOT_DATABASE_RESET") || result.delegation.grantedScopes.includes("SCOPE_FINANCIAL_DISBURSEMENT")) {
  console.error("❌ SECURITY FAILURE: Destructive root powers were accidentally delegated!");
  process.exit(1);
} else {
  console.log("✅ PASS: Destructive root powers were 100% BLOCKED & STRIPPED!");
}

// TEST 2: Verify Module F10 in Codebook Directory File
console.log("\n--- 2. VERIFYING MODULE F10 IN MASTER CODEBOOK ---");
const codebookContent = fs.readFileSync("./src/components/admin/ModuleCodeDirectoryConsole.jsx", "utf-8");

if (codebookContent.includes('code: "F10"') && codebookContent.includes('route: "/system-command-cockpit"')) {
  console.log('✓ Found Module F10 in Codebook: [F10] "सुप्रीम यूनिफाइड कमान्ड, वॉचडॉग व सेफ डेलिगेशन कॉकपिट" -> Route: /system-command-cockpit');
  console.log("✅ PASS: Module F10 is officially registered in Master Codebook!");
} else {
  console.error("❌ ERROR: Module F10 missing in Codebook!");
  process.exit(1);
}

console.log("\n==========================================================================");
console.log("✅ ALL UNIFIED COCKPIT & SAFE DELEGATION TESTS PASSED 100%!");
console.log("==========================================================================");
