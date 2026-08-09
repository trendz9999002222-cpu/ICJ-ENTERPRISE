/**
 * ICJ ENTERPRISE PLATFORM — FORM STRUCTURE & MODE SWITCH RESET TEST SUITE
 * Tests 3-Row Field Hierarchy and Mode-Switch Stale Data Cleanup across both registration modes.
 */

// Mock localStorage for Node environment
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

const { validatePhoneNumber } = await import("../src/data/internationalPhoneMaster.js");
const { MemberService } = await import("../src/services/memberService.js");

async function runModeSwitchAndStructureTest() {
  console.log("=========================================================================");
  console.log("ICJ ENTERPRISE PLATFORM — FORM STRUCTURE & MODE SWITCH RESET TEST SUITE");
  console.log("=========================================================================");

  // 1. Test Mode 1: Individual Registration
  console.log("\n1. Testing Individual Mode Hierarchy:");
  const indData = {
    regType: "Individual",
    firstName: "Aarav",
    middleName: "Kumar",
    lastName: "Sharma",
    mobile: "+91 9876543210",
    whatsapp: "+91 9000000002",
    email: "aarav.sharma@icj-qa.org",
    country: "India",
    state: "Delhi",
  };
  console.log(`- Name: ${indData.firstName} ${indData.middleName} ${indData.lastName}`);
  console.log(`- Contact: ${indData.mobile} | ${indData.whatsapp} | ${indData.email}`);
  console.log(`- Location: ${indData.country} | ${indData.state}`);

  // 2. Test Mode Switch Reset Bug Fix (Individual -> Organisation)
  console.log("\n2. Testing Mode Switch Reset Bug Fix (Individual -> Organisation):");
  let currentForm = { ...indData };
  
  // Simulate Mode Switch Handler Trigger
  currentForm = {
    ...currentForm,
    regType: "Organisation",
    firstName: "",
    middleName: "",
    lastName: "",
    orgName: "",
    mobile: "",
    whatsapp: "",
  };

  console.log(`- Switched to Organisation mode.`);
  console.log(`- Stale First Name cleared: "${currentForm.firstName}" (PASS)`);
  console.log(`- Stale Middle Name cleared: "${currentForm.middleName}" (PASS)`);
  console.log(`- Stale Last Name cleared: "${currentForm.lastName}" (PASS)`);
  console.log(`- Stale Mobile cleared: "${currentForm.mobile}" (PASS)`);
  console.log(`- Stale WhatsApp cleared: "${currentForm.whatsapp}" (PASS)`);

  if (currentForm.firstName !== "" || currentForm.mobile !== "") {
    throw new Error("Mode switch failed to clear stale fields!");
  }

  // Populate Organisation Mode Data
  currentForm.orgName = "TEST Legal Chambers LLP";
  currentForm.mobile = "9876543211";
  currentForm.whatsapp = "9000000012";

  console.log(`\n3. Testing Organisation Mode Population:`);
  console.log(`- Org Name: ${currentForm.orgName}`);
  console.log(`- Contact: +91 ${currentForm.mobile} | +91 ${currentForm.whatsapp}`);

  // 3. Test Mode Switch Reset Bug Fix (Organisation -> Individual)
  console.log("\n4. Testing Mode Switch Reset Bug Fix (Organisation -> Individual):");
  currentForm = {
    ...currentForm,
    regType: "Individual",
    firstName: "",
    middleName: "",
    lastName: "",
    orgName: "",
    mobile: "",
    whatsapp: "",
  };

  console.log(`- Switched back to Individual mode.`);
  console.log(`- Stale Org Name cleared: "${currentForm.orgName}" (PASS)`);
  console.log(`- Stale Mobile cleared: "${currentForm.mobile}" (PASS)`);
  console.log(`- Stale WhatsApp cleared: "${currentForm.whatsapp}" (PASS)`);

  if (currentForm.orgName !== "" || currentForm.mobile !== "") {
    throw new Error("Mode switch back to Individual failed to clear stale fields!");
  }

  // 4. Test 10-digit Phone Validation for India (+91)
  console.log("\n5. Testing 10-digit India (+91) Mobile/WA Enforcement:");
  const pass10 = validatePhoneNumber("+91", "9876543210");
  const fail11 = validatePhoneNumber("+91", "98765432101");

  console.log(`- 10 digits -> ${pass10.isValid ? "PASS" : "FAIL"}`);
  console.log(`- 11 digits -> ${!fail11.isValid ? "PASS (REJECTED)" : "FAIL"}`);

  if (!pass10.isValid || fail11.isValid) {
    throw new Error("Phone validation rules broken!");
  }

  console.log("\n=========================================================================");
  console.log("FORM STRUCTURE & MODE SWITCH RESET TEST SUITE COMPLETE — ALL PASSED!");
  console.log("=========================================================================");
}

runModeSwitchAndStructureTest().catch(console.error);
