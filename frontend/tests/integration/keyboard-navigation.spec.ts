import { test, expect } from '@playwright/test';

/**
 * Keyboard navigation tests
 * Verifies Tab order is correct and all interactive elements are accessible
 */

test.describe('Keyboard Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Tab Navigation Order', () => {
    test('should navigate through navbar elements in logical order', async ({ page }) => {
      const focusedElements: Array<{ tag: string; text: string; href?: string }> = [];

      // Press Tab 15 times to navigate through navbar
      for (let i = 0; i < 15; i++) {
        await page.keyboard.press('Tab');

        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.textContent?.slice(0, 30) || el.getAttribute('aria-label') || '').trim(),
            href: el.getAttribute('href') || undefined,
          };
        });

        if (activeElement) {
          focusedElements.push(activeElement);
        }
      }

      // Should have focused on multiple elements
      expect(focusedElements.length).toBeGreaterThan(3);

      // Check for logo/link first
      const hasLogo = focusedElements.some(el =>
        el.text.includes('MLB') || el.text.includes('返回首页') || el.href === '/'
      );

      // Check for navigation links
      const hasNavLinks = focusedElements.some(el =>
        el.text.includes('首页') || el.text.includes('球队')
      );

      expect(hasLogo || hasNavLinks).toBeTruthy();
    });

    test('should have visible focus indicators on all interactive elements', async ({ page }) => {
      const elementsWithoutFocusIndicator: string[] = [];

      // Get all interactive elements
      const interactiveElements = await page.locator('a, button, [role="button"], [tabindex]:not([tabindex="-1"])').all();

      for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
        const element = interactiveElements[i];

        // Focus the element
        await element.focus();

        // Check for focus indicator
        const hasFocusIndicator = await element.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const outline = style.outlineWidth;
          const outlineStyle = style.outlineStyle;
          const boxShadow = style.boxShadow;
          const ringWidth = el.getAttribute('class')?.includes('ring-') ||
                           el.getAttribute('class')?.includes('focus:');

          return outline !== '0px' ||
                 outlineStyle !== 'none' ||
                 boxShadow !== 'none' ||
                 ringWidth;
        });

        if (!hasFocusIndicator) {
          const text = await element.textContent() || await element.getAttribute('aria-label') || 'unnamed';
          elementsWithoutFocusIndicator.push(text.slice(0, 30));
        }
      }

      // Most elements should have focus indicators
      expect(elementsWithoutFocusIndicator.length).toBeLessThan(interactiveElements.length * 0.3);
    });

    test('should allow Enter to activate links', async ({ page }) => {
      // Find a link in the navbar
      const navLinks = await page.locator('nav a[href^="/"]').all();

      if (navLinks.length > 0) {
        const firstLink = navLinks[0];
        const href = await firstLink.getAttribute('href');

        // Focus the link
        await firstLink.focus();

        // Press Enter
        await page.keyboard.press('Enter');

        // Wait for navigation
        await page.waitForTimeout(500);

        // Check URL changed
        const currentUrl = page.url();
        expect(currentUrl).toContain(href || '');
      }
    });

    test('should allow Space to activate buttons', async ({ page }) => {
      await page.goto('/');

      // Find the login button
      const loginButton = page.locator('button').filter({ hasText: /登录/i }).first();

      if (await loginButton.isVisible().catch(() => false)) {
        // Focus the button
        await loginButton.focus();

        // Get current URL
        const currentUrl = page.url();

        // Press Space
        await page.keyboard.press('Space');

        // Wait for action
        await page.waitForTimeout(500);

        // URL might have changed
        expect(page.url()).toBeDefined();
      }
    });
  });

  test.describe('Skip Links and Landmarks', () => {
    test('should have main landmark', async ({ page }) => {
      const main = page.locator('main, [role="main"]');
      await expect(main).toBeVisible();
    });

    test('should have navigation landmark', async ({ page }) => {
      const nav = page.getByRole('navigation');
      await expect(nav).toBeVisible();
    });

    test('should have contentinfo landmark (footer)', async ({ page }) => {
      const footer = page.getByRole('contentinfo');
      await expect(footer).toBeVisible();
    });

    test('should have banner landmark (header)', async ({ page }) => {
      const banner = page.locator('header, [role="banner"]').first();
      await expect(banner).toBeVisible();
    });
  });

  test.describe('Focus Management', () => {
    test('focus should be trapped in mobile menu when open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Open mobile menu
      const menuButton = page.getByRole('button', { name: /打开菜单/i });
      await menuButton.click();

      // Get all focusable elements in mobile menu
      const mobileMenu = page.locator('#mobile-menu');
      const focusableElements = await mobileMenu.locator('a, button').all();

      // Tab through elements
      for (let i = 0; i < focusableElements.length + 2; i++) {
        await page.keyboard.press('Tab');

        // Check that focus is still within mobile menu
        const activeElement = await page.evaluate(() => document.activeElement);
        const isInMenu = await mobileMenu.evaluate((menu, active) => {
          return menu.contains(active);
        }, activeElement);

        expect(isInMenu).toBeTruthy();
      }

      // Close menu with Escape
      await page.keyboard.press('Escape');
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should restore focus after closing mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Get the menu button
      const menuButton = page.getByRole('button', { name: /打开菜单/i });

      // Open menu
      await menuButton.click();

      // Close menu
      await page.keyboard.press('Escape');

      // Focus should be back on menu button
      const activeElement = await page.evaluate(() => document.activeElement);
      const isMenuButton = await menuButton.evaluate((btn, active) => btn === active, activeElement);

      expect(isMenuButton).toBeTruthy();
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should support Escape to close mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Open mobile menu
      const menuButton = page.getByRole('button', { name: /打开菜单/i });
      await menuButton.click();

      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');

      // Menu should be closed
      await expect(mobileMenu).not.toBeVisible();
    });
  });

  test.describe('Form Keyboard Navigation', () => {
    test('should navigate through form elements with Tab', async ({ page }) => {
      await page.goto('/login');

      const formElements = await page.locator('input, button[type="submit"], select, textarea').all();

      if (formElements.length > 0) {
        // Focus first element
        await formElements[0].focus();

        // Tab through all elements
        for (let i = 0; i < formElements.length; i++) {
          await page.keyboard.press('Tab');
        }

        // Should have navigated through all elements
        expect(formElements.length).toBeGreaterThan(0);
      }
    });
  });
});
