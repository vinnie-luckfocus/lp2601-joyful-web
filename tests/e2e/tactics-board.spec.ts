import { test, expect } from '@playwright/test';
import { seedDatabase } from './helpers/db';
import { loginByApi } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

test.describe('Tactics Board E2E Tests', () => {
  test.beforeEach(async () => {
    seedDatabase();
  });

  test('authenticated user navigates to tactics board and sees lineup and field diagram', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/schedule');

    // Click first game to go to detail page
    const firstCard = page.locator('[data-testid="schedule-game-card"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/games\/\d+/);

    // Click tactics board link
    await page.getByRole('link', { name: '查看战术板' }).click();
    await expect(page).toHaveURL(/\/games\/\d+\/tactics/);

    // Verify page header
    await expect(page.getByRole('heading', { name: '战术板' })).toBeVisible();

    // Verify lineup list
    await expect(page.getByText('batting 顺序')).toBeVisible();
    await expect(page.getByText('张伟')).toBeVisible();
    await expect(page.getByText('王芳')).toBeVisible();

    // Verify field diagram
    await expect(page.getByLabel('棒球场防守位置图')).toBeVisible();
    await expect(page.getByText('P')).toBeVisible();
    await expect(page.getByText('C')).toBeVisible();

    // Expand tactics panel and verify content
    await page.getByRole('button', { name: '总体战术' }).click();
    await expect(page.getByText(/本场比赛重点防守/)).toBeVisible();
  });
});
