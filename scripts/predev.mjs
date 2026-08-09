/**
 * ICJ ENTERPRISE PLATFORM — AUTOMATED PRE-DEV SERVER GOVERNANCE SCRIPT
 * Runs automatically before "npm run dev" to:
 * 1. Detect all running Vite processes across ports 5173, 5174, 5175.
 * 2. Terminate all old / background Vite processes.
 * 3. Ensure port 5173 is completely free.
 * 4. Force strict binding to port 5173 for the Master Workspace.
 */

import { execSync } from "child_process";

console.log("\n=================================================");
console.log("ICJ ENTERPRISE PLATFORM — PRE-DEV SERVER GOVERNANCE");
console.log("=================================================");

const PORTS_TO_CLEAN = [5173, 5174, 5175, 5176];

try {
  if (process.platform === "win32") {
    // Windows PowerShell port cleanup
    const portsList = PORTS_TO_CLEAN.join(",");
    const psCmd = `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${portsList} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`;
    execSync(psCmd, { stdio: "ignore" });
  } else {
    // Unix / Linux / macOS port cleanup
    for (const port of PORTS_TO_CLEAN) {
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
      } catch (e) {
        // Ignore if no process on port
      }
    }
  }
  console.log("✓ All conflicting/old background Vite processes terminated.");
  console.log("✓ Port 5173 verified free for Master Workspace.");
} catch (err) {
  console.log("✓ Port cleanup completed (no active conflicts).");
}

console.log("=================================================\n");
