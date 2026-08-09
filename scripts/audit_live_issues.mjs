import fs from "fs";

const basic = fs.readFileSync("src/components/member-registration/BasicInformation.jsx", "utf8");
const prof  = fs.readFileSync("src/components/member-registration/ProfessionalInformation.jsx", "utf8");
const verify= fs.readFileSync("src/components/member-registration/VerificationSection.jsx", "utf8");

console.log("=== LIVE SOURCE ISSUE AUDIT ===\n");

// Issue 1: Old policy cards replaced by MasterLegalConsent
const oldCards = (verify.match(/PolicyCard|MembershipPolicy|PrivacyPolicy|TermsConditions|CodeOfConduct|DataProcessing|AIUsage/g) || []).length;
const hasMasterConsent = verify.includes("<MasterLegalConsent");
console.log("1. Old individual policy cards in VerificationSection:", oldCards === 0 ? "CLEAR (0 old cards)" : "FOUND " + oldCards);
console.log("   MasterLegalConsent in VerificationSection:", hasMasterConsent ? "PRESENT" : "MISSING");

// Issue 2: Duplicate Profession field
const profInBasic = (basic.match(/name="profession"/g) || []).length;
const profInProf  = (prof.match(/name="profession"/g) || []).length;
console.log("\n2. Profession field count in BasicInformation:", profInBasic, "(should be 1)");
console.log("   Profession field count in ProfessionalInformation:", profInProf, "(should be 0)");

// Issue 3: GST beside Aadhaar/PAN
const gstInBasic = basic.includes('name="gst"');
const gstAfterAadhaar = basic.indexOf('name="gst"') > basic.indexOf('name="aadhaar"');
console.log("\n3. GST field in BasicInformation:", gstInBasic ? "PRESENT" : "MISSING");
console.log("   GST positioned after Aadhaar/PAN:", gstAfterAadhaar ? "YES (correct)" : "NO (wrong position)");

// Issue 4: Gender label
const genderLabelMatch = basic.match(/label="([^"]*[Gg]ender[^"]*)"/);
console.log("\n4. Gender label text:", genderLabelMatch ? genderLabelMatch[1] : "NOT FOUND");
const genderHasFullWidth = basic.split('name="gender"')[1] && basic.split('name="gender"')[0].slice(-200).includes("select");
console.log("   Gender is a select dropdown:", genderHasFullWidth ? "YES" : "CHECK MANUALLY");

// Issue 5: Duplicate identity fields in ProfessionalInformation
const dupes = [
  { field: "aadhaar", count: (prof.match(/name="aadhaar"/g) || []).length },
  { field: "pan",     count: (prof.match(/name="pan"/g) || []).length },
  { field: "gender",  count: (prof.match(/name="gender"/g) || []).length },
  { field: "birthYear", count: (prof.match(/name="birthYear"/g) || []).length },
  { field: "age",     count: (prof.match(/name="age"/g) || []).length },
  { field: "organisation", count: (prof.match(/name="organisation"/g) || []).length },
];
console.log("\n5. Duplicate identity fields in ProfessionalInformation (all should be 0):");
dupes.forEach(d => {
  console.log("   " + d.field + ":", d.count === 0 ? "CLEAN" : "DUPLICATE FOUND (" + d.count + ")");
});

console.log("\n=== END AUDIT ===");
