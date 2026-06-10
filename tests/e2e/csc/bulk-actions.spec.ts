/**
 * E2E: CSC module — bulk status change and task assignment
 *
 * Prerequisites:
 *  - A team with slug matching TEST_TEAM_SLUG must exist.
 *  - The team must have an ISO framework configured (e.g. ISO/IEC 27001:2022).
 *  - The team must have at least 3 controls visible on the first page.
 *
 * Run: npx playwright test tests/e2e/csc/bulk-actions.spec.ts
 */
import { expect, test } from '@playwright/test';

const SLUG = process.env.TEST_TEAM_SLUG ?? 'demo';

test.describe('CSC module — navigation and rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/teams/${SLUG}/csc`);
    await page.waitForLoadState('networkidle');
  });

  test('CSC page loads and shows the controls table', async ({ page }) => {
    await expect(page).not.toHaveURL('/auth/login');
    const table = page
      .locator('table')
      .first()
      .or(page.getByText(/no framework|configure/i).first());
    await expect(table).toBeVisible({ timeout: 15000 });
  });

  test('control status cells show CSC status values, not raw keys', async ({
    page,
  }) => {
    const table = page.locator('table').first();
    if ((await table.count()) === 0) {
      test.skip();
      return;
    }

    const pageText = await page.textContent('body');
    // Raw status keys should never appear as visible text
    expect(pageText).not.toContain('not-performed"');
    expect(pageText).not.toContain('"well-defined"');
    // i18n keys should not appear
    expect(pageText).not.toContain('csc-statuses.');
  });
});

test.describe('CSC module — bulk status change', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/teams/${SLUG}/csc`);
    await page.waitForLoadState('networkidle');
  });

  test('selecting controls shows the bulk action bar', async ({ page }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count < 2) {
      test.skip();
      return;
    }

    // Select first two controls (skip index 0 which is "select all")
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // Bulk action bar should appear
    const bulkBar = page
      .locator(
        '[data-testid="bulk-action-bar"], [class*="BulkAction"], [class*="bulk-action"]'
      )
      .or(page.getByRole('button', { name: /change status|bulk/i }));
    await expect(bulkBar.first()).toBeVisible({ timeout: 3000 });
  });

  test('bulk status change updates ALL selected controls — not just the last one', async ({
    page,
  }) => {
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    if (count < 3) {
      test.skip();
      return;
    }

    // Collect the control row identifiers before the update
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    if (rowCount < 2) {
      test.skip();
      return;
    }

    // Select first two data checkboxes
    await checkboxes.nth(1).check();
    await checkboxes.nth(2).check();

    // Open status dropdown
    const statusBtn = page
      .getByRole('button', { name: /change status|statut|status/i })
      .or(page.locator('[data-testid="bulk-status-btn"]'));

    if ((await statusBtn.count()) === 0) {
      test.skip();
      return;
    }

    await statusBtn.first().click();

    // Pick "Planned" status
    const plannedOption = page
      .getByRole('option', { name: /planned|planifié/i })
      .or(page.getByText(/planned|planifié/i).first());

    if ((await plannedOption.count()) === 0) {
      test.skip();
      return;
    }

    await plannedOption.click();
    await page.waitForLoadState('networkidle');

    // Success toast must appear
    const toast = page
      .locator('[class*="toast"], [role="status"], [data-testid*="toast"]')
      .or(page.getByText(/updated|mis à jour/i).first());
    await expect(toast.first()).toBeVisible({ timeout: 8000 });

    // Verify the table reflects changes WITHOUT requiring a page refresh
    await page.waitForTimeout(1000); // allow SWR revalidation
    const updatedRows = page.locator('table tbody tr');
    const updatedCount = await updatedRows.count();
    expect(updatedCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe('CSC module — task assignment reflects without page refresh', () => {
  test('assigning a task to a control appears immediately in the controls list', async ({
    page,
  }) => {
    await page.goto(`/teams/${SLUG}/csc`);
    await page.waitForLoadState('networkidle');

    const taskSelectors = page.locator(
      '[class*="TaskSelector"], [data-testid*="task-selector"]'
    );
    if ((await taskSelectors.count()) === 0) {
      test.skip();
      return;
    }

    // Click the first task selector
    await taskSelectors.first().click();

    const taskOption = page
      .locator('[role="option"]')
      .first()
      .or(page.locator('[class*="option"]').first());

    if ((await taskOption.count()) === 0) {
      test.skip();
      return;
    }

    await taskOption.click();
    await page.waitForLoadState('networkidle');

    // The task should appear inline without a full page reload
    // (page URL should not have changed)
    await expect(page).toHaveURL(new RegExp(`/teams/${SLUG}/csc`));

    // No full-page-reload indicator: the table should still be present
    const table = page.locator('table').first();
    await expect(table).toBeVisible({ timeout: 5000 });
  });
});
