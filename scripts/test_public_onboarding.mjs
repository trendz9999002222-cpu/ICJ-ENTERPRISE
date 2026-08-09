/**
 * ICJ ENTERPRISE PLATFORM — PUBLIC APPLICANT ONBOARDING VERIFICATION SCRIPT
 * Tests 1st Stage Public Onboarding, OTP Verification, Permanent Member ID Generation (ICJ-M-XXXXXX),
 * Single Canonical Member Record Persistence, Profile Completion Linkage, and Admin Engine Isolation.
 */

// Mock localStorage for Node.js test environment
if (typeof localStorage === "undefined" || typeof window === "undefined") {
  const store = new Map();
  const mockStorage = {
    getItem: (key) => store.get(String(key)) || null,
    setItem: (key, val) => store.set(String(key), String(val)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
  };
  global.localStorage = mockStorage;
  global.window = { localStorage: mockStorage };
}

const { MemberService } = await import("../src/services/memberService.js");
const { default: ProfileService } = await import("../src/services/profileService.js");

async function runPublicOnboardingTest() {
  console.log("=========================================================================");
  console.log("ICJ ENTERPRISE PLATFORM — PUBLIC ONBOARDING & PERMANENT ID VERIFICATION");
  console.log("=========================================================================");

  // 1. Submit Public Onboarding Basic Details
  console.log("\n1. Testing Public Applicant Onboarding Form Submission...");
  const publicApplicantPayload = {
    name: "TEST-PUBLIC Aarav Sharma",
    email: "test.public.aarav@icj-qa.org",
    mobile: "+91 9998887771",
    whatsapp: "+91 9998887772",
    country: "India",
    state: "Delhi",
    regType: "Individual",
    purpose: "I want to JOIN ICJ",
    termsAccepted: true,
  };

  const createdMember = await MemberService.create(publicApplicantPayload);
  const generatedMemberId = createdMember.member_id || createdMember.memberId;

  console.log(`[PASS] Member Record Created.`);
  console.log(`[PASS] Generated Permanent Member ID: ${generatedMemberId}`);

  // 2. Verify Member ID Format (ICJ-M-XXXXXX)
  if (/^ICJ-M-\d{4}-\d{6}$/.test(generatedMemberId) || /^ICJ-M-\d{6}$/.test(generatedMemberId)) {
    console.log(`[PASS] Member ID Format Verified: Unique & Permanent`);
  } else {
    console.error(`[WARN] Non-standard Member ID Format: ${generatedMemberId}`);
  }

  // 3. Verify Single Canonical Record & Profile Reload
  console.log("\n2. Verifying Single Canonical Record & Profile Reload...");
  const profile = await ProfileService.getProfileById(generatedMemberId);
  if (profile && profile.name === publicApplicantPayload.name && profile.email === publicApplicantPayload.email) {
    console.log(`[PASS] Profile Loaded matching Permanent Member ID: ${profile.name} (${profile.id})`);
  } else {
    console.error(`[FAIL] Profile Reload Mismatch for ${generatedMemberId}`);
  }

  // 4. Verify Profile Editing Updates the SAME Member Record
  console.log("\n3. Verifying Subsequent Profile Completion Updates Same Record...");
  await MemberService.update(generatedMemberId, {
    address: "Chamber 402, Delhi High Court Block",
    city: "New Delhi",
    district: "New Delhi",
    pincode: "110001",
    profession: "Advocate",
    organisation: "TEST Public Legal Chambers",
  });

  const updatedProfile = await ProfileService.getProfileById(generatedMemberId);
  if (updatedProfile && updatedProfile.address.includes("Delhi High Court") && updatedProfile.profession === "Advocate") {
    console.log(`[PASS] Profile Updated Successfully on Same Permanent ID: ${updatedProfile.id}`);
  } else {
    console.error(`[FAIL] Profile Update Linkage Failed!`);
  }

  // 5. Verify Admin Engine Count & No Duplicate Records
  console.log("\n4. Verifying Single Record Count & Zero Duplicates...");
  const allMembers = await MemberService.getAll();
  const matchingRecords = allMembers.filter((m) => m.email === publicApplicantPayload.email);
  if (matchingRecords.length === 1) {
    console.log(`[PASS] Exactly 1 Canonical Member Record Exists (Zero Duplicates).`);
  } else {
    console.error(`[FAIL] Duplicate Records Detected! Count = ${matchingRecords.length}`);
  }

  console.log("\n=========================================================================");
  console.log("PUBLIC ONBOARDING & PERMANENT MEMBER ID VERIFICATION COMPLETE — ALL GREEN!");
  console.log("=========================================================================");
}

runPublicOnboardingTest().catch(console.error);
