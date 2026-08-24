/**
 * ICJ ENTERPRISE PLATFORM — 3-TIER ALLOCATION & STRICT ROLE ISOLATION TEST SUITE
 */
import AdvocateAssignmentService, { OFFICIAL_IN_HOUSE_OFFICERS } from "../src/services/advocateAssignmentService.js";
import MemberService from "../src/services/memberService.js";

console.log("=== RUNNING 3-TIER ALLOCATION & ROLE ISOLATION TEST SUITE ===");

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

// 1. Setup mock database with mixed roles: Clients, Franchisees, and Advocates
const mockMembers = [
  { id: "26SAD08AA0001", member_id: "26SAD08AA0001", fullName: "Super Admin", role: "admin" },
  { id: "26ICJ08AA0002", member_id: "26ICJ08AA0002", fullName: "Senior Advocate PAWAN GUPTA", role: "advocate", professionalRegNo: "D/1042/1998", mobile: "+91 9999002222" },
  { id: "26FRZ08AA0003", member_id: "26FRZ08AA0003", fullName: "Delhi Central Franchise Agency", role: "franchise", franchiseDistrict: "New Delhi", mobile: "+91 9876543210" },
  { id: "26CLT08AA0004", member_id: "26CLT08AA0004", fullName: "Ramvir Jatav", role: "client", purposeCode: "PROBLEM", mobile: "+91 8700974739" },
  { id: "26CLT08AA0005", member_id: "26CLT08AA0005", fullName: "Suresh Client", role: "client", purposeCode: "PROBLEM", mobile: "+91 9999111122" },
];

MemberService.getAll = async () => mockMembers;

async function runTests() {
  // Test A: Get Categorized Assignees for Target Client Ramvir Jatav (26CLT08AA0004)
  const categorized = await AdvocateAssignmentService.getCategorizedAssignees("26CLT08AA0004");

  // 1. Zero Clients in any assignee list
  const hasClients = categorized.allFlat.some((a) => a.role === "client" || a.id.includes("CLT") || a.fullName.includes("Ramvir") || a.fullName.includes("Suresh"));
  assert(!hasClients, "Clients (Ramvir, Suresh) are STRICTLY EXCLUDED from assignee lists");

  // 2. Franchise Agency presence
  assert(categorized.franchisees.length === 1, "District Franchise Agency correctly identified in Franchise Group");
  assert(categorized.franchisees[0].id === "26FRZ08AA0003", "Franchise ID is 26FRZ08AA0003");

  // 3. Central Customer Care Desks
  assert(categorized.customerCare.length === 2, "Central Customer Care desks present");
  assert(categorized.customerCare[0].id === "ICJ-CARE-01", "ICJ-CARE-01 desk present");

  // 4. Empaneled Advocates
  assert(categorized.advocates.length === 1, "Empaneled Advocate correctly identified in Advocate Group");
  assert(categorized.advocates[0].id === "26ICJ08AA0002", "Advocate ID is 26ICJ08AA0002 (Mr. PAWAN GUPTA)");

  // Test B: Template Rendering for Franchise Agency Allocation
  const templates = AdvocateAssignmentService.getTemplates();
  const franchiseContext = {
    client_id: "26CLT08AA0004",
    client_name: "Ramvir Jatav",
    assignee_name: categorized.franchisees[0].fullName,
    assignee_id: categorized.franchisees[0].id,
    assignee_jurisdiction: categorized.franchisees[0].jurisdiction,
    assignee_mobile: categorized.franchisees[0].mobile,
    assignee_email: categorized.franchisees[0].email,
    support_phone: "7053002222 / 9999002222",
  };

  const renderedFranchiseMsg = AdvocateAssignmentService.renderTemplate(templates.franchiseWhatsApp, franchiseContext);
  assert(renderedFranchiseMsg.includes("Delhi Central Franchise Agency"), "Rendered Franchise Msg includes Franchise Name");
  assert(renderedFranchiseMsg.includes("Ramvir Jatav"), "Rendered Franchise Msg includes Client Name");
  assert(renderedFranchiseMsg.includes("26CLT08AA0004"), "Rendered Franchise Msg includes Clean Client ID");
  assert(renderedFranchiseMsg.includes("लोकल कॉल सेंटर"), "Rendered Franchise Msg emphasizes Local Call Center function");

  // Test C: Advocate Replacement Engine
  const replaceRes = await AdvocateAssignmentService.replaceAdvocate({
    targetClientId: "26CLT08AA0004",
    clientName: "Ramvir Jatav",
    clientMobile: "+91 8700974739",
    clientEmail: "ramvir@example.com",
    oldAdvocateName: "Previous Advocate",
    newAdvocate: categorized.advocates[0],
    replacementReason: "Performance Optimization",
    replacedBy: "Delhi Central Franchise Agency",
  });

  assert(replaceRes.success === true, "Advocate replacement succeeded seamlessly");
  assert(replaceRes.allocationRecord.assignee_id === "26ICJ08AA0002", "New Advocate assigned to client record");

  console.log("=== ALL 3-TIER ALLOCATION & ROLE ISOLATION TESTS PASSED ===");
}

runTests();
