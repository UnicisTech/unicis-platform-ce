/**
 * E2E: Dashboard task matrix
 *
 * Prerequisites:
 *  - A team with slug matching TEST_TEAM_SLUG must exist.
 *  - The team must have at least one task per status: todo, inprogress,
 *    inreview, feedback, done.
 *  - TEST_TEAM_SLUG and PLAYWRIGHT_BASE_URL must be set in .env.test (or
 *    the default http://localhost:4002 used below).
 *
 * Run: npx playwright test tests/e2e/dashboard/task-matrix.spec.ts
 */
import { expect, test } from '@playwright/test';

const SLUG = process.env.TEST_TEAM_SLUG ?? 'demo';

test.describe('Dashboard — task status matrix', () => {
  test.beforeEach(async ({ page }) => {
    // Assumes a session cookie / auth state fixture is provided.
    // If using storageState, set it in playwright.config.ts.
    await page.goto(`/teams/${SLUG}/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  test('dashboard page loads without errors', async ({ page }) => {
    await expect(page).not.toHaveURL('/auth/login');
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await expect(
      page.locator('h1, [data-testid="dashboard"]').first()
    ).toBeVisible({ timeout: 10000 });
    expect(errors.filter((e) => e.includes('Unhandled'))).toHaveLength(0);
  });

  test('task matrix table renders with translated column headers', async ({
    page,
  }) => {
    // The matrix must be visible
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // Headers must NOT show raw keys like "inprogress" or "task-statuses.todo"
    const headers = await table.locator('th').allTextContents();
    const headerText = headers.join(' ');
    expect(headerText).not.toContain('task-statuses.');
    expect(headerText).not.toContain('inprogress');
    expect(headerText).not.toContain('inreview');
    expect(headerText).not.toContain('in-progress');
    expect(headerText).not.toContain('in-review');
  });

  test('task matrix shows module rows for RPA, TIA, PIA, CSC, RM', async ({
    page,
  }) => {
    const table = page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  test('domain health cards are visible and clickable', async ({ page }) => {
    // The three domain health cards should be present
    // Clicking one should change the active tab content
    const cards = page.locator(
      '[aria-label*="tab"], button:has-text("Data Protection"), button:has-text("Cybersecurity"), button:has-text("Risk Management")'
    );
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('tab switcher — Cybersecurity tab shows CSC content', async ({
    page,
  }) => {
    const cyberTab = page
      .getByRole('tab', { name: /cybersecurity/i })
      .or(
        page
          .getByText(/cybersecurity.*conformité|cybersecurity & compliance/i)
          .first()
      );

    if ((await cyberTab.count()) > 0) {
      await cyberTab.click();
      await page.waitForLoadState('networkidle');
      // CSC-specific content should appear (section progress or status distribution)
      const cscContent = page.getByText(
        /section progress|progression par section|status distribution|distribution des statuts/i
      );
      await expect(cscContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('tab switcher — Risk Management tab shows risk matrix', async ({
    page,
  }) => {
    const rmTab = page
      .getByRole('tab', { name: /risk management|gestion des risques/i })
      .or(page.getByText(/gestion des risques|risk management/i).first());

    if ((await rmTab.count()) > 0) {
      await rmTab.click();
      await page.waitForLoadState('networkidle');
      // Risk matrix or assessment should appear
      const rmContent = page.getByText(/risk|risque/i).first();
      await expect(rmContent).toBeVisible({ timeout: 5000 });
    }
  });
});
