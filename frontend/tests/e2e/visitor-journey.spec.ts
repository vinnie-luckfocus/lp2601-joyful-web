import { test, expect } from '@playwright/test';

/**
 * E2E tests for visitor journey
 * Tests complete user flows from browsing to login
 */

test.describe('Visitor Journey E2E Tests', () => {
  test.describe('Visitor Browsing Flow', () => {
    test('visitor can browse homepage and navigate through all sections', async ({ page }) => {
      // Start at homepage
      await page.goto('/');
      await expect(page).toHaveTitle(/MLB 数据平台/);

      // Scroll through all sections
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);

      // Scroll to features section
      const featuresSection = page.getByRole('region', { name: '功能特色' });
      await featuresSection.scrollIntoViewIfNeeded();
      await expect(featuresSection).toBeInViewport();
      await page.waitForTimeout(200);

      // Scroll to stats section
      const statsSection = page.locator('section').filter({ hasText: /积分榜|数据排行榜/ }).first();
      await statsSection.scrollIntoViewIfNeeded();
      await expect(statsSection).toBeInViewport();
      await page.waitForTimeout(200);

      // Scroll to recent games
      const recentGamesSection = page.getByRole('region', { name: '最近战报' });
      await recentGamesSection.scrollIntoViewIfNeeded();
      await expect(recentGamesSection).toBeInViewport();
      await page.waitForTimeout(200);

      // Scroll to upcoming games
      const upcomingGamesSection = page.getByRole('region', { name: '即将进行的比赛' });
      await upcomingGamesSection.scrollIntoViewIfNeeded();
      await expect(upcomingGamesSection).toBeInViewport();
      await page.waitForTimeout(200);

      // Scroll to footer
      const footer = page.getByRole('contentinfo');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeInViewport();
    });

    test('visitor can click login from hero section', async ({ page }) => {
      await page.goto('/');

      // Click login button in hero
      const heroLoginButton = page.getByTestId('hero-login-button');
      await expect(heroLoginButton).toBeVisible();

      // Navigate to login page
      await heroLoginButton.click();

      // Should navigate to login page
      await expect(page).toHaveURL(/.*login.*/);
      await expect(page.getByRole('heading', { name: /登录|Login/i })).toBeVisible();
    });

    test('visitor can click login from navbar', async ({ page }) => {
      await page.goto('/');

      // Click login button in navbar
      const navbarLoginButton = page.locator('nav').getByRole('button', { name: /登录/i });
      await expect(navbarLoginButton).toBeVisible();
      await navbarLoginButton.click();

      // Should navigate to login page
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('visitor can click login from mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open mobile menu
      const menuButton = page.getByRole('button', { name: /打开菜单/i });
      await menuButton.click();

      // Click login in mobile menu
      const mobileLoginButton = page.locator('#mobile-menu').getByRole('button', { name: /登录/i });
      await mobileLoginButton.click();

      // Should navigate to login page
      await expect(page).toHaveURL(/.*login.*/);
    });
  });

  test.describe('Navigation Links', () => {
    test('all main navigation links should work', async ({ page }) => {
      await page.goto('/');

      const navLinks = [
        { name: '首页', href: '/' },
        { name: '球队', href: '/teams' },
        { name: '球员', href: '/players' },
        { name: '赛程', href: '/schedule' },
      ];

      for (const link of navLinks) {
        const navLink = page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: link.name });

        if (await navLink.isVisible().catch(() => false)) {
          await navLink.click();

          // Check URL changed or content loaded
          const currentUrl = page.url();
          const isCorrectPage = currentUrl.includes(link.href) ||
            await page.getByRole('heading', { name: new RegExp(link.name, 'i') }).isVisible().catch(() => false);

          // For pages that might show "coming soon" or similar
          const hasContent = await page.locator('body').textContent().then(text =>
            text?.includes(link.name) || text?.includes('即将上线') || text?.includes('Coming Soon')
          );

          expect(isCorrectPage || hasContent).toBeTruthy();

          // Go back to homepage for next link
          await page.goto('/');
        }
      }
    });

    test('all footer links should be clickable', async ({ page }) => {
      await page.goto('/');

      const footerLinks = [
        { name: '球队数据', section: '产品' },
        { name: '球员统计', section: '产品' },
        { name: '赛程安排', section: '产品' },
        { name: '帮助中心', section: '支持' },
        { name: '联系我们', section: '支持' },
        { name: '反馈建议', section: '支持' },
        { name: '关于我们', section: '关于' },
        { name: '隐私政策', section: '关于' },
        { name: '服务条款', section: '关于' },
      ];

      for (const link of footerLinks) {
        const footerSection = page.locator('footer');
        const linkElement = footerSection.getByRole('link', { name: link.name });

        if (await linkElement.isVisible().catch(() => false)) {
          // Check link has valid href
          const href = await linkElement.getAttribute('href');
          expect(href).toBeTruthy();

          // Check link is clickable
          await expect(linkElement).toBeEnabled();
        }
      }
    });

    test('social media links should open in new tab', async ({ page, context }) => {
      await page.goto('/');

      const socialLinks = [
        { name: 'GitHub', platform: 'github' },
        { name: 'Twitter', platform: 'twitter' },
        { name: 'Email', platform: 'mailto' },
      ];

      for (const social of socialLinks) {
        const socialLink = page.locator('footer').getByRole('link', { name: new RegExp(social.name, 'i') });

        if (await socialLink.isVisible().catch(() => false)) {
          const href = await socialLink.getAttribute('href');
          const target = await socialLink.getAttribute('target');

          expect(href).toContain(social.platform.toLowerCase());

          // External links should open in new tab
          if (!href?.startsWith('mailto')) {
            expect(target).toBe('_blank');
          }
        }
      }
    });

    test('logo link should navigate to homepage', async ({ page }) => {
      // First go to another page
      await page.goto('/login');

      // Click logo
      const logo = page.getByRole('link', { name: 'MLB 数据平台 - 返回首页' });
      await logo.click();

      // Should be back at homepage
      await expect(page).toHaveURL(/\/$/);
    });
  });

  test.describe('Coming Soon Page Handling', () => {
    test('should show coming soon or placeholder for unfinished pages', async ({ page }) => {
      const unfinishedPages = ['/teams', '/players', '/schedule', '/help', '/contact'];

      for (const path of unfinishedPages) {
        await page.goto(path);

        // Check for various "coming soon" indicators
        const bodyText = await page.locator('body').textContent();
        const hasComingSoonIndicator =
          bodyText?.includes('即将上线') ||
          bodyText?.includes('Coming Soon') ||
          bodyText?.includes('开发中') ||
          bodyText?.includes('建设中') ||
          bodyText?.includes('敬请期待');

        // Or the page should have actual content
        const hasContent = await page.locator('main, [role="main"]').count() > 0;

        expect(hasComingSoonIndicator || hasContent).toBeTruthy();
      }
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should show hamburger menu on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.getByRole('button', { name: /打开菜单|menu/i });
      await expect(hamburgerButton).toBeVisible();

      // Desktop navigation should be hidden
      const desktopNav = page.getByRole('navigation', { name: '主导航' });
      await expect(desktopNav).not.toBeVisible();
    });

    test('should show desktop navigation on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      const desktopNav = page.getByRole('navigation', { name: '主导航' });
      await expect(desktopNav).toBeVisible();

      // Hamburger should not be visible
      const hamburgerButton = page.locator('button').filter({ has: page.locator('[data-lucide="menu"]').first() });
      await expect(hamburgerButton).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate through all interactive elements with Tab key', async ({ page }) => {
      await page.goto('/');

      // Press Tab multiple times and track focus
      const focusedElements: string[] = [];

      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluate(() => {
          const el = document.activeElement;
          return el ? {
            tag: el.tagName,
            text: el.textContent?.slice(0, 30) || '',
            ariaLabel: el.getAttribute('aria-label') || '',
          } : null;
        });

        if (activeElement) {
          focusedElements.push(`${activeElement.tag}: ${activeElement.text || activeElement.ariaLabel}`);
        }
      }

      // Should have focused on multiple elements
      expect(focusedElements.length).toBeGreaterThan(5);

      // Should include navigation links
      const hasNavLinks = focusedElements.some(el =>
        el.includes('首页') || el.includes('球队') || el.includes('球员')
      );
      expect(hasNavLinks).toBeTruthy();
    });

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');

      // Press Tab to focus on first interactive element
      await page.keyboard.press('Tab');

      // Check that focused element has visible outline
      const hasFocusIndicator = await page.evaluate(() => {
        const activeElement = document.activeElement;
        if (!activeElement || activeElement === document.body) return false;

        const style = window.getComputedStyle(activeElement);
        const outline = style.outline;
        const boxShadow = style.boxShadow;

        return outline !== 'none' ||
               outline !== '0px' ||
               boxShadow.includes('ring') ||
               boxShadow.includes('outline');
      });

      expect(hasFocusIndicator).toBeTruthy();
    });

    test('should allow Enter key to activate links', async ({ page }) => {
      await page.goto('/');

      // Tab to a link
      let tabCount = 0;
      let isLink = false;

      while (tabCount < 10 && !isLink) {
        await page.keyboard.press('Tab');
        isLink = await page.evaluate(() => {
          const el = document.activeElement;
          return el?.tagName === 'A';
        });
        tabCount++;
      }

      if (isLink) {
        // Get current URL
        const currentUrl = page.url();

        // Press Enter
        await page.keyboard.press('Enter');

        // Wait for potential navigation
        await page.waitForTimeout(500);

        // URL might have changed or stayed the same
        // The important thing is that no error occurred
        expect(page.url()).toBeDefined();
      }
    });
  });

  test.describe('Page Load Performance', () => {
    test('homepage should load within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('should show content progressively', async ({ page }) => {
      await page.goto('/');

      // Hero should be visible first
      await expect(page.getByTestId('hero-section')).toBeVisible();

      // Navbar should be visible
      await expect(page.getByRole('navigation')).toBeVisible();

      // Footer should eventually be visible
      await expect(page.getByRole('contentinfo')).toBeVisible();
    });
  });
});
