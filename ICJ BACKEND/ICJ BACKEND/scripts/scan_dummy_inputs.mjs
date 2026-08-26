import fs from "fs";
import path from "path";

console.log("=== COMPREHENSIVE SCAN FOR UNLINKED DUMMY INPUTS, AUTO-INJECTED SECTIONS & AGE/DOB ISSUES ===");

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const hits = [];

  lines.forEach((line, idx) => {
    const l = line.trim();
    // 1. Check for hardcoded mock date of births like 15-May-1980 or 1980-05-15
    if (/(dob|dateOfBirth|birthDate)\s*:\s*["'][0-9]{4}-[0-9]{2}-[0-9]{2}["']/i.test(l) ||
        /15-May|12-May|15 May|12 May/i.test(l)) {
      hits.push({ type: "HARDCODED_DOB_DATE", line: idx + 1, text: l });
    }
    // 2. Check for pre-filled hardcoded sections/statutes without user input
    if (/(defaultSections|ipcSections|statutorySections)\s*:\s*\[/i.test(l) ||
        /(applicableSections|suggestedSections)\s*:\s*\[\s*["'](IPC|BNS|BNSS|CPC)/i.test(l)) {
      hits.push({ type: "PRE_FILLED_SECTIONS", line: idx + 1, text: l });
    }
    // 3. Check for hardcoded fallback advocate names or mock case templates that pop up automatically
    if (/(defaultAdvocate|fallbackAdvocate|mockCase|sampleCase)\s*:\s*\{/i.test(l)) {
      hits.push({ type: "AUTO_INJECTED_MOCK_ENTITY", line: idx + 1, text: l });
    }
  });

  if (hits.length > 0 && !filePath.includes("test_") && !filePath.includes("scripts/")) {
    console.log(`\n📁 File: ${filePath}`);
    hits.forEach((h) => {
      console.log(`  L${h.line} [${h.type}]: ${h.text.substring(0, 100)}`);
    });
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const f of files) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!["node_modules", ".git", "dist"].includes(f.name)) scanDir(full);
    } else if (/\.(js|jsx|json)$/.test(f.name)) {
      scanFile(full);
    }
  }
}

scanDir("./src");
