/**
 * ICJ ENTERPRISE PLATFORM — OTP & COMMUNICATION SECURITY FRAMEWORK
 * ES Modules Automated Test Suite
 */
import OTPSecurity from "../src/services/otp/otpSecurity.js";
import OTPRateLimiter from "../src/services/otp/otpRateLimiter.js";
import OTPAuditService from "../src/services/otp/otpAuditService.js";
import OTPProviderRegistry from "../src/services/otp/otpProviderRegistry.js";
import OTPService from "../src/services/otp/otpService.js";

console.log("=== RUNNING ENTERPRISE OTP SECURITY TEST SUITE ===");

const testLogs = [];
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    testLogs.push({ name: message, status: "FAIL" });
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
    testLogs.push({ name: message, status: "PASS" });
  }
}

// Mock browser localStorage for node test runner
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
  };
}

// 1. OTP Code Generation & Hashing
const code1 = OTPSecurity.generateOTPCode();
assert(code1.length === 6 && !isNaN(Number(code1)), "OTP must be exactly 6-digits and numeric");

const hash1 = OTPSecurity.hashOTP(code1);
const hash2 = OTPSecurity.hashOTP(code1);
assert(hash1 === hash2, "OTP hashing must be deterministic");
assert(hash1.startsWith("SHA256-"), "OTP hash must use SHA-256 standard encoding prefix");

// 2. Mock mode & fallback provider simulation
localStorage.setItem("icj_otp_mode", "mock");

const registryResult = await OTPProviderRegistry.sendThroughChannel("sms", "9876543210", code1);
assert(registryResult.success, "Mock mode delivery must succeed");
assert(registryResult.providerUsed === "2factor", "Primary provider must be 2factor by default");

// 3. Expiry and Verification
const user = "testuser@icj.org";
const requestResult = await OTPService.requestOTP(user, "email");
assert(requestResult.success, "OTP request processed successfully in mock mode");

const activeOtp = OTPService.getTestOTP(user);
assert(activeOtp !== null && activeOtp.length === 6, "Controlled test hook retrieves the active mock code");

const verifyResult = await OTPService.verifyOTP(user, activeOtp);
assert(verifyResult.success, "OTP verification succeeds with mock bypass code");

// Replay / Reused check (OTP should be deleted immediately after success)
const verifyReused = await OTPService.verifyOTP(user, activeOtp);
assert(!verifyReused.success, "Reused OTP must be immediately blocked (replay prevention)");

// 4. Expiry Simulation
const shortPolicy = { expirySeconds: -10 }; // Already expired
await OTPService.requestOTP("expired@icj.org", "email", shortPolicy);
const expiredOtp = OTPService.getTestOTP("expired@icj.org");
const verifyExpired = await OTPService.verifyOTP("expired@icj.org", expiredOtp);
assert(!verifyExpired.success, "Expired OTP verification must fail");

// 5. Wrong OTP and Max attempts
const bruteUser = "brute@icj.org";
await OTPService.requestOTP(bruteUser, "email", { maxAttempts: 3 });
const bruteOtp = OTPService.getTestOTP(bruteUser);

const bad1 = await OTPService.verifyOTP(bruteUser, "000000");
assert(!bad1.success, "Invalid OTP attempt fails");
const bad2 = await OTPService.verifyOTP(bruteUser, "000000");
const bad3 = await OTPService.verifyOTP(bruteUser, "000000");
assert(!bad3.success, "Third wrong attempt fails");

const bad4 = await OTPService.verifyOTP(bruteUser, bruteOtp);
assert(!bad4.success, "Fourth attempt with correct code is blocked because verification records were cleared after max attempts");

// 6. Lockout & Rate limiting cooldown
const rateUser = "cooldown@icj.org";
const r1 = await OTPService.requestOTP(rateUser, "email", { cooldownSeconds: 60 });
assert(r1.success, "First OTP request allowed");

const r2 = await OTPService.requestOTP(rateUser, "email", { cooldownSeconds: 60 });
assert(!r2.success && r2.message.includes("wait"), "Consecutive OTP request within cooldown is blocked");

// 7. Audit log verification
const logs = OTPAuditService.getLogs();
assert(logs.length > 0, "Audit trail records events");
assert(!JSON.stringify(logs).includes(activeOtp), "Plaintext OTP must never appear in audit logs");

console.log("=== ALL OTP SECURITY TESTS COMPLETED SUCCESSFULLY ===");
process.exit(0);
