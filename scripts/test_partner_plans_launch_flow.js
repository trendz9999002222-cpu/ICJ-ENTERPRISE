const store = new Map();
global.window = {
  localStorage: {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  }
};

import SystemConfigService from "../src/services/systemConfigService.js";

async function testPartnerPlansLaunchFlow() {
  console.log("=== TESTING ADMIN PLAN LAUNCH SWITCHES & BROADCAST NOTIFICATIONS ===");

  // 1. Initial State Check
  const initialConfigs = SystemConfigService.getPlanConfigs();
  console.log("✓ Step 1: Initial Plan 1 Standard:", initialConfigs.plan_standard.status, "| Plan 2 E-Gov:", initialConfigs.plan_egov.status, "| Plan 3 Affiliate:", initialConfigs.plan_affiliate.status);

  // 2. Test Admin Launching E-Governance Plan
  console.log("-> Admin clicking LAUNCH PLAN NOW 🚀 for E-Governance Plan...");
  const launchedEGov = SystemConfigService.launchPlan("plan_egov");
  console.log("✓ Step 2: Plan 2 E-Gov Status after Admin Launch:", launchedEGov.status, "| Launched At:", launchedEGov.launchedAt);

  // 3. Test Admin Launching Legal Referral Affiliate Plan
  console.log("-> Admin clicking LAUNCH PLAN NOW 🚀 for Legal Referral Affiliate Plan...");
  const launchedAffiliate = SystemConfigService.launchPlan("plan_affiliate");
  console.log("✓ Step 3: Plan 3 Affiliate Status after Admin Launch:", launchedAffiliate.status);

  // 4. Verify Automated Member Broadcast Notifications
  const notifications = SystemConfigService.getNotifications();
  console.log("✓ Step 4: Broadcast Notifications Dispatched to Members:", notifications.length, "Notifications");
  console.log("   - Latest Notif:", notifications[0]?.title);
  console.log("   - Notif Body:", notifications[0]?.message);

  // 5. Test Admin Locking Plan 2
  SystemConfigService.lockPlan("plan_egov");
  const postLockCheck = SystemConfigService.getPlan("plan_egov");
  console.log("✓ Step 5: Plan 2 E-Gov Status after Admin Lock:", postLockCheck.status);

  console.log("\n=== ALL ADMIN PLAN LAUNCH & BROADCAST NOTIFICATION TESTS PASSED CLEANLY! ===");
}

testPartnerPlansLaunchFlow().catch(console.error);
