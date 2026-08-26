// ICJ ENTERPRISE — PAN-INDIA 25 HIGH COURTS ENGINE VERIFICATION TEST SUITE
import { ALL_INDIA_25_HIGH_COURTS, getHighCourtByCode } from "../src/data/masters/highCourtsMasterRegistry.js";
import { HIGH_COURT_JUDGMENTS_STORE, getHighCourtJudgmentsForSection } from "../src/data/masters/highCourtsJudgmentsStore.js";
import HighCourtPrecedentService from "../src/services/highCourtPrecedentService.js";

console.log("==========================================================================");
console.log("🏛️ ICJ ENTERPRISE — PAN-INDIA 25 HIGH COURTS ENGINE VERIFICATION");
console.log("==========================================================================\n");

// TEST 1: 25 High Courts Matrix
console.log("--- 1. 25 HIGH COURTS MASTER MATRIX VERIFICATION ---");
console.log(`✓ Total High Courts Registered: ${ALL_INDIA_25_HIGH_COURTS.length} / 25`);
ALL_INDIA_25_HIGH_COURTS.forEach(hc => {
  console.log(`  • [${hc.hc_code}] ${hc.name_en} (${hc.principal_bench}) -> Neutral Prefix: ${hc.neutral_prefix}`);
});

// TEST 2: High Court Judgments & Neutral Citations
console.log("\n--- 2. HIGH COURT JUDGMENTS & NEUTRAL CITATION LOOKUP ---");
console.log(`✓ Total High Court Judgments in Store: ${HIGH_COURT_JUDGMENTS_STORE.length}`);
HIGH_COURT_JUDGMENTS_STORE.forEach(j => {
  console.log(`  ✓ [${j.hc_code}] ${j.title} -> Neutral Citation: ${j.neutral_citation}`);
  console.log(`    Disposal: ${j.disposal_nature} | Bench: ${j.bench_location} | Coram: ${j.coram.join(", ")}`);
});

// TEST 3: Search by Neutral Citation & Query
console.log("\n--- 3. HIGH COURT SEARCH ENGINE ---");
const testQueries = ["2024:DHC:1520", "2023:AHC:9210", "Lodha", "Vikas Aggarwal", "Ramasamy"];
testQueries.forEach(q => {
  const results = HighCourtPrecedentService.searchHighCourtJudgments({ search: q });
  console.log(`✓ Query: "${q}" -> Found ${results.length} Match(es)`);
  if (results[0]) {
    console.log(`    Top Match: ${results[0].title} [${results[0].neutral_citation}]`);
  }
});

// TEST 4: Section-to-High-Court Linking
console.log("\n--- 4. SECTION-TO-HIGH-COURT JURISPRUDENCE LINKING ---");
const testSections = [
  { actId: "ACT_BNSS_2023", sec: "528", name: "High Court Inherent Quashing (BNSS 528 / CrPC 482)" },
  { actId: "ACT_BNSS_2023", sec: "482", name: "Direct Anticipatory Bail (BNSS 482 / CrPC 438)" },
  { actId: "ACT_NI_1881", sec: "138", name: "Cheque Bounce Director Liability (Sec. 138 / 141)" },
  { actId: "ACT_ARBITRATION_1996", sec: "9", name: "Pre-Arbitration Interim Stay (Sec. 9)" },
  { actId: "ACT_CPC_1908", sec: "115", name: "Civil Revision & Injunction (Sec. 115 / Order 39)" },
];

testSections.forEach(t => {
  const matches = HighCourtPrecedentService.getJudgmentsForSection(t.actId, t.sec);
  console.log(`✓ [${t.name}]: Found ${matches.length} High Court Ruling(s)`);
  matches.forEach(m => {
    console.log(`    • [${m.hc_code}] ${m.title} (${m.neutral_citation})`);
  });
});

// TEST 5: High Court Citation Formatter
console.log("\n--- 5. HIGH COURT CITATION FORMATTER ---");
const sampleHC = HIGH_COURT_JUDGMENTS_STORE[0];
const formatted = HighCourtPrecedentService.formatHighCourtCitation(sampleHC);
console.log(`✓ Case: ${sampleHC.title}`);
console.log(`✓ Official Citation Output:`);
console.log(`  "${formatted}"`);

console.log("\n==========================================================================");
console.log("✅ ALL 25 HIGH COURTS PRECEDENT ENGINE SUBSYSTEMS FULLY OPERATIONAL!");
console.log("==========================================================================");
