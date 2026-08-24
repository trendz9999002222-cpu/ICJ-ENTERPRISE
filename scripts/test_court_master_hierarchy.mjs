/**
 * ICJ ENTERPRISE PLATFORM — ALL-INDIA MEGA JUDICIAL MASTER & TAXONOMY TEST SUITE
 */
import JudiciaryMasterService, {
  JUDICIAL_TIERS,
  SUPREME_COURT_CASE_TYPES,
  ALL_INDIA_HIGH_COURT_CASE_TYPES,
  DISTRICT_ESTABLISHMENT_CASE_TYPES,
  REVENUE_ESTABLISHMENT_LEVELS,
  REVENUE_CASE_TYPES,
  SPECIAL_TRIBUNALS_DIRECTORY,
  OFFICIAL_HIGH_COURTS,
} from "../src/services/judiciaryMasterService.js";
import LocationService from "../src/services/locationService.js";

console.log("=== RUNNING ALL-INDIA MEGA JUDICIAL MASTER & TAXONOMY TEST SUITE ===");

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

async function runMegaMasterTests() {
  // 1. 5 Top-Level Judicial Forum Tiers
  const tiers = JudiciaryMasterService.getTiers();
  assert(tiers.length === 5, `All 5 Top-Level Tiers present (Found: ${tiers.length})`);
  assert(tiers.some((t) => t.id === "SUPREME_COURT"), "Supreme Court tier present");
  assert(tiers.some((t) => t.id === "HIGH_COURT"), "High Court tier present");
  assert(tiers.some((t) => t.id === "DISTRICT_COURT"), "District Court tier present");
  assert(tiers.some((t) => t.id === "TEHSIL_REVENUE"), "Tehsil & Revenue tier present");
  assert(tiers.some((t) => t.id === "SPECIAL_TRIBUNAL"), "Special Tribunal tier present");

  // 2. Supreme Court 26 Master Case Types
  const scTypes = JudiciaryMasterService.getSupremeCourtCaseTypes();
  assert(scTypes.length === 26, `All 26 Supreme Court Case Types present (Found: ${scTypes.length})`);
  assert(scTypes.some((c) => c.code === "W.P.(C)" && c.name.includes("Art. 32")), "Art 32 Civil Writ present");
  assert(scTypes.some((c) => c.code === "W.P.(CRL)" && c.subCategories.includes("Habeas Corpus (बंदी प्रत्यक्षीकरण)")), "Habeas Corpus Criminal Writ present");
  assert(scTypes.some((c) => c.code === "T.P.(C)"), "Transfer Petition Civil present");
  assert(scTypes.some((c) => c.code === "T.P.(CRL)"), "Transfer Petition Criminal present");
  assert(scTypes.some((c) => c.code === "O.S." && c.name.includes("Article 131")), "Article 131 Original Suit present");
  assert(scTypes.some((c) => c.code === "C.A.(IBC)"), "Direct NCLAT IBC Appeal present");
  assert(scTypes.some((c) => c.code === "SLP(C)"), "SLP Civil Article 136 present");
  assert(scTypes.some((c) => c.code === "CURATIVE.PET(C)"), "Curative Petition Civil present");

  // 3. All-India High Court 37 Master Case Types
  const hcTypes = JudiciaryMasterService.getAllIndiaHighCourtCaseTypes();
  assert(hcTypes.length === 37, `All 37 High Court Case Types present (Found: ${hcTypes.length})`);
  assert(hcTypes.some((c) => c.code === "W.P.(C)"), "High Court W.P.(C) present");
  assert(hcTypes.some((c) => c.code === "BAIL APPLN."), "High Court Bail Applications present");
  assert(hcTypes.some((c) => c.code === "CRL.M.C." && c.name.includes("Sec 482")), "High Court Sec 482 Quashing present");
  assert(hcTypes.some((c) => c.code === "CS(COMM)"), "High Court Commercial Civil Suit present");
  assert(hcTypes.some((c) => c.code === "ARB.P."), "High Court Arbitration Sec 11 present");
  assert(hcTypes.some((c) => c.code === "C.O.(COMM.IPD)"), "High Court IPR Division present");
  assert(hcTypes.some((c) => c.code === "ITA"), "High Court Income Tax Appeal present");
  assert(hcTypes.some((c) => c.code === "CONT.CAS(C)"), "High Court Civil Contempt present");
  assert(hcTypes.some((c) => c.code === "E.P."), "High Court MLA/MP Election Petition present");

  // 4. 25 Official High Courts Coverage
  const highCourts = JudiciaryMasterService.getHighCourts();
  assert(highCourts.length === 25, `All 25 Official High Courts of India present (Found: ${highCourts.length})`);

  // 5. District Establishment Types & Isolation
  const sessionsTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("DISTRICT_SESSIONS");
  assert(sessionsTypes.some((c) => c.code === "SC"), "Sessions Court has Sessions Case (SC)");
  assert(!sessionsTypes.some((c) => c.code === "HMA"), "Sessions Court does NOT have HMA Divorce (Isolated)");

  const familyTypes = JudiciaryMasterService.getCaseTypesForDistrictEstablishment("FAMILY_COURT");
  assert(familyTypes.some((c) => c.code === "HMA"), "Family Court has HMA Divorce");
  assert(familyTypes.some((c) => c.code === "MT"), "Family Court has Maintenance (125 CrPC / 144 BNSS)");

  // 6. Tehsil & Revenue Department Master
  const revLevels = JudiciaryMasterService.getRevenueLevels();
  assert(revLevels.length === 8, `All 8 Revenue Hierarchy Levels present (Found: ${revLevels.length})`);
  assert(revLevels.some((r) => r.id === "BOARD_OF_REVENUE"), "Board of Revenue present");
  assert(revLevels.some((r) => r.id === "TEHSILDAR_COURT"), "Tehsildar Court present");
  assert(revLevels.some((r) => r.id === "CHAKBANDI_COURT"), "Consolidation Officer (चकबंदी) Court present");

  const revCases = JudiciaryMasterService.getRevenueCaseTypes();
  assert(revCases.some((c) => c.code === "MUTATION"), "Revenue Mutation (दाखिल-खारिज) present");
  assert(revCases.some((c) => c.code === "PARTITION (116)"), "Agricultural Land Partition (खेत बंटवारा) present");
  assert(revCases.some((c) => c.code === "PAIMASH (24)"), "Land Demarcation & Stone Fixing (पैमाइश/पत्थरगड्डी) present");
  assert(revCases.some((c) => c.code === "EVICTION (67)"), "Gram Sabha & Chokrod Eviction present");

  // 7. Special Statutory Tribunals Directory
  const tribunals = JudiciaryMasterService.getSpecialTribunals();
  assert(tribunals.length === 8, `All 8 Specialized Tribunals present (Found: ${tribunals.length})`);
  assert(tribunals.some((t) => t.id === "NCLT" && t.benches.length >= 16), "NCLT with 16+ benches present");
  assert(tribunals.some((t) => t.id === "DRT" && t.benches.length >= 20), "DRT / DRAT Banking Recovery present");
  assert(tribunals.some((t) => t.id === "NGT" && t.benches.length >= 5), "NGT 5 Zonal Benches present");
  assert(tribunals.some((t) => t.id === "CAT" && t.benches.length >= 18), "CAT Central Administrative Tribunal present");
  assert(tribunals.some((t) => t.id === "CONSUMER"), "Consumer Commissions (NCDRC/SCDRC/DCDRC) present");
  assert(tribunals.some((t) => t.id === "ITAT" && t.benches.length >= 25), "ITAT Income Tax Tribunal present");
  assert(tribunals.some((t) => t.id === "RERA"), "RERA Real Estate Regulatory Authorities present");
  assert(tribunals.some((t) => t.id === "AFT"), "Armed Forces Tribunal (AFT) present");

  // 8. 16-Character eCourts CNR Validation
  const validCNR = JudiciaryMasterService.validateCNR("UPGZ010012342026");
  assert(validCNR.valid === true, "Valid 16-character CNR UPGZ010012342026 recognized");

  // 9. Base 36 States & UTs Integration with LGD Codes
  const states = LocationService.getStates();
  assert(states.length === 36, `All 36 States/UTs present (Found: ${states.length})`);

  console.log("=== ALL ALL-INDIA MEGA MASTER & TAXONOMY TESTS PASSED (100%) ===");
}

runMegaMasterTests();
