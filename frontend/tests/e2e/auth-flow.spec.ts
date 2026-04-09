import { test, expect } from '@playwright/test';

/**
 * E2E tests for authentication flows
 * Requires backend running on localhost:3001 and frontend on localhost:3000
 */

test.describe('Authentication E2E Tests', () => {
  test.describe('Login Flow', () => {
    test('successful login with first-login user forces password change, then re-login works', async ({ page }) => {
      await page.goto('/?login=true');

      // Enter credentials
      await page.getByLabel('用户名').fill('e2e_first_login');
      await page.getByLabel('密码').fill('testpass123');
      await page.getByRole('button', { name: '登录' }).click();

      // Should show change-password modal
      await expect(page.getByRole('dialog', { name: '修改密码' })).toBeVisible();

      // Fill password change form
      await page.getByLabel('原密码').fill('testpass123');
      await page.getByLabel('新密码').fill('newpass456');
      await page.getByLabel('确认新密码').fill('newpass456');
      await page.getByRole('button', { name: '修改密码' }).click();

      // Should show success view
      await expect(page.getByRole('dialog', { name: '密码已修改' })).toBeVisible();
      await expect(page.getByText('您的密码已成功更新。')).toBeVisible();

      // Click re-login
      await page.getByRole('button', { name: '重新登录' }).click();

      // Should be back at login modal
      await expect(page.getByRole('dialog', { name: '登录' })).toBeVisible();

      // Re-login with new password
      await page.getByLabel('用户名').fill('e2e_first_login');
      await page.getByLabel('密码').fill('newpass456');
      await page.getByRole('button', { name: '登录' }).click();

      // Modal should close and user should be redirected
      await expect(page.getByRole('dialog')).not.toBeVisible();

      // Navigate to a protected route
      await page.goto('/admin');
      await expect(page.locator('body')).toContainText('管理后台');
    });

    test('successful login redirects to team page for user with team_id', async ({ page }) => {
      await page.goto('/?login=true');

      await page.getByLabel('用户名').fill('e2e_team_user');
      await page.getByLabel('密码').fill('testpass123');
      await page.getByRole('button', { name: '登录' }).click();

      // Should redirect to /teams after login
      await expect(page).toHaveURL(/.*teams/);
    });

    test('successful login redirects to players page for user without team_id', async ({ page }) => {
      await page.goto('/?login=true');

      await page.getByLabel('用户名').fill('e2e_normal_login');
      await page.getByLabel('密码').fill('testpass123');
      await page.getByRole('button', { name: '登录' }).click();

      // Should redirect to /players after login
      await expect(page).toHaveURL(/.*players/);
    });

    test('failed login displays friendly error message', async ({ page }) => {
      await page.goto('/?login=true');

      await page.getByLabel('用户名').fill('e2e_normal_login');
      await page.getByLabel('密码').fill('wrongpassword');
      await page.getByRole('button', { name: '登录' }).click();

      // Should show friendly error message in the modal
      await expect(page.getByRole('alert')).toBeVisible();
      await expect(page.getByText('账号或密码错误')).toBeVisible();

      // Should stay on the same page
      await expect(page).toHaveURL(/.*login.*/);
      await expect(page.getByRole('dialog', { name: '登录' })).toBeVisible();
    });
  });
});
