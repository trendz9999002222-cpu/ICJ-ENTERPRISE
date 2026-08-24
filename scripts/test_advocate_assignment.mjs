/**
 * ICJ ENTERPRISE PLATFORM — ADVOCATE ASSIGNMENT ENGINE TEST SUITE
 */
import AdvocateAssignmentService from "../src/services/advocateAssignmentService.js";

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

// 2. Template rendering
const sampleContext = {
  client_name: "Ramesh Sharma",
  client_mobile: "+91 7053002222",
  case_id: "ICJ-2026-CASE-8801",
  case_title: "Property Boundary Dispute",
  advocate_name: "Senior Advocate PAWAN GUPTA",
  advocate_id: "26ICJ08AA0002",
  advocate_mobile: "+91 9999002222",
  advocate_bar_reg: "D/1042/1998",
  support_phone: "7053002222 / 9999002222",
};

const renderedWhatsApp = AdvocateAssignmentService.renderTemplate(templates.whatsappMessage, sampleContext);
assert(renderedWhatsApp.includes("PAWAN GUPTA"), "Rendered WhatsApp includes Advocate Name");
assert(renderedWhatsApp.includes("26ICJ08AA0002"), "Rendered WhatsApp includes Advocate ID");
assert(renderedWhatsApp.includes("Ramesh Sharma"), "Rendered WhatsApp includes Client Name");
assert(!renderedWhatsApp.includes("{{advocate_name}}"), "No un-substituted placeholders remain");

// 3. Custom template save & reset
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
