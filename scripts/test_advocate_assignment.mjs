/**
 * ICJ ENTERPRISE PLATFORM — ADVOCATE ASSIGNMENT ENGINE TEST SUITE
 */
import AdvocateAssignmentService, { OFFICIAL_IN_HOUSE_OFFICERS } from "../src/services/advocateAssignmentService.js";

console.log("=== RUNNING ADVOCATE ASSIGNMENT ENGINE TEST SUITE ===");

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

// 1. Template retrieval
const templates = AdvocateAssignmentService.getTemplates();
assert(templates.emailSubject.includes("{{advocate_name}}"), "Email subject contains advocate placeholder");
assert(templates.whatsappMessage.includes("{{client_name}}"), "WhatsApp template contains client placeholder");

// 2. Official Customer Care officers
assert(OFFICIAL_IN_HOUSE_OFFICERS.length >= 2, "Official customer care desks configured");
assert(OFFICIAL_IN_HOUSE_OFFICERS[0].id === "ICJ-CARE-01", "ICJ-CARE-01 present");
assert(OFFICIAL_IN_HOUSE_OFFICERS[0].mobile.includes("7053002222"), "Customer Care mobile matches standard");

// 3. Template rendering for Member-level allocation
const sampleMemberContext = {
  client_name: "Suresh Gupta",
  client_mobile: "+91 9876543210",
  case_id: "MEM-REF-26CLT08AA0004",
  case_title: "Land Title Grievance",
  advocate_name: OFFICIAL_IN_HOUSE_OFFICERS[0].fullName,
  advocate_id: OFFICIAL_IN_HOUSE_OFFICERS[0].id,
  advocate_mobile: OFFICIAL_IN_HOUSE_OFFICERS[0].mobile,
  advocate_email: OFFICIAL_IN_HOUSE_OFFICERS[0].email,
  advocate_bar_reg: "ICJ Grievance Redressal Desk",
  support_phone: "7053002222 / 9999002222",
};

const renderedWhatsApp = AdvocateAssignmentService.renderTemplate(templates.whatsappMessage, sampleMemberContext);
assert(renderedWhatsApp.includes("Suresh Gupta"), "Rendered WhatsApp includes Member Name");
assert(renderedWhatsApp.includes("ICJ-CARE-01"), "Rendered WhatsApp includes Care Desk ID");
assert(!renderedWhatsApp.includes("{{advocate_name}}"), "No un-substituted placeholders remain");

// 4. Custom template save & reset
const custom = {
  ...templates,
  emailSubject: "Custom Allocation: {{advocate_name}} assigned to {{client_name}}",
};
AdvocateAssignmentService.saveTemplates(custom);
const retrieved = AdvocateAssignmentService.getTemplates();
assert(retrieved.emailSubject.startsWith("Custom Allocation"), "Custom template persisted successfully");

AdvocateAssignmentService.resetTemplatesToDefault();
const reset = AdvocateAssignmentService.getTemplates();
assert(!reset.emailSubject.startsWith("Custom Allocation"), "Templates reset to official default");

console.log("=== ALL ADVOCATE ASSIGNMENT TESTS PASSED SUCCESSFULLY ===");
