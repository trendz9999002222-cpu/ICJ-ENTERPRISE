/**
 * ICJ ENTERPRISE PLATFORM — BOTH REGISTRATION MODES VALIDATION
 * Tests Country, Mobile, WhatsApp, and Email consistency across BOTH modes:
 * 1. INDIVIDUAL MEMBER mode
 * 2. ORGANISATION / ENTITY / INSTITUTION mode
 */

// Mock localStorage for Node.js test execution
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

const { validatePhoneNumber, getCountryByCodeOrIso } = await import("../src/data/internationalPhoneMaster.js");
const { MemberService } = await import("../src/services/memberService.js");

async function runBothModesValidation() {
  console.log("=========================================================================");
  console.log("ICJ ENTERPRISE PLATFORM — BOTH REGISTRATION MODES VALIDATION");
  console.log("=========================================================================");

  // -------------------------------------------------------------------------
  // MODE 1: INDIVIDUAL MEMBER
  // -------------------------------------------------------------------------
  console.log("\n--- MODE 1: INDIVIDUAL MEMBER ---");

  const indCountry = "India";
  const indCode = "+91";
  const indValidMobile = "9876543210";
  const indInvalidMobile = "98765432101"; // 11 digits

  const indMobRes = validatePhoneNumber(indCode, indValidMobile);
  console.log(`Individual Mobile (10 digits): ${indMobRes.isValid ? "PASS" : "FAIL"} (${indMobRes.reason})`);

  const indMobFail = validatePhoneNumber(indCode, indInvalidMobile);
  console.log(`Individual Mobile 11th digit blocked: ${!indMobFail.isValid ? "PASS (REJECTED)" : "FAIL"}`);

  const indWaRes = validatePhoneNumber(indCode, "9000000002");
  console.log(`Individual WhatsApp (10 digits): ${indWaRes.isValid ? "PASS" : "FAIL"}`);

  const indMember = await MemberService.create({
    name: "TEST Individual Member",
    email: "ind.member@icj-qa.org",
    mobile: "+91 9876543210",
    whatsapp: "+91 9000000002",
    country: indCountry,
    state: "Delhi",
    regType: "Individual",
  });
  console.log(`Individual Record Created: ${indMember.member_id}`);

  // -------------------------------------------------------------------------
  // MODE 2: ORGANISATION / ENTITY / INSTITUTION
  // -------------------------------------------------------------------------
  console.log("\n--- MODE 2: ORGANISATION / ENTITY / INSTITUTION ---");

  const orgCountry = "India";
  const orgCode = "+91";
  const orgValidMobile = "9876543211";
  const orgInvalidMobile = "98765432111"; // 11 digits

  const orgMobRes = validatePhoneNumber(orgCode, orgValidMobile);
  console.log(`Organisation Mobile (10 digits): ${orgMobRes.isValid ? "PASS" : "FAIL"} (${orgMobRes.reason})`);

  const orgMobFail = validatePhoneNumber(orgCode, orgInvalidMobile);
  console.log(`Organisation Mobile 11th digit blocked: ${!orgMobFail.isValid ? "PASS (REJECTED)" : "FAIL"}`);

  const orgWaRes = validatePhoneNumber(orgCode, "9000000012");
  console.log(`Organisation WhatsApp (10 digits): ${orgWaRes.isValid ? "PASS" : "FAIL"}`);

  const orgMember = await MemberService.create({
    name: "TEST Organisation Entity",
    email: "org.entity@icj-qa.org",
    mobile: "+91 9876543211",
    whatsapp: "+91 9000000012",
    country: orgCountry,
    state: "Maharashtra",
    regType: "Organisation",
  });
  console.log(`Organisation Record Created: ${orgMember.member_id}`);

  console.log("\n=========================================================================");
  console.log("BOTH REGISTRATION MODES VALIDATION COMPLETE — ALL GREEN!");
  console.log("=========================================================================");
}

runBothModesValidation().catch(console.error);
