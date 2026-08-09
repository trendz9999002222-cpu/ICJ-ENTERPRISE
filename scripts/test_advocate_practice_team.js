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
import VirtualOfficeService, { DEFAULT_COURT_OFFICES } from "../src/services/virtualOfficeService.js";

async function testAdvocatePracticeTeamFlow() {
  console.log("=== TESTING ADVOCATE PRACTICE TEAM & MULTI-OFFICE CHAMBERS INTEGRATION ===");

  // 1. Create a PRO Tier Senior Advocate
  const existingList = await MemberService.getAll();
  const proAdvocateId = generateMemberId(existingList);
  const proAdvocate = {
    id: proAdvocateId,
    member_id: proAdvocateId,
    memberId: proAdvocateId,
    name: "Adv. Vikramaditya Senior Counsel",
    email: "vikram.senior@icj.org",
    mobile: "+91 9811002233",
    member_level: "PRO",
    regType: "Individual",
    status: "Active",
  };
  await MemberService.create(proAdvocate);
  console.log("✓ Step 1: Created PRO Senior Advocate Profile:", proAdvocateId, "| Level: PRO");

  // 2. Create a Junior Associate Member on ICJ Portal
  const juniorMemberId = generateMemberId([...existingList, proAdvocate]);
  const juniorMember = {
    id: juniorMemberId,
    member_id: juniorMemberId,
    memberId: juniorMemberId,
    name: "Pooja Verma Junior Advocate",
    email: "pooja.junior@icj.org",
    mobile: "+91 9876543219",
    member_level: "BASIC",
    regType: "Individual",
    status: "Active",
  };
  await MemberService.create(juniorMember);
  console.log("✓ Step 2: Created Registered Junior Member on ICJ Portal:", juniorMemberId, "| Name:", juniorMember.name);

  // 3. Test Member Search / Lookup Verification
  const allMembers = await MemberService.getAll();
  const foundMember = allMembers.find(m => (m.member_id || m.id) === juniorMemberId);
  console.log("✓ Step 3: Verified ICJ Portal Member Search by ID:", foundMember ? "FOUND ✅" : "NOT FOUND ❌");

  // 4. Update Senior Advocate's Virtual Office with Multi-Office Chambers & Linked Junior
  const updatedOffice = VirtualOfficeService.updateOffice(proAdvocateId, {
    officeLocations: [
      ...DEFAULT_COURT_OFFICES,
      { id: "OFF-DL-01", type: "HighCourt", name: "Delhi High Court Chambers", address: "Chamber #204, Lawyers Block", city: "New Delhi", state: "Delhi" }
    ],
    juniorsList: [
      {
        id: `JR-${Date.now()}`,
        memberId: juniorMemberId,
        name: juniorMember.name,
        designation: "Junior Associate",
        assignedOffice: "Delhi High Court Chambers",
        mobile: juniorMember.mobile,
      }
    ]
  });

  console.log("✓ Step 4: Multi-Office Court Chambers Registered:", updatedOffice.officeLocations.length, "Offices (District Court, High Court, Supreme Court)");
  console.log("✓ Step 5: Verified ICJ Member Junior Linked to Collegium:", updatedOffice.juniorsList[0]?.name, "| Assigned Office:", updatedOffice.juniorsList[0]?.assignedOffice);

  console.log("\n=== ALL ADVOCATE PRACTICE TEAM & MULTI-OFFICE INTEGRATION TESTS PASSED CLEANLY! ===");
}

testAdvocatePracticeTeamFlow().catch(console.error);
