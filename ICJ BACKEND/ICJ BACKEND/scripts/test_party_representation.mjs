/**
 * ICJ ENTERPRISE PLATFORM — MULTI-PARTY LEGAL REPRESENTATION & AUTO-TITLE TEST SUITE
 */
import LegalService from "../src/services/legalService.js";

console.log("=== RUNNING MULTI-PARTY REPRESENTATION & CAUSE TITLE TEST SUITE ===");

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

async function runPartyRepresentationTests() {
  // 1. Test Side A (Plaintiff/Petitioner) Representation Case
  const plaintiffCasePayload = {
    title: "Ramvir Jatav & 1 Other vs. State of UP & 2 Others",
    clientName: "Ramvir Jatav",
    advocateName: "Senior Advocate Mr. PAWAN GUPTA",
    clientSide: "SIDE_A",
    clientRole: "Petitioner",
    opponentRole: "Respondent",
    sideAParties: ["Ramvir Jatav", "Suresh Kumar"],
    sideBParties: ["State of Uttar Pradesh", "District Magistrate GB Nagar", "SDM Sadar"],
    opponentName: "State of Uttar Pradesh",
    causeTitle: "Ramvir Jatav & 1 Other vs. State of Uttar Pradesh & 2 Others",
    representationBadge: "Advocate for Petitioner #1 (Ramvir Jatav)",
    courtName: "Allahabad High Court (Lucknow Bench)",
    status: "Pending",
    priority: "High",
  };

  const createdPlaintiffCase = await LegalService.create(plaintiffCasePayload);
  assert(createdPlaintiffCase.clientSide === "SIDE_A", "Plaintiff Case correctly tagged as SIDE_A");
  assert(createdPlaintiffCase.clientRole === "Petitioner", "Client role is Petitioner");
  assert(createdPlaintiffCase.sideAParties.length === 2, "2 Petitioners recorded in Side A");
  assert(createdPlaintiffCase.sideBParties.length === 3, "3 Respondents recorded in Side B");
  assert(createdPlaintiffCase.representationBadge.includes("Petitioner #1"), "Representation badge correctly targets Petitioner #1");

  // 2. Test Side B (Defendant / Respondent / Accused) Representation Case
  const defendantCasePayload = {
    title: "DCM Shriram Ltd. vs. M/s Pawan Logistics & 3 Ors.",
    clientName: "M/s Pawan Logistics",
    advocateName: "Senior Advocate Mr. PAWAN GUPTA",
    clientSide: "SIDE_B",
    clientRole: "Defendant",
    opponentRole: "Plaintiff",
    sideAParties: ["DCM Shriram Ltd."],
    sideBParties: ["M/s Pawan Logistics", "Pawan Gupta (Director)", "Mukesh Sharma (Manager)", "Surendra Singh"],
    opponentName: "DCM Shriram Ltd.",
    causeTitle: "DCM Shriram Ltd. vs. M/s Pawan Logistics & 3 Others",
    representationBadge: "Advocate for Defendant #1 (M/s Pawan Logistics)",
    courtName: "Commercial Court, Surajpur District Court Complex, Gautam Buddha Nagar",
    status: "Hearing",
    priority: "Urgent",
  };

  const createdDefendantCase = await LegalService.create(defendantCasePayload);
  assert(createdDefendantCase.clientSide === "SIDE_B", "Defendant Case correctly tagged as SIDE_B");
  assert(createdDefendantCase.clientRole === "Defendant", "Client role is Defendant");
  assert(createdDefendantCase.sideAParties.length === 1, "1 Plaintiff recorded in Side A");
  assert(createdDefendantCase.sideBParties.length === 4, "4 Defendants recorded in Side B");
  assert(createdDefendantCase.representationBadge.includes("Defendant #1"), "Representation badge correctly targets Defendant #1");

  // 3. Test Retrieval from LegalService Master Registry
  const allCases = await LegalService.getAll();
  assert(allCases.some((c) => c.clientSide === "SIDE_B"), "SIDE_B Defendant case retrieved from registry");
  assert(allCases.some((c) => c.clientSide === "SIDE_A"), "SIDE_A Petitioner case retrieved from registry");

  console.log("=== ALL MULTI-PARTY REPRESENTATION & CAUSE TITLE TESTS PASSED (100%) ===");
}

runPartyRepresentationTests();
