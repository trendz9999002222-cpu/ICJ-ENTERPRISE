/**
 * ICJ ENTERPRISE PLATFORM — ALL-INDIA STATUTORY TRIBUNALS REPOSITORY TEST SUITE
 */
import { JudiciaryMasterService } from "../src/services/judiciaryMasterService.js";
import { ALL_INDIA_TRIBUNALS } from "../src/data/allIndiaTribunalsMaster.js";

console.log("=== RUNNING ALL-INDIA STATUTORY TRIBUNALS & COMMISSIONS TEST SUITE ===");

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Verify 8 Statutory Tribunals
const tribunals = JudiciaryMasterService.getSpecialTribunals();
assert(tribunals.length === 8, `All 8 Statutory Tribunals present (Found: ${tribunals.length})`);

// 2. Test NCLT & NCLAT
const nclt = tribunals.find((t) => t.id === "NCLT");
assert(nclt !== undefined, "NCLT is present in master directory");
assert(nclt.benches.length >= 16, `NCLT has 16+ All-India Benches (Found: ${nclt.benches.length})`);
assert(nclt.benches.some((b) => b.includes("Principal Bench")), "NCLT Principal Bench present");
assert(nclt.benches.some((b) => b.includes("NCLAT")), "NCLAT Appellate Benches present");
assert(nclt.caseTypes.length === 8, `NCLT has all 8 IBC/CA Case Types (Found: ${nclt.caseTypes.length})`);

// 3. Test DRT & DRAT
const drt = tribunals.find((t) => t.id === "DRT");
assert(drt !== undefined, "DRT is present in master directory");
assert(drt.benches.length >= 40, `DRT has 40+ All-India Benches (39 DRT + 5 DRAT) (Found: ${drt.benches.length})`);
assert(drt.benches.some((b) => b.includes("DRAT Delhi")), "DRAT Delhi Appellate Bench present");
assert(drt.benches.some((b) => b.includes("DRT-1 Mumbai")), "DRT Mumbai Bench present");
assert(drt.caseTypes.some((c) => c.code.includes("Sec 17")), "SARFAESI Sec 17 present");

// 4. Test CAT (Central Administrative Tribunal)
const cat = tribunals.find((t) => t.id === "CAT");
assert(cat !== undefined, "CAT is present in master directory");
assert(cat.benches.length >= 20, `CAT has 20+ Benches across India (Found: ${cat.benches.length})`);
assert(cat.benches.some((b) => b.includes("Principal Bench")), "CAT Principal Bench (New Delhi) present");
assert(cat.caseTypes.some((c) => c.code.includes("Sec 19")), "CAT Sec 19 OA present");

// 5. Test Consumer Disputes Redressal Commissions (NCDRC/SCDRC/DCDRC)
const consumer = tribunals.find((t) => t.id === "CONSUMER");
assert(consumer !== undefined, "Consumer Commission is present");
assert(consumer.benches.some((b) => b.includes("NCDRC")), "NCDRC National Commission present");
assert(consumer.benches.some((b) => b.includes("SCDRC")), "SCDRC State Commissions present");
assert(consumer.caseTypes.some((c) => c.code.includes("Complaint")), "Consumer Complaint present");
assert(consumer.caseTypes.some((c) => c.code.includes("First Appeal")), "Consumer First Appeal present");

// 6. Test ITAT (Income Tax Appellate Tribunal)
const itat = tribunals.find((t) => t.id === "ITAT");
assert(itat !== undefined, "ITAT is present in master directory");
assert(itat.benches.length === 28, `ITAT has all 28 Benches across India (Found: ${itat.benches.length})`);
assert(itat.caseTypes.some((c) => c.code === "ITA"), "ITAT ITA Appeal present");
assert(itat.caseTypes.some((c) => c.code.includes("Stay")), "ITAT Stay Application present");

// 7. Test RERA & REAT
const rera = tribunals.find((t) => t.id === "RERA");
assert(rera !== undefined, "RERA is present in master directory");
assert(rera.benches.length >= 50, `RERA has 50+ All-India Authorities & REATs (Found: ${rera.benches.length})`);
assert(rera.caseTypes.length === 6, `RERA has all 6 statutory case types (Found: ${rera.caseTypes.length})`);

// 8. Test NGT (National Green Tribunal)
const ngt = tribunals.find((t) => t.id === "NGT");
assert(ngt !== undefined, "NGT is present in master directory");
assert(ngt.benches.length === 5, `NGT has 5 Zonal Benches (Found: ${ngt.benches.length})`);
assert(ngt.caseTypes.some((c) => c.code.includes("Sec 14")), "NGT Sec 14 OA present");

// 9. Test AFT (Armed Forces Tribunal)
const aft = tribunals.find((t) => t.id === "AFT");
assert(aft !== undefined, "AFT is present in master directory");
assert(aft.benches.length === 12, `AFT has Principal + 11 Regional Benches (Found: ${aft.benches.length})`);
assert(aft.caseTypes.some((c) => c.code.includes("Pension")), "AFT Military Disability Pension present");

console.log("=== ALL 8 STATUTORY TRIBUNALS & ALL-INDIA BENCHES TESTS PASSED (100%) ===");
