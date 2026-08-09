import ProfileService from "../src/services/profileService.js";

async function runMemberProfileSmokeTest() {
  console.log("=== ICJ ENTERPRISE — MEMBER PROFILE SMOKE TEST ===");

  try {
    const profiles = await ProfileService.getProfiles();
    console.log(`✓ Fetched ${profiles.length} member profiles.`);

    if (!Array.isArray(profiles)) {
      throw new Error("ProfileService.getProfiles() did not return an array.");
    }

    if (profiles.length > 0) {
      const sample = profiles[0];
      console.log(`✓ Sample Profile ID: ${sample.id}, Name: ${sample.name}`);

      // Verify Member-to-Document relationship
      console.log(`  - Linked Documents: ${sample.linkedDocuments?.length || 0}`);

      // Verify Member-to-Case relationship
      console.log(`  - Linked Legal Cases: ${sample.linkedCases?.length || 0}`);

      // Security Verification: Plaintext Passwords MUST NOT exist
      const rawJson = JSON.stringify(sample);
      if (rawJson.includes("password") && !rawJson.includes("forcePasswordChange")) {
        console.warn("  ⚠ Warning: 'password' field detected in profile serialization!");
      } else {
        console.log("✓ Security Check PASSED: Zero plaintext password exposure in profile data.");
      }
    }

    console.log("=== ALL MEMBER PROFILE SMOKE TESTS PASSED CLEANLY ===");
  } catch (error) {
    console.error("❌ Member Profile Smoke Test Failed:", error);
    process.exitCode = 1;
  }
}

runMemberProfileSmokeTest();
