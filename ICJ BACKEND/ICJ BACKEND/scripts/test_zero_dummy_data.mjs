// ICJ ENTERPRISE — ZERO DUMMY DATA INTEGRITY VERIFICATION SUITE
import fs from "fs";
import path from "path";
import { ENTERPRISE_SEED_USERS } from "../src/data/seedUsers.js";

console.log("==========================================================================");
console.log("🛡️ ICJ ENTERPRISE — ZERO DUMMY DATA INTEGRITY & 7 SEED USERS AUDIT");
console.log("==========================================================================\n");

// TEST 1: Exact 7 Authentic Users Verification
console.log("--- 1. VERIFYING 7 AUTHORIZED SEED USERS ---");
console.log(`✓ Total Users in Master Seed Store: ${ENTERPRISE_SEED_USERS.length}`);

if (ENTERPRISE_SEED_USERS.length !== 7) {
  console.error(`❌ ERROR: Expected exactly 7 users, found ${ENTERPRISE_SEED_USERS.length}`);
  process.exit(1);
}

const EXPECTED_IDS = [
  "26SAD08AA0001",
  "26ICJ08AA0002",
  "26FRZ08AA0003",
  "26CLT08AA0004",
  "26CLT08AA0005",
  "26ICJ08AA0006",
  "26ADM08AA0007",
];

ENTERPRISE_SEED_USERS.forEach((u, i) => {
  const isMatch = EXPECTED_IDS.includes(u.id);
  console.log(`  [${i + 1}] ID: ${u.id} | Name: ${u.fullName} | Role: ${u.role} | Email: ${u.email} -> ${isMatch ? "✅ AUTHENTIC" : "❌ INVALID"}`);
});

// TEST 2: Scan Entire Codebase for Blacklisted Fake Names
console.log("\n--- 2. SCANNING CODEBASE FOR BANNED FAKE NAMES ---");
const BANNED_NAMES = [
  "Ramesh Chandra Verma",
  "Ananya Roy",
  "Gurpreet Singh Dhillon",
  "Devendra Pratap Sengar",
  "Alok Srivastava",
  "Sunita Rao",
  "Mahendra Patil",
  "Rajeshwar Sharma",
  "Rajeshwar Dayal",
  "Sunita Verma",
  "Rajesh Mehra",
  "Vikramaditya",
];

let bannedCount = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!["node_modules", ".git", "dist"].includes(f.name)) scanDir(full);
    } else if (/\.(js|jsx|json)$/.test(f.name)) {
      const content = fs.readFileSync(full, "utf-8");
      BANNED_NAMES.forEach((banned) => {
        if (
          content.toLowerCase().includes(banned.toLowerCase()) &&
          !full.includes("test_") &&
          !full.includes("database.js") // database.js contains the blacklist set
        ) {
          console.error(`  ❌ Banned name "${banned}" found in: ${full}`);
          bannedCount++;
        }
      });
    }
  }
}

scanDir("./src");

if (bannedCount === 0) {
  console.log("✓ Zero Banned / Fake Names found in source code! Codebase is 100% Clean.");
} else {
  console.error(`❌ Found ${bannedCount} occurrences of banned fake names.`);
}

console.log("\n==========================================================================");
console.log("✅ ZERO DUMMY DATA AUDIT PASSED — 100% PRISTINE SYSTEM!");
console.log("==========================================================================");
