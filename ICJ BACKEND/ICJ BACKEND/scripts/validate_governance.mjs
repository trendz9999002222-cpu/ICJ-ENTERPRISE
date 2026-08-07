import fs from 'fs';
import path from 'path';

console.log("=== EXECUTING DEVELOPER GOVERNANCE VALIDATION ===");

const routerFile = path.join(process.cwd(), 'src/router/index.jsx');
const content = fs.readFileSync(routerFile, 'utf8');

const routeMatches = Array.from(content.matchAll(/path="([^"]+)"/g)).map(m => m[1]);

console.log(`Discovered ${routeMatches.length} routes in AppRouter.`);
console.log("Validating Governance Self-Registration...");

const registeredCatalog = [
  "/", "/login", "/register", "/recovery", "/super-admin-dashboard", "/membership",
  "/member-registration", "/member-directory", "/member-verification", "/member-documents",
  "/member-wallet", "/member-kyc", "/member-identity", "/member-certificates", "/member-history",
  "/member-activity", "/member-settings", "/member-card", "/identity", "/documents", "/wallet",
  "/token", "/donation", "/settings", "/activity-log", "/transactions", "/member-profile",
  "/notifications", "/reports", "/legal", "/ai", "/research", "/administration", "/finance",
  "/advocate-dashboard", "/client-portal", "/trust-dashboard", "/court-calendar", "/billing",
  "/ai-drafter", "/payment-management", "/location-master", "/database-config", "/governance-center", "/api-config", "/deployment-center", "/system-health"
];

const unregistered = routeMatches.filter(r => !registeredCatalog.includes(r));

if (unregistered.length > 0) {
  console.error("❌ DEVELOPER GOVERNANCE VALIDATION ERROR!");
  console.error(`Unregistered routes detected: ${unregistered.join(', ')}`);
  process.exit(1);
}

console.log("🟢 100% GOVERNANCE VALIDATED! All routes auto-registered & governed.");
process.exit(0);
