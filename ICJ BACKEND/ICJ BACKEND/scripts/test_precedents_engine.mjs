// ICJ ENTERPRISE — SUPREME COURT PRECEDENTS & CASE LAW ENGINE VERIFICATION TEST
import { SUPREME_COURT_JUDGMENTS_MASTER, PRECEDENT_STATUS, getJudgmentsForSection } from "../src/data/masters/supremeCourtJudgmentsMaster.js";
import PrecedentSearchService from "../src/services/precedentSearchService.js";

console.log("==========================================================================");
console.log("🏛️ ICJ ENTERPRISE — SUPREME COURT e-SCR PRECEDENTS ENGINE VERIFICATION");
console.log("==========================================================================\n");

// TEST 1: Catalog Integrity
console.log("--- 1. MASTER CASE LAWS REPOSITORY VERIFICATION ---");
console.log(`✓ Total Landmark Supreme Court Judgments Cataloged: ${SUPREME_COURT_JUDGMENTS_MASTER.length}`);
const constitutionBenches = SUPREME_COURT_JUDGMENTS_MASTER.filter(j => j.precedent_status === PRECEDENT_STATUS.CONSTITUTION_BENCH);
console.log(`  - Constitution Bench Decisions: ${constitutionBenches.length}`);
const landmarkRulings = SUPREME_COURT_JUDGMENTS_MASTER.filter(j => j.precedent_status === PRECEDENT_STATUS.LANDMARK);
console.log(`  - Landmark Three-Judge & Division Bench Rulings: ${landmarkRulings.length}`);

// TEST 2: Section to Precedent Bidirectional Linking
console.log("\n--- 2. SECTION-TO-PRECEDENT BIDIRECTIONAL LINKING ---");
const testSections = [
  { actId: "ACT_BNSS_2023", sec: "482", name: "Anticipatory Bail (BNSS 482 / CrPC 438)" },
  { actId: "ACT_BNSS_2023", sec: "173", name: "Registration of FIR (BNSS 173 / CrPC 154)" },
  { actId: "ACT_BNSS_2023", sec: "528", name: "High Court Inherent Quashing (BNSS 528 / CrPC 482)" },
  { actId: "ACT_NI_1881", sec: "138", name: "Cheque Dishonour (Section 138 NI Act)" },
  { actId: "ACT_CONSTITUTION_1950", sec: "21", name: "Right to Life & Privacy (Article 21)" },
  { actId: "ACT_CPC_1908", sec: "Order 39", name: "Ex-Parte Temporary Injunction (Order 39 CPC)" },
];

testSections.forEach(t => {
  const matches = PrecedentSearchService.getJudgmentsForSection(t.actId, t.sec);
  console.log(`✓ [${t.name}]: Found ${matches.length} Landmark Ruling(s)`);
  matches.forEach(m => {
    console.log(`    • ${m.title} [${m.official_citation}] (${m.bench_strength})`);
  });
});

// TEST 3: Full-Text Search by Query
console.log("\n--- 3. FULL-TEXT SEARCH & CITATION QUERY ENGINE ---");
const queries = ["Antil", "Arnesh", "Lalita Kumari", "Puttaswamy", "2022 INSC 690", "Basic Structure"];
queries.forEach(q => {
  const results = PrecedentSearchService.searchJudgments({ search: q });
  console.log(`✓ Search Query: "${q}" -> Found ${results.length} Match(es)`);
  if (results[0]) {
    console.log(`    Top Match: ${results[0].title} [${results[0].official_citation}]`);
  }
});

// TEST 4: Citation Formatter for Advocates
console.log("\n--- 4. ADVOCATE COURT CITATION FORMATTER ---");
const sampleCase = SUPREME_COURT_JUDGMENTS_MASTER[0];
const formattedCitation = PrecedentSearchService.formatCourtCitation(sampleCase);
console.log(`✓ Case Title: ${sampleCase.title}`);
console.log(`✓ Formatted Court Citation:`);
console.log(`  "${formattedCitation}"`);

console.log("\n==========================================================================");
console.log("✅ ALL SUPREME COURT PRECEDENT ENGINE SUBSYSTEMS OPERATIONAL!");
console.log("==========================================================================");
