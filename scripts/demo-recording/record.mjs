#!/usr/bin/env node
/**
 * Records a real browser session against the Unicis demo and produces a
 * .webm video that convert-to-gif.sh turns into a GitHub-README-ready GIF.
 *
 * The walkthrough step is tuned for the real Unicis Platform DOM (single-page
 * login form, sidebar routes like /teams/{team}/csc, and the "Choose a
 * status" control filter) — adjust the walkthrough section if you want to
 * show a different workflow.
 *
 * Usage:
 *   DEMO_URL=https://platform.unicis.tech \
 *   DEMO_EMAIL=your-demo-account@example.com \
 *   DEMO_PASSWORD=yourpassword \
 *   DEMO_TEAM=unicis-demo \
 *   node scripts/demo-recording/record.mjs
 *
 * DEMO_TEAM is the team slug from its dashboard URL (/teams/<slug>/dashboard).
 * Accounts belonging to more than one team land on an "All Teams" picker
 * after login — DEMO_TEAM is optional and defaults to "unicis-demo"; set it
 * if your demo account's team has a different slug.
 *
 * Never commit real credentials — pass them as environment variables at
 * runtime, and use a dedicated demo/seed account.
 */

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = path.join(__dirname, "recordings");

const DEMO_URL = process.env.DEMO_URL;
const DEMO_EMAIL = process.env.DEMO_EMAIL;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD;
const DEMO_TEAM = process.env.DEMO_TEAM || "unicis-demo";

if (!DEMO_URL || !DEMO_EMAIL || !DEMO_PASSWORD) {
  console.error(
    "Missing required env vars. Usage:\n" +
      "  DEMO_URL=https://platform.unicis.tech DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/demo-recording/record.mjs"
  );
  process.exit(1);
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: RECORDINGS_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  try {
    // --- Login (single-page form: email + password + one submit) ---
    console.log(`Opening ${DEMO_URL} ...`);
    await page.goto(DEMO_URL);
    await page.fill('input[name="email"]', DEMO_EMAIL);
    await page.fill('input[name="password"]', DEMO_PASSWORD);

    console.log("Signing in...");
    await page.click('button[type="submit"]');

    // Accounts that belong to more than one team land on an "All Teams"
    // picker after login instead of going straight to a team dashboard.
    // Wait for either outcome and select the team if needed.
    const teamLink = `a[href="/teams/${DEMO_TEAM}/dashboard"]`;
    const sidebarReady = page.waitForSelector('a[href$="/csc"]').then(() => "sidebar");
    const teamPicker = page.waitForSelector(teamLink).then(() => "team-picker");
    sidebarReady.catch(() => {});
    teamPicker.catch(() => {});

    const landedOn = await Promise.race([sidebarReady, teamPicker]);
    if (landedOn === "team-picker") {
      console.log(`Selecting team "${DEMO_TEAM}"...`);
      await page.click(teamLink);
      await page.waitForSelector('a[href$="/csc"]');
    }
    console.log("Signed in.");

    // --- Walkthrough: adjust these steps to match the story you want to tell ---
    console.log("Opening Cybersecurity Management System...");
    await page.click('a[href$="/csc"]');
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    console.log("Filtering controls by status...");
    await page.click("text=Choose a status");
    await page.getByRole("option", { name: "Not Performed" }).click();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1500);

    console.log("Back to dashboard...");
    await page.click('a[href$="/dashboard"]');
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  } catch (err) {
    console.error("Walkthrough step failed:", err.message);
    throw err;
  } finally {
    // Video is only finalized once the context closes.
    await context.close();
    await browser.close();
  }

  console.log(`Recording saved under: ${RECORDINGS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
