import fs from "fs";
import path from "path";
import JavaScriptObfuscator from "javascript-obfuscator";

function isTruthyEnv(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return false;
  return text !== "0" && text !== "false" && text !== "no" && text !== "off";
}

function isSentryConfigured() {
  return Boolean(String(process.env.SENTRY_AUTH_TOKEN || "").trim()) &&
    Boolean(String(process.env.SENTRY_ORG || "").trim()) &&
    Boolean(String(process.env.SENTRY_PROJECT || "").trim());
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, results);
      continue;
    }

    if (!entry.isFile()) continue;
    if (!full.endsWith(".js")) continue;
    if (full.endsWith(".min.js")) continue;
    if (full.endsWith(".map.js")) continue;
    if (full.includes(`${path.sep}.`)) continue;

    results.push(full);
  }
  return results;
}

function getObfuscationOptions() {
  const aggressive = isTruthyEnv(process.env.OBFUSCATE_AGGRESSIVE);

  return {
    compact: true,
    simplify: true,
    numbersToExpressions: true,
    stringArray: true,
    stringArrayThreshold: aggressive ? 1 : 0.75,
    splitStrings: true,
    splitStringsChunkLength: aggressive ? 6 : 10,
    transformObjectKeys: aggressive,
    rotateStringArray: true,
    selfDefending: aggressive,
    controlFlowFlattening: aggressive,
    controlFlowFlatteningThreshold: aggressive ? 0.75 : 0,
    deadCodeInjection: aggressive,
    deadCodeInjectionThreshold: aggressive ? 0.2 : 0,
    debugProtection: false,
    debugProtectionInterval: 0,
    renameGlobals: false,
    sourceMap: false,
  };
}

function obfuscateFile(filePath, options) {
  const input = fs.readFileSync(filePath, "utf8");
  const output = JavaScriptObfuscator.obfuscate(input, options).getObfuscatedCode();
  fs.writeFileSync(filePath, output, "utf8");
}

const distDir = path.resolve(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
  console.error(`[obfuscate] dist/ not found at: ${distDir}`);
  process.exitCode = 1;
  process.exit();
}

if (isSentryConfigured()) {
  console.log("[obfuscate] Sentry is configured; skipping obfuscation to avoid sourcemap mismatch.");
  process.exit(0);
}

const options = getObfuscationOptions();
const files = walk(distDir);

if (files.length === 0) {
  console.log("[obfuscate] No JS files found to obfuscate.");
  process.exit(0);
}

console.log(`[obfuscate] Obfuscating ${files.length} JS file(s) in dist/ ...`);
for (const filePath of files) {
  try {
    obfuscateFile(filePath, options);
  } catch (error) {
    console.error(`[obfuscate] Failed: ${filePath}`);
    console.error(error);
    process.exitCode = 1;
  }
}

if (process.exitCode !== 1) {
  console.log("[obfuscate] Done.");
}
