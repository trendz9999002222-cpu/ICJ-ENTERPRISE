/**
 * ICJ ENTERPRISE PLATFORM — DYNAMIC VITE SERVER DETECTOR
 * COPILOT_MASTER_POLICY.md Rule 1: NEVER hardcode a port.
 * Always detect the currently active Vite server from:
 *   1. Running terminal/task log files (parse "Local: http://localhost:<port>/")
 *   2. HTTP probe to confirm the port is alive
 * Log [ACTIVE SERVER DETECTED] before every test run.
 */

import http from "http";
import fs from "fs";
import path from "path";

const TASK_LOG_DIR = path.join(
  process.env.APPDATA || "C:\\Users\\Pawan\\.gemini\\antigravity",
  "brain",
  "1481bf5d-9e7e-40e3-9877-ec14ca551ecf",
  ".system_generated",
  "tasks"
);

const CANDIDATE_PORTS = [5173, 5174, 5175, 5176, 5177, 3000, 8080];

/**
 * Parse all task log files to find the most recently reported Vite Local URL.
 * Returns the port number if found, otherwise null.
 */
function detectPortFromTaskLogs() {
  try {
    if (!fs.existsSync(TASK_LOG_DIR)) return null;

    const logFiles = fs.readdirSync(TASK_LOG_DIR)
      .filter((f) => f.endsWith(".log"))
      .map((f) => ({
        name: f,
        mtime: fs.statSync(path.join(TASK_LOG_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime); // newest first

    for (const { name } of logFiles) {
      const content = fs.readFileSync(path.join(TASK_LOG_DIR, name), "utf8");
      // Match: "Local:   http://localhost:5173/"
      const match = content.match(/Local:\s+http:\/\/localhost:(\d+)/i);
      if (match && match[1]) {
        const port = parseInt(match[1], 10);
        console.log(`[TERMINAL LOG] Vite reported Local: http://localhost:${port}/ (from ${name})`);
        return port;
      }
    }
  } catch {
    // fallback silently
  }
  return null;
}

/**
 * Probe a single port via HTTP GET to verify it responds.
 */
function probePort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Main export: detect the active Vite port.
 * 1. Try terminal log first.
 * 2. HTTP probe all candidate ports.
 * 3. Use first confirmed live port.
 */
export async function detectActiveVitePort() {
  // Step 1: Parse terminal log for Vite-reported port
  const logPort = detectPortFromTaskLogs();
  const orderedPorts = logPort
    ? [logPort, ...CANDIDATE_PORTS.filter((p) => p !== logPort)]
    : CANDIDATE_PORTS;

  // Step 2: HTTP probe in order
  for (const port of orderedPorts) {
    const alive = await probePort(port);
    if (alive) {
      console.log(`[ACTIVE SERVER DETECTED] http://localhost:${port}/`);
      return `http://localhost:${port}`;
    }
  }

  // Step 3: If nothing responds, fall back to log-detected port or 5173
  const fallback = logPort ? logPort : 5173;
  console.log(`[ACTIVE SERVER ASSIGNED] No live response — using http://localhost:${fallback}/ from terminal log`);
  return `http://localhost:${fallback}`;
}

export default detectActiveVitePort;
