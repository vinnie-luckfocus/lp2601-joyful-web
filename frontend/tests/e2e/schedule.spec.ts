import { test, expect, Page } from '@playwright/test';
import { seedDatabase, insertNearFutureGame, clearAllGames } from './helpers/db';
import { loginByApi } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

test.describe('Schedule E2E Tests', () => {
  test.beforeEach(async () => {
    seedDatabase();
  });

  test.afterEach(async ({ page }) => {
    // Clean up route interceptors if any were added in a test
    await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {
      // ignore
    });
  });

  test('unauthenticated user can view public schedule at /schedule', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('heading', { name: '赛程安排' })).toBeVisible();
    await expect(page.locator('[data-testid="schedule-game-card"]').first()).toBeVisible();
  });

  test('authenticated user can filter schedule by month and see correct games', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/schedule');

    // Default month is April (earliest games in seed data), which has 3 games
    await expect(page.locator('[data-testid="schedule-game-card"]')).toHaveCount(3);

    // Navigate to May: 5 games
    await page.getByRole('button', { name: '下个月' }).click();
    await expect(page.locator('[data-testid="schedule-game-card"]')).toHaveCount(5);
  });

  test('empty month view shows appropriate empty state', async ({ page }) => {
    clearAllGames();
    await page.goto('/schedule');
    await expect(page.getByText('该月份暂无赛程')).toBeVisible();
    await expect(page.locator('[data-testid="schedule-game-card"]')).toHaveCount(0);
  });

  test('user clicks a game to open detail page', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/schedule');
    const firstCard = page.locator('[data-testid="schedule-game-card"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/games\/\d+/);
    await expect(page.getByText('VS').first()).toBeVisible();
    await expect(page.locator('[data-testid="confirm-button"]')).toBeVisible();
  });

  test('user clicks 参加, sees optimistic UI update, and attendee count increments', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/schedule');

    const firstCard = page.locator('[data-testid="schedule-game-card"]').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/games\/\d+/);

    // Read initial confirmed count from detail page (first \(\d\) is confirmed)
    const initialCountText = await page.locator('span').filter({ hasText: /^\(\d+\)$/ }).first().textContent();
    const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

    await page.getByTestId('confirm-button').click();
    await expect(page.getByText('报名成功')).toBeVisible();

    // Count incremented after API success
    await expect(
      page.locator('span').filter({ hasText: new RegExp(`^\\(${initialCount + 1}\\)$`) }).first()
    ).toBeVisible();

    // Verify badge appears on schedule page
    await page.goto('/schedule');
    await expect(page.locator('[data-testid="signup-status-badge"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="signup-status-badge"]').first()).toHaveText('已报名');
  });

  test('user clicks 不参加, status updates, and attendee count decrements', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/games/1');

    // First confirm to establish a baseline
    await page.getByTestId('confirm-button').click();
    await expect(page.getByText('报名成功')).toBeVisible();

    const confirmedAfterSignUpText = await page
      .locator('span')
      .filter({ hasText: /^\(\d+\)$/ })
      .first()
      .textContent();
    const confirmedAfterSignUp = parseInt(confirmedAfterSignUpText?.match(/\d+/)?.[0] || '0', 10);

    // Decline
    await page.getByTestId('decline-button').click();

    // Count decremented
    await expect(
      page.locator('span').filter({ hasText: new RegExp(`^\\(${confirmedAfterSignUp - 1}\\)$`) }).first()
    ).toBeVisible();

    // Verify badge removed on schedule page
    await page.goto('/schedule');
    await expect(page.locator('[data-testid="signup-status-badge"]').first()).not.toBeVisible();
  });

  test('signup is blocked within 2 hours of game start with appropriate message', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    const nearGameId = insertNearFutureGame();
    await page.goto(`/games/${nearGameId}`);

    await page.getByTestId('confirm-button').click();
    await expect(page.getByText('Signup is closed within 2 hours of game start')).toBeVisible();
  });

  test('optimistic UI rolls back gracefully when the attend API returns a network/server error', async ({ page }) => {
    await loginByApi(page, 'e2e_player', 'testpass123');
    await page.goto('/games/1');

    const initialCountText = await page
      .locator('span')
      .filter({ hasText: /^\(\d+\)$/ })
      .first()
      .textContent();
    const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0', 10);

    await page.route('**/api/games/*/attend', async (route) => {
      await new Promise((r) => setTimeout(r, 500));
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    await page.getByTestId('confirm-button').click();

    // Error alert visible means rollback was triggered
    await expect(page.getByText('Server error')).toBeVisible();

    // Count rolled back
    await expect(
      page.locator('span').filter({ hasText: new RegExp(`^\\(${initialCount}\\)$`) }).first()
    ).toBeVisible();

    // Success animation should not appear
    await expect(page.getByText('报名成功')).not.toBeVisible();
  });
});
