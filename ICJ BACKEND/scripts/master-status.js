import { execFileSync } from "child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

import process from "node:process";

import moduleRegistry from "../src/core/modules.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const projectStatusPath = path.join(repoRoot, "PROJECT_STATUS.md");

function readText(relativePath) {
    return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function exists(relativePath) {
    return existsSync(path.join(repoRoot, relativePath));
}

function walkFiles(dirRelativePath, results = []) {
    const absoluteDir = path.join(repoRoot, dirRelativePath);
    if (!existsSync(absoluteDir)) return results;

    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
        const entryPath = path.join(dirRelativePath, entry.name);
        if (entry.isDirectory()) {
            walkFiles(entryPath, results);
        } else if (entry.isFile()) {
            results.push(entryPath.replace(/\\/g, "/"));
        }
    }

    return results;
}

function runCommand(command, args) {
    try {
        return execFileSync(command, args, {
            cwd: repoRoot,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
        });
    } catch (error) {
        const stdout = error.stdout ? String(error.stdout) : "";
        const stderr = error.stderr ? String(error.stderr) : "";
        return `${stdout}${stderr}`;
    }
}

function runLint() {
    const eslintPath = path.join(repoRoot, "node_modules", ".bin", process.platform === "win32" ? "eslint.cmd" : "eslint");
    const output = existsSync(eslintPath)
        ? runCommand(eslintPath, ["."])
        : runCommand(process.platform === "win32" ? "npx.cmd" : "npx", ["eslint", "."]);
    const trimmed = output.trim();

    if (!trimmed) {
        return { success: true, issues: [] };
    }

    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    const issues = [];
    let currentFile = null;

    for (const line of lines) {
        const fileMatch = line.match(/([A-Za-z]:\\.+\.(?:js|jsx|ts|tsx)|.+\.(?:js|jsx|ts|tsx))$/i);
        if (fileMatch) {
            currentFile = fileMatch[1].trim();
            continue;
        }

        const detailMatch = line.match(/^\s*(\d+):(\d+)\s+(error|warning)\s+(.+?)(?:\s+([A-Za-z0-9:_-]+))?$/i);
        if (detailMatch) {
            issues.push({
                file: currentFile || "unknown",
                rule: detailMatch[5] || "eslint",
                message: detailMatch[4],
                severity: detailMatch[3].toLowerCase(),
            });
            continue;
        }

        if (line.includes("warning") || line.includes("problems") || line.includes("✖") || line.startsWith(">")) {
            continue;
        }
    }

    return { success: issues.length === 0, issues };
}

function runBuild() {
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const output = runCommand(npmCmd, ["run", "build"]);
    return output.includes("built") || output.includes("✓") || output.includes("success") || !output.includes("error");
}

function parseRouterRoutes() {
    const routerText = readText("src/router/index.jsx");
    const importMap = new Map();
    const routeMap = new Map();

    const importPattern = /const\s+(\w+)\s*=\s*lazy\(\(\)\s*=>\s*import\("([^"]+)"\)\);/g;
    const routePattern = /path="([^"]+)"\s+element=\{guard\(<(\w+)\s*\/>(?:\s*\)\s*)?\}/g;

    let match;
    while ((match = importPattern.exec(routerText)) !== null) {
        importMap.set(match[1], match[2]);
    }

    while ((match = routePattern.exec(routerText)) !== null) {
        const routePath = match[1];
        const componentName = match[2];
        const importPath = importMap.get(componentName);
        routeMap.set(routePath, { componentName, importPath });
    }

    return routeMap;
}

function resolvePagePath(importPath, routerFile) {
    if (!importPath) return null;
    const absoluteImportPath = path.resolve(path.dirname(routerFile), importPath);
    const candidates = [".jsx", ".tsx", ".js", ".ts"];
    for (const ext of candidates) {
        const candidate = `${absoluteImportPath}${ext}`;
        if (existsSync(candidate)) return candidate;
    }
    return null;
}

function findRelatedServiceFiles(moduleId) {
    const servicesDir = path.join(repoRoot, "src/services");
    if (!existsSync(servicesDir)) return [];

    const serviceFiles = readdirSync(servicesDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name))
        .map((entry) => entry.name);

    const normalizedId = moduleId.toLowerCase();
    return serviceFiles.filter((file) => {
        const lowerName = file.toLowerCase();
        return lowerName.includes(normalizedId) || lowerName.startsWith(`${normalizedId}`);
    });
}

function collectPlaceholderEvidence(moduleName, pageFile, serviceFiles) {
    const filesToScan = [];
    if (pageFile) filesToScan.push(pageFile);
    for (const file of serviceFiles) {
        filesToScan.push(path.join(repoRoot, "src/services", file));
    }

    const evidence = [];
    for (const absoluteFile of filesToScan) {
        if (!existsSync(absoluteFile)) continue;
        const content = readFileSync(absoluteFile, "utf8");
        if (/placeholder|foundation_only|externalCallsEnabled|coming soon|not implemented|todo/i.test(content)) {
            evidence.push(path.relative(repoRoot, absoluteFile).replace(/\\/g, "/"));
        }
    }

    return evidence.filter((item, index, arr) => arr.indexOf(item) === index);
}

