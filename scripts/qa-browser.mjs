import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

let playwright;
try {
  playwright = await import("playwright");
} catch (error) {
  const runtimeModules = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
  if (!runtimeModules) throw error;
  playwright = await import(pathToFileURL(path.join(runtimeModules, "playwright", "index.js")).href);
}

const { chromium } = playwright.default ?? playwright;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(process.env.CASE_STUDY_URL || "http://localhost:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/ad-to-revenue-desktop.png", fullPage: true });

await page.locator("#lead-form button[type=submit]").click();
await page.getByText("Hot · 100/100").waitFor();
assert.match(await page.locator("#crm-output").textContent(), /"qualification_band": "Hot"/);

await page.locator("#book-call").click();
assert.match(await page.locator("#crm-output").textContent(), /"stage": "Booked Call"/);

await page.locator("#mark-won").click();
assert.match(await page.locator("#crm-output").textContent(), /"closed_revenue": 14000/);

await page.locator('[data-tab="events"]').click();
assert.match(await page.locator("#event-output").textContent(), /"event": "closed_won"/);
assert.equal(errors.length, 0, `Browser errors: ${errors.join(" | ")}`);

await page.screenshot({ path: "/tmp/ad-to-revenue-completed.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(process.env.CASE_STUDY_URL || "http://localhost:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/ad-to-revenue-mobile.png", fullPage: true });
await browser.close();

console.log("Browser QA passed: form → qualification → booked call → closed revenue");
