import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

let playwright;
try {
  playwright = await import("playwright");
} catch (error) {
  const runtimeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!runtimeModules) throw error;
  playwright = await import(pathToFileURL(path.join(runtimeModules, "playwright", "index.js")).href);
}

const { chromium } = playwright.default ?? playwright;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const source = path.join(projectDir, "assets", "mockups.html");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(source).href, { waitUntil: "load" });

for (const id of ["dashboard-overview", "automation-workflow", "weekly-report"]) {
  await page.locator(`#${id}`).screenshot({
    path: path.join(projectDir, "assets", `${id}.png`),
    type: "png",
  });
}

await browser.close();
