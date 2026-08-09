const store = new Map();
global.window = {
  localStorage: {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
};

import MemberService, { generateMemberId } from "../src/services/memberService.js";
import PasswordPolicyService from "../src/services/passwordPolicyService.js";
import AuthService from "../src/services/authService.js";

async function testOnboardingFlows() {
  console.log("--- TESTING INDIVIDUAL ONBOARDING FLOW ---");
  const existingList = await MemberService.getAll();
  const indMemberId = generateMemberId(existingList);
  
  const indPayload = {
    id: indMemberId,
    member_id: indMemberId,
    memberId: indMemberId,
    username: indMemberId,
    password: "TestPassword123!",
    passwordHash: PasswordPolicyService.hashPassword("TestPassword123!"),
    namePrefix: "Mr.",
    name: "Mr. Test Individual User",
    fullName: "Mr. Test Individual User",
    firstName: "Test",
    lastName: "User",
    gender: "Male",
    dob: "1995-05-15",
    birthYear: "1995",
    age: "31",
    email: "test.ind@example.com",
    mobile: "+91 9876543210",
    memberType: "individual",
    regType: "Individual",
    role: "member",
    purpose: "Your Problem, Our Solution.",
    problemCategory: "Legal Dispute",
    verification_status: "Approved",
    status: "Active",
    ready_for_login: true,
    policyAccepted: true,
    created_at: new Date().toISOString()
  };

  const indResult = await MemberService.create(indPayload);
  console.log("✓ Individual Member Created Successfully:", indResult.memberId, "| Name:", indResult.name);

  console.log("\n--- TESTING INSTITUTIONAL / ORGANISATION ONBOARDING FLOW ---");
  const orgMemberId = generateMemberId([...existingList, indResult]);
  
  const orgPayload = {
    id: orgMemberId,
    member_id: orgMemberId,
    memberId: orgMemberId,
    username: orgMemberId,
    password: "OrgPassword123!",
    passwordHash: PasswordPolicyService.hashPassword("OrgPassword123!"),
    name: "Global Legal Solutions Pvt Ltd",
    fullName: "Global Legal Solutions Pvt Ltd",
    orgName: "Global Legal Solutions Pvt Ltd",
    email: "contact@globallegal.org",
    mobile: "+91 9123456789",
    memberType: "organisation",
    regType: "Organisation",
    role: "member",
    purpose: "ICJ, The Solution World.",
    serviceCategory: "Contract Drafting & Review",
    verification_status: "Approved",
    status: "Active",
    ready_for_login: true,
    policyAccepted: true,
    created_at: new Date().toISOString()
  };

  const orgResult = await MemberService.create(orgPayload);
  console.log("✓ Institutional Member Created Successfully:", orgResult.memberId, "| Name:", orgResult.name);

  console.log("\n--- VERIFYING LOGIN AUTHENTICATION FOR BOTH CREATED USERS ---");
  const indAuth = await AuthService.login({ username: indMemberId, password: "TestPassword123!" });
  console.log("✓ Individual Login Auth: SUCCESS ✅ | Member ID:", indAuth.member_id, "| User Name:", indAuth.name);

  const orgAuth = await AuthService.login({ username: orgMemberId, password: "OrgPassword123!" });
  console.log("✓ Institutional Login Auth: SUCCESS ✅ | Member ID:", orgAuth.member_id, "| Organisation Name:", orgAuth.name);
}

testOnboardingFlows().catch(console.error);
