/**
 * ICJ ENTERPRISE PLATFORM — CERTIFICATE ENGINE TEST SUITE
 */
import CertificateService from "../src/services/certificateService.js";

console.log("=== RUNNING MASTER CERTIFICATE ENGINE TEST SUITE ===");

// Mock browser localStorage for node test runner
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

// 1. Validation test
const invalidMember = { member_id: "26CLT01" };
const valRes = CertificateService.validateMemberData(invalidMember);
assert(!valRes.isValid, "Incomplete member must fail validation");

// 2. Valid member certificate generation
const testMember = {
  member_id: "26ICJ08AA0001",
  fullName: "Senior Advocate Rajesh Sharma",
  role: "advocate",
  designation: "Senior Advocate & Legal Counsel",
  email: "rajesh.sharma@example.com",
  mobile: "9876543210",
  purpose: "Corporate Litigation & Dispute Resolution",
  registration_date: "2026-08-24T00:00:00.000Z",
  verification_status: "Verified & Active",
};

const cert = CertificateService.getOrCreateCertificate(testMember);
assert(cert !== null, "Certificate record generated successfully");
assert(cert.certificate_number.startsWith("ICJ-CERT-"), "Certificate number follows standard format");
assert(cert.website === "icj.co.in", "Official website is icj.co.in");
assert(cert.official_email === "Consortiumofjurist@gmail.com", "Official email is Consortiumofjurist@gmail.com");
assert(cert.verification_qr.includes(cert.certificate_number), "QR verification URL contains certificate number");

// 3. Retrieval by certificate number
const retrieved = CertificateService.getCertificateByNumber(cert.certificate_number);
assert(retrieved !== null && retrieved.member_id === testMember.member_id, "Lookup by Certificate Number matches");

// 4. Master HTML rendering
const html = CertificateService.renderMasterCertificateHTML(cert);
assert(html.includes("INTERNATIONAL CONSORTIUM OF JURISTS"), "HTML includes official title");
assert(html.includes(cert.applicant_name), "HTML includes applicant name");
assert(html.includes("icj.co.in"), "HTML includes official website");
assert(html.includes("Consortiumofjurist@gmail.com"), "HTML includes official email");

// 5. Audit log
const logs = CertificateService.getAuditLogs();
assert(logs.length > 0, "Audit log records certificate creation");

console.log("=== ALL CERTIFICATE ENGINE TESTS COMPLETED SUCCESSFULLY ===");
