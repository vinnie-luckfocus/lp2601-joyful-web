import { expect, Page } from '@playwright/test';

export async function loginByApi(page: Page, username: string, password: string): Promise<void> {
  // Open login modal via query param
  await page.goto('/?login=true');

  // Fill credentials
  await page.getByLabel('用户名').fill(username);
  await page.getByLabel('密码').fill(password);

  // Submit login (scoped to modal to avoid nav/hero button ambiguity)
  await page.getByTestId('login-modal-card').getByRole('button', { name: '登录' }).click();

  // Wait for redirect or modal closure (non-first-login users may be redirected)
  await expect(page).not.toHaveURL(/\?login=true/);
}