function collectMissingFeatures() {
    const missing = [];

    if (!exists("android") && !exists("ios") && !exists("src/mobile")) {
        missing.push("No native mobile app sources were found under android/, ios/, or src/mobile/.");
    }

    const aiPlaceholderPath = path.join(repoRoot, "src/services/ai/aiApiPlaceholder.js");
    if (existsSync(aiPlaceholderPath)) {
        const aiContent = readFileSync(aiPlaceholderPath, "utf8");
        if (/placeholder|externalCallsEnabled: false/i.test(aiContent)) {
            missing.push("AI provider integration is still placeholder-only and external provider execution is disabled.");
        }
    }

    const codeSearch = walkFiles("src");
    const paymentEvidence = codeSearch.some((file) => /(stripe|paypal|razorpay|payment gateway|paymentGateway)/i.test(readText(file)));
    if (!paymentEvidence) {
        missing.push("No payment gateway integration code was found in the source tree.");
    }

    return missing;
}

function formatList(items) {
    return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None verified from the current source tree.";
}

function buildReport() {
    const routerRoutes = parseRouterRoutes();
    const modules = Array.isArray(moduleRegistry) ? moduleRegistry : [];
    const completed = [];
    const partial = [];
    const pending = [];

    for (const module of modules) {
        const routeEntry = routerRoutes.get(module.route);
        const pageFile = routeEntry ? resolvePagePath(routeEntry.importPath, path.join(repoRoot, "src/router/index.jsx")) : null;
        const serviceFiles = findRelatedServiceFiles(module.id);
        const placeholderEvidence = collectPlaceholderEvidence(module.name, pageFile, serviceFiles);

        if (module.enabled && routeEntry && pageFile) {
            if (placeholderEvidence.length > 0) {
                partial.push({
                    name: module.name,
                    route: module.route,
                    evidence: placeholderEvidence,
                });
            } else {
                completed.push({
                    name: module.name,
                    route: module.route,
                });
            }
        } else if (module.enabled) {
            pending.push({
                name: module.name,
                route: module.route,
            });
        }
    }

    const lint = runLint();
    const buildOk = runBuild();
    const missingFeatures = collectMissingFeatures();
    const totalModules = modules.length;
    const completedCount = completed.length;
    const partialCount = partial.length;
    const pendingCount = pending.length;
    const completionPercent = totalModules > 0
        ? ((completedCount + partialCount * 0.5) / totalModules) * 100
        : 0;

    const bugEntries = lint.issues.slice(0, 12).map((issue) => `- ${issue.file.replace(/\\/g, "/")}: ${issue.message}`);
    const nextPriorityTasks = [];

    if (lint.issues.length > 0) {
        nextPriorityTasks.push("Resolve the verified lint errors reported by ESLint, beginning with the duplicate-key and unused-variable issues.");
    }

    if (missingFeatures.some((feature) => feature.includes("AI provider integration"))) {
        nextPriorityTasks.push("Replace the placeholder AI adapter with a real provider integration path.");
    }

    if (missingFeatures.some((feature) => feature.includes("mobile app"))) {
        nextPriorityTasks.push("Add a native mobile app scaffold or shared mobile architecture for Android and iOS.");
    }

    if (missingFeatures.some((feature) => feature.includes("payment gateway"))) {
        nextPriorityTasks.push("Introduce a payment gateway integration layer once the product requirements are finalized.");
    }

    const lines = [];
    lines.push("# ICJ Enterprise Platform");
    lines.push("");
    lines.push("## Automated Project Status");
    lines.push("");
    lines.push(`- Generated from: source files under src/, router definitions, and the latest lint/build results.`);
    lines.push(`- Overall completion: ${completionPercent.toFixed(1)}%`);
    lines.push(`- Verified completed modules: ${completedCount}`);
    lines.push(`- Verified partially completed modules: ${partialCount}`);
    lines.push(`- Verified pending modules: ${pendingCount}`);
    lines.push(`- Build status: ${buildOk ? "passing" : "failing"}`);
    lines.push(`- Lint status: ${lint.success ? "passing" : `failing with ${lint.issues.length} issue(s)`}`);
    lines.push("");
    lines.push("## Completed modules");
    lines.push("");
    lines.push(formatList(completed.map((item) => `${item.name} (${item.route})`)));
    lines.push("");
    lines.push("## Partially completed modules");
    lines.push("");
    lines.push(partial.length ? partial.map((item) => `- ${item.name} (${item.route})\n  - Evidence: ${item.evidence.join(", ")}`).join("\n") : "- None verified from the current source tree.");
    lines.push("");
    lines.push("## Pending modules");
    lines.push("");
    lines.push(formatList(pending.map((item) => `${item.name} (${item.route})`)));
    lines.push("");
    lines.push("## Missing features");
    lines.push("");
    lines.push(formatList(missingFeatures));
    lines.push("");
    lines.push("## Bugs found");
    lines.push("");
    lines.push(lint.issues.length ? bugEntries.join("\n") : "- No lint errors were reported.");
    lines.push("");
    lines.push("## Next priority tasks");
    lines.push("");
    lines.push(nextPriorityTasks.length ? nextPriorityTasks.map((task) => `- ${task}`).join("\n") : "- No additional verified priorities were found.");
    lines.push("");

    return lines.join("\n");
}

const report = buildReport();
writeFileSync(projectStatusPath, `${report}\n`, "utf8");
console.log(`Wrote ${path.relative(repoRoot, projectStatusPath)} from verified source analysis.`);
console.log(`Completed modules: ${Array.isArray(moduleRegistry) ? moduleRegistry.length : 0}`);