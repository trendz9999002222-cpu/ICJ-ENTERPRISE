/**
 * ICJ ENTERPRISE PLATFORM — GLOBAL COUNTRY & PHONE VALIDATION SUITE
 * Tests authoritative Country Master, ITU-T E.164 phone validation rules,
 * India 10-digit rules, foreign country rules, and field consolidation.
 */

// Mock localStorage for Node.js execution
if (typeof localStorage === "undefined" || typeof window === "undefined") {
  const store = new Map();
  const mockStorage = {
    getItem: (key) => store.get(String(key)) || null,
    setItem: (key, val) => store.set(String(key), String(val)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
  };
  global.localStorage = mockStorage;
  global.window = { localStorage: mockStorage };
}

const { validatePhoneNumber, getCountryByCodeOrIso, ITU_GLOBAL_COUNTRY_MASTERS } = await import("../src/data/internationalPhoneMaster.js");

function runPhoneValidationTests() {
  console.log("=========================================================================");
  console.log("ICJ ENTERPRISE PLATFORM — GLOBAL COUNTRY & PHONE VALIDATION SUITE");
  console.log("=========================================================================");

  console.log(`\n1. Authoritative Country Master Status: Loaded ${ITU_GLOBAL_COUNTRY_MASTERS.length} Countries`);

  // Test 1: India (+91) Phone Rules
  console.log("\n2. Testing India (+91) Phone Validation Rules:");
  
  const inPass = validatePhoneNumber("+91", "9876543210");
  console.log(`- 9876543210 (10 digits) -> ${inPass.isValid ? "PASS" : "FAIL"} (${inPass.reason})`);
  if (!inPass.isValid) throw new Error("India 10 digits should pass");

  const inFailShort = validatePhoneNumber("+91", "987654321");
  console.log(`- 987654321 (9 digits)   -> ${!inFailShort.isValid ? "PASS (REJECTED)" : "FAIL"} (${inFailShort.reason})`);
  if (inFailShort.isValid) throw new Error("India 9 digits should fail");

  const inFailLong = validatePhoneNumber("+91", "98765432101");
  console.log(`- 98765432101 (11 digits)-> ${!inFailLong.isValid ? "PASS (REJECTED)" : "FAIL"} (${inFailLong.reason})`);
  if (inFailLong.isValid) throw new Error("India 11 digits should fail");

  const inFailAlpha = validatePhoneNumber("+91", "123456789A");
  console.log(`- 123456789A (Letters)   -> ${!inFailAlpha.isValid ? "PASS (REJECTED)" : "FAIL"} (${inFailAlpha.reason})`);
  if (inFailAlpha.isValid) throw new Error("India alpha characters should fail");

  // Test 2: Foreign Countries Phone Rules
  console.log("\n3. Testing Foreign Countries Phone Validation Rules:");

  // United States (+1)
  const usPass = validatePhoneNumber("+1", "2015550123");
  console.log(`- US (+1) 2015550123 (10 digits) -> ${usPass.isValid ? "PASS" : "FAIL"} (${usPass.reason})`);
  if (!usPass.isValid) throw new Error("US 10 digits should pass");

  const usFail = validatePhoneNumber("+1", "201555012");
  console.log(`- US (+1) 201555012 (9 digits)   -> ${!usFail.isValid ? "PASS (REJECTED)" : "FAIL"} (${usFail.reason})`);
  if (usFail.isValid) throw new Error("US 9 digits should fail");

  // United Kingdom (+44)
  const ukPass = validatePhoneNumber("+44", "7911123456");
  console.log(`- UK (+44) 7911123456 (10 digits)-> ${ukPass.isValid ? "PASS" : "FAIL"} (${ukPass.reason})`);
  if (!ukPass.isValid) throw new Error("UK 10 digits should pass");

  const ukFail = validatePhoneNumber("+44", "791112");
  console.log(`- UK (+44) 791112 (6 digits)     -> ${!ukFail.isValid ? "PASS (REJECTED)" : "FAIL"} (${ukFail.reason})`);
  if (ukFail.isValid) throw new Error("UK 6 digits should fail");

  // UAE (+971)
  const uaePass = validatePhoneNumber("+971", "501234567");
  console.log(`- UAE (+971) 501234567 (9 digits)-> ${uaePass.isValid ? "PASS" : "FAIL"} (${uaePass.reason})`);
  if (!uaePass.isValid) throw new Error("UAE 9 digits should pass");

  console.log("\n=========================================================================");
  console.log("GLOBAL COUNTRY & PHONE VALIDATION SUITE COMPLETE — ALL TESTS PASSED!");
  console.log("=========================================================================");
}

runPhoneValidationTests();
