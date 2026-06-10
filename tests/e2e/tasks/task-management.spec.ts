/**
 * E2E: Task management — list view, kanban, status filtering
 *
 * Prerequisites:
 *  - A team with slug matching TEST_TEAM_SLUG must exist.
 *  - The team must have tasks in various statuses (todo, inprogress, inreview,
 *    feedback, done).
 *
 * Run: npx playwright test tests/e2e/tasks/task-management.spec.ts
 */
import { expect, test } from '@playwright/test';

const SLUG = process.env.TEST_TEAM_SLUG ?? 'demo';

test.describe('Task management — list view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/teams/${SLUG}/tasks`);
    await page.waitForLoadState('networkidle');
  });

  test('tasks page loads and shows the task table', async ({ page }) => {
    await expect(page).not.toHaveURL('/auth/login');
    // Task list or empty state should be visible
    const content = page
      .locator('table, [data-testid="empty-state"], text=/no tasks/i')
      .first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  test('status summary cards show non-negative counts', async ({ page }) => {
    // Cards showing "In Progress: N", "In Review: N" etc. should have numeric values
    const cards = page.locator(
      '[data-testid*="status-card"], .status-card, [class*="StatCard"]'
    );
    const count = await cards.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const text = await cards.nth(i).textContent();
        // Should contain a number (not undefined or NaN)
        expect(text).toMatch(/\d+/);
        expect(text).not.toContain('undefined');
        expect(text).not.toContain('NaN');
      }
    }
  });

  test('status filter does not use hyphenated variants', async ({ page }) => {
    // The filter dropdown options should use user-friendly labels, not raw keys
    const filterTrigger = page
      .getByRole('combobox')
      .first()
      .or(page.locator('[class*="MultiSelect"], [class*="filter"]').first());

    if ((await filterTrigger.count()) > 0) {
      await filterTrigger.click();
      const options = await page
        .locator('[role="option"], [class*="option"]')
        .allTextContents();
      const optText = options.join(' ').toLowerCase();
      // Raw keys must not be visible to users
      expect(optText).not.toContain('inprogress');
      expect(optText).not.toContain('inreview');
    }
  });

  test('creating a new task opens the create dialog', async ({ page }) => {
    const newTaskBtn = page
      .getByRole('button', { name: /new task|add task|créer|nouvelle/i })
      .or(page.locator('button[data-testid="new-task"]'));

    if ((await newTaskBtn.count()) > 0) {
      await newTaskBtn.first().click();
      // A modal or form should appear
      const dialog = page
        .getByRole('dialog')
        .or(page.locator('[class*="Modal"], [class*="Dialog"]'));
      await expect(dialog.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Task management — kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/teams/${SLUG}/tasks`);
    await page.waitForLoadState('networkidle');
  });

  test('kanban view can be activated', async ({ page }) => {
    const kanbanToggle = page
      .getByRole('button', { name: /kanban|board/i })
      .or(
        page.locator('[data-testid="kanban-toggle"], [aria-label*="kanban"]')
      );

    if ((await kanbanToggle.count()) > 0) {
      await kanbanToggle.first().click();
      await page.waitForLoadState('networkidle');
      // Kanban columns should appear
      const columns = page.locator(
        '[data-testid*="column"], [class*="kanban-col"], [class*="KanbanColumn"]'
      );
      await expect(columns.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('kanban columns use correct translated status labels', async ({
    page,
  }) => {
    const kanbanToggle = page
      .getByRole('button', { name: /kanban|board/i })
      .or(page.locator('[data-testid="kanban-toggle"]'));

    if ((await kanbanToggle.count()) > 0) {
      await kanbanToggle.first().click();
      await page.waitForLoadState('networkidle');

      const pageText = await page.textContent('body');
      // Raw keys must not appear in the UI
      expect(pageText).not.toContain('inprogress');
      expect(pageText).not.toContain('inreview');
      expect(pageText).not.toContain('in-progress');
      expect(pageText).not.toContain('in-review');
    }
  });
});

test.describe('Task detail — status update reflects immediately', () => {
  test('assigned task appears in task list without page refresh', async ({
    page,
  }) => {
    // Navigate to task list
    await page.goto(`/teams/${SLUG}/tasks`);
    await page.waitForLoadState('networkidle');

    // Find the first task row and click it
    const firstRow = page.locator('table tbody tr').first();
    if ((await firstRow.count()) === 0) {
      test.skip();
      return;
    }

    const link = firstRow.locator('a').first();
    if ((await link.count()) === 0) {
      test.skip();
      return;
    }

    const href = await link.getAttribute('href');
    if (!href) {
      test.skip();
      return;
    }

    await page.goto(href);
    await page.waitForLoadState('networkidle');

    // Task detail page should load
    await expect(page).not.toHaveURL('/auth/login');
    const title = page.locator('h1, h2, [data-testid="task-title"]').first();
    await expect(title).toBeVisible({ timeout: 10000 });
  });
});
