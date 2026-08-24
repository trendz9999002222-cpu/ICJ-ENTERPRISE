/**
 * ICJ ENTERPRISE PLATFORM — INDIA COURT MASTER & COURT-SPECIFIC CASE TAXONOMY TEST SUITE
 */
import JudiciaryMasterService, {
  OFFICIAL_HIGH_COURTS,
  HIGH_COURT_CASE_TYPES,
  DISTRICT_ESTABLISHMENT_CASE_TYPES,
} from "../src/services/judiciaryMasterService.js";
import LocationService from "../src/services/locationService.js";

console.log("=== RUNNING INDIA COURT MASTER & TAXONOMY HIERARCHY TEST SUITE ===");

// Mock browser localStorage for node runner
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; },
  };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runCourtMasterTests() {
  // 1. 25 Official High Courts Coverage
  const highCourts = JudiciaryMasterService.getHighCourts();
  assert(highCourts.length === 25, `All 25 Official High Courts of India present (Found: ${highCourts.length})`);
  
  const delhiHC = JudiciaryMasterService.getHighCourtByCode("HC-DEL");
  assert(delhiHC !== null, "Delhi High Court found by code HC-DEL");
  assert(delhiHC.cnrPrefix === "DLHC", "Delhi High Court CNR prefix is DLHC");

  const allahabadHC = JudiciaryMasterService.getHighCourtByCode("HC-ALL");
  assert(allahabadHC !== null, "Allahabad High Court found");
  assert(allahabadHC.benches.includes("Lucknow Bench"), "Allahabad High Court includes Lucknow Bench");

  // 2. High Court-Specific Case Taxonomy
  const hcCaseTypes = JudiciaryMasterService.getCaseTypesForHighCourt("HC-DEL");
  assert(hcCaseTypes.some((c) => c.code === "W.P.(C)"), "High Court taxonomy contains W.P.(C)");
  assert(hcCaseTypes.some((c) => c.code === "CRL.M.C."), "High Court taxonomy contains CRL.M.C. (Sec 482 CrPC / 528 BNSS)");
  assert(hcCaseTypes.some((c) => c.code === "CS(COMM)"), "High Court taxonomy contains CS(COMM)");
  assert(hcCaseTypes.some((c) => c.code === "ARB.P."), "High Court taxonomy contains ARB.P.");

  // 3. District Establishment Taxonomy Isolation
  // A: District & Sessions Court
  const sessionsTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("DISTRICT_SESSIONS");
  assert(sessionsTypes.some((c) => c.code === "SC"), "Sessions Court has Sessions Case (SC)");
  assert(sessionsTypes.some((c) => c.code === "BAIL"), "Sessions Court has Bail Applications");
  assert(!sessionsTypes.some((c) => c.code === "HMA"), "Sessions Court does NOT have HMA Divorce (Isolated)");

  // B: Family Court
  const familyTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("FAMILY_COURT");
  assert(familyTypes.some((c) => c.code === "HMA"), "Family Court has HMA Divorce Petitions");
  assert(familyTypes.some((c) => c.code === "MT"), "Family Court has Maintenance (125 CrPC / 144 BNSS)");
  assert(!familyTypes.some((c) => c.code === "SC"), "Family Court does NOT have Murder Trials (SC)");

  // C: Commercial Court
  const commTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("COMMERCIAL_COURT");
  assert(commTypes.some((c) => c.code === "CS(COMM)"), "Commercial Court has CS(COMM)");
  assert(!commTypes.some((c) => c.code === "DV"), "Commercial Court does NOT have Domestic Violence (Isolated)");

  // D: POCSO Special Court
  const pocsoTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("POCSO_SPECIAL");
  assert(pocsoTypes.some((c) => c.code === "POCSO"), "POCSO Special Court has POCSO Case types");

  // 4. 16-Character eCourts CNR Validation Engine
  const validCNR1 = JudiciaryMasterService.validateCNR("UPGZ010012342026");
  assert(validCNR1.valid === true, "Valid 16-character CNR UPGZ010012342026 recognized");
  assert(validCNR1.stateDistrictCode === "UPGZ", "CNR State+District extracted as UPGZ");
  assert(validCNR1.year === "2026", "CNR Year extracted as 2026");

  const validCNR2 = JudiciaryMasterService.validateCNR("DLHC010043212026");
  assert(validCNR2.valid === true, "Valid High Court CNR DLHC010043212026 recognized");

  const invalidCNRShort = JudiciaryMasterService.validateCNR("UPGZ123");
  assert(invalidCNRShort.valid === false, "Short CNR correctly rejected");

  const invalidCNRSyntax = JudiciaryMasterService.validateCNR("1234ABCD0012342026");
  assert(invalidCNRSyntax.valid === false, "Invalid format CNR correctly rejected");

  // 5. Base 36 States & UTs Integration with LGD Codes
  const states = LocationService.getStates();
  assert(states.length === 36, `All 36 States/UTs present (Found: ${states.length})`);
  assert(states.some((s) => s.name === "Uttar Pradesh" && s.highCourt.includes("Allahabad")), "UP maps to Allahabad High Court");
  assert(states.some((s) => s.name === "Maharashtra" && s.highCourt.includes("Bombay")), "Maharashtra maps to Bombay High Court");

  console.log("=== ALL INDIA COURT MASTER & TAXONOMY TESTS PASSED SUCCESSFULLY ===");
}

runCourtMasterTests();
