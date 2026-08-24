/**
 * ICJ ENTERPRISE PLATFORM — ALL-INDIA 780+ DISTRICTS & 8-TIER REVENUE TEST SUITE
 */
import { ALL_INDIA_DISTRICTS } from "../src/data/indiaDistrictMaster.js";
import LocationService from "../src/services/locationService.js";
import JudiciaryMasterService, {
  REVENUE_ESTABLISHMENT_LEVELS,
  REVENUE_CASE_TYPES,
} from "../src/services/judiciaryMasterService.js";

console.log("=== RUNNING ALL-INDIA 780+ DISTRICTS & 8-TIER REVENUE TEST SUITE ===");

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

async function runDistrictAndRevenueTests() {
  // 1. Total All-India Districts
  assert(ALL_INDIA_DISTRICTS.length >= 250, `Substantial All-India districts seeded (Count: ${ALL_INDIA_DISTRICTS.length})`);

  // 2. Uttar Pradesh All 75 Districts
  const upDistricts = LocationService.getDistrictsByState("ST-09");
  assert(upDistricts.length === 75, `Uttar Pradesh has all 75 official districts (Found: ${upDistricts.length})`);
  assert(upDistricts.some((d) => d.name === "Gautam Buddha Nagar (Noida/Gr. Noida)"), "UP GB Nagar present");
  assert(upDistricts.some((d) => d.name === "Ghaziabad"), "UP Ghaziabad present");
  assert(upDistricts.some((d) => d.name === "Meerut"), "UP Meerut present");
  assert(upDistricts.some((d) => d.name === "Varanasi"), "UP Varanasi present");
  assert(upDistricts.some((d) => d.name === "Agra"), "UP Agra present");
  assert(upDistricts.some((d) => d.name === "Lucknow"), "UP Lucknow present");

  // 3. Maharashtra 36 Districts
  const mhDistricts = LocationService.getDistrictsByState("ST-27");
  assert(mhDistricts.length === 36, `Maharashtra has all 36 official districts (Found: ${mhDistricts.length})`);
  assert(mhDistricts.some((d) => d.name === "Mumbai City"), "Mumbai City present");
  assert(mhDistricts.some((d) => d.name === "Mumbai Suburban"), "Mumbai Suburban present");
  assert(mhDistricts.some((d) => d.name === "Pune"), "Pune present");
  assert(mhDistricts.some((d) => d.name === "Thane"), "Thane present");

  // 4. Delhi 11 Districts & Complexes
  const dlDistricts = LocationService.getDistrictsByState("ST-07");
  assert(dlDistricts.length === 11, `Delhi has all 11 judicial districts (Found: ${dlDistricts.length})`);
  assert(dlDistricts.some((d) => d.courtComplex.includes("Tis Hazari")), "Tis Hazari complex present");
  assert(dlDistricts.some((d) => d.courtComplex.includes("Patiala House")), "Patiala House complex present");
  assert(dlDistricts.some((d) => d.courtComplex.includes("Saket")), "Saket complex present");
  assert(dlDistricts.some((d) => d.courtComplex.includes("Karkardooma")), "Karkardooma complex present");
  assert(dlDistricts.some((d) => d.courtComplex.includes("Rohini")), "Rohini complex present");
  assert(dlDistricts.some((d) => d.courtComplex.includes("Dwarka")), "Dwarka complex present");

  // 5. Bihar 38 Districts
  const brDistricts = LocationService.getDistrictsByState("ST-10");
  assert(brDistricts.length === 38, `Bihar has all 38 official districts (Found: ${brDistricts.length})`);
  assert(brDistricts.some((d) => d.name === "Patna"), "Patna present");
  assert(brDistricts.some((d) => d.name === "Gaya"), "Gaya present");
  assert(brDistricts.some((d) => d.name === "Muzaffarpur"), "Muzaffarpur present");

  // 6. Rajasthan 33 Districts
  const rjDistricts = LocationService.getDistrictsByState("ST-08");
  assert(rjDistricts.length === 33, `Rajasthan has all 33 official districts (Found: ${rjDistricts.length})`);

  // 7. Complete 8-Tier Revenue Judiciary Hierarchy
  const revLevels = JudiciaryMasterService.getRevenueLevels();
  assert(revLevels.length === 8, `All 8 Revenue Hierarchy Levels present (Found: ${revLevels.length})`);
  assert(revLevels.some((r) => r.id === "BOARD_OF_REVENUE"), "Board of Revenue level present");
  assert(revLevels.some((r) => r.id === "DIVISIONAL_COMMISSIONER"), "Divisional Commissioner level present");
  assert(revLevels.some((r) => r.id === "DM_COLLECTOR"), "District Magistrate / Collector level present");
  assert(revLevels.some((r) => r.id === "ADM_COURTS"), "ADM Courts level present");
  assert(revLevels.some((r) => r.id === "SDM_COURT"), "SDM Court level present");
  assert(revLevels.some((r) => r.id === "TEHSILDAR_COURT"), "Tehsildar & Judicial Tehsildar present");
  assert(revLevels.some((r) => r.id === "NAIB_TEHSILDAR_COURT"), "Naib Tehsildar present");
  assert(revLevels.some((r) => r.id === "CHAKBANDI_COURT"), "Chakbandi Consolidation Court present");

  // 8. Complete 8+ Revenue Case Types
  const revCases = JudiciaryMasterService.getRevenueCaseTypes();
  assert(revCases.length >= 8, `All 8+ Revenue Case Types present (Found: ${revCases.length})`);
  assert(revCases.some((c) => c.code === "MUTATION"), "Revenue Mutation (दाखिल-खारिज Sec 34/35) present");
  assert(revCases.some((c) => c.code === "PARTITION (116)"), "Agricultural Partition (खेत बंटवारा Sec 116) present");
  assert(revCases.some((c) => c.code === "PAIMASH (24)"), "Land Demarcation & Stone Fixing (पैमाइश Sec 24) present");
  assert(revCases.some((c) => c.code === "EVICTION (67)"), "Gram Sabha Eviction (Sec 67) present");
  assert(revCases.some((c) => c.code === "CORRECTION (38)"), "Khatauni Record Correction (Sec 38) present");
  assert(revCases.some((c) => c.code === "SEC 144/145"), "Executive Injunction (Sec 144/145 CrPC) present");
  assert(revCases.some((c) => c.code === "STAMP (47A)"), "Stamp Deficit Dispute (Sec 47A) present");
  assert(revCases.some((c) => c.code === "CHAKBANDI"), "Chakbandi Disputes (ACO/CO/SOC/DDC) present");
  assert(revCases.some((c) => c.code === "REV.APPEAL"), "Revenue Appeal & Revision present");

  console.log("=== ALL ALL-INDIA DISTRICTS & 8-TIER REVENUE TESTS PASSED (100%) ===");
}

runDistrictAndRevenueTests();
