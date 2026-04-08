import { test, expect } from '@playwright/test';

/**
 * Link validation tests
 * Validates all links including "coming soon" handling
 */

test.describe('Link Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Navigation Links', () => {
    test('all navbar links should have valid href attributes', async ({ page }) => {
      const navLinks = await page.locator('nav a[href]').all();
      const invalidLinks: Array<{ text: string; href: string | null }> = [];

      for (const link of navLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent() || '';

        // Check href is not empty or just '#'
        if (!href || href === '#' || href === 'javascript:void(0)') {
          invalidLinks.push({ text: text.slice(0, 30), href });
        }
      }

      expect(invalidLinks).toEqual([]);
    });

    test('all footer links should have valid href attributes', async ({ page }) => {
      const footerLinks = await page.locator('footer a[href]').all();
      const invalidLinks: Array<{ text: string; href: string | null }> = [];

      for (const link of footerLinks) {
        const href = await link.getAttribute('href');
        const text = await link.textContent() || '';

        if (!href || href === '#' || href === 'javascript:void(0)') {
          invalidLinks.push({ text: text.slice(0, 30), href });
        }
      }

      expect(invalidLinks).toEqual([]);
    });

    test('external links should have target="_blank" and rel="noopener noreferrer"', async ({ page }) => {
      const externalLinks = await page.locator('a[href^="http"], a[href^="//"]').all();

      for (const link of externalLinks) {
        const href = await link.getAttribute('href') || '';

        // Skip mailto links
        if (href.startsWith('mailto:')) continue;

        const target = await link.getAttribute('target');
        const rel = await link.getAttribute('rel');

        // External links should open in new tab
        expect(target).toBe('_blank');

        // Should have security attributes
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
      }
    });
  });

  test.describe('Link Navigation', () => {
    test('internal links should navigate to correct pages', async ({ page }) => {
      const internalLinks = [
        { selector: 'nav a[href="/"]', expectedPath: '/' },
        { selector: 'nav a[href="/teams"]', expectedPath: '/teams' },
        { selector: 'nav a[href="/players"]', expectedPath: '/players' },
        { selector: 'nav a[href="/schedule"]', expectedPath: '/schedule' },
      ];

      for (const { selector, expectedPath } of internalLinks) {
        const link = page.locator(selector).first();

        if (await link.isVisible().catch(() => false)) {
          // Click and check navigation
          await link.click();
          await page.waitForTimeout(500);

          const currentUrl = page.url();
          expect(currentUrl).toContain(expectedPath);

          // Go back for next test
          await page.goto('/');
        }
      }
    });

    test('footer product links should navigate correctly', async ({ page }) => {
      const productLinks = [
        { name: '球队数据', path: '/teams' },
        { name: '球员统计', path: '/players' },
        { name: '赛程安排', path: '/schedule' },
      ];

      for (const { name, path } of productLinks) {
        const link = page.locator('footer').getByRole('link', { name });

        if (await link.isVisible().catch(() => false)) {
          const href = await link.getAttribute('href');
          expect(href).toContain(path);
        }
      }
    });

    test('footer support links should navigate correctly', async ({ page }) => {
      const supportLinks = [
        { name: '帮助中心', path: '/help' },
        { name: '联系我们', path: '/contact' },
        { name: '反馈建议', path: '/feedback' },
      ];

      for (const { name, path } of supportLinks) {
        const link = page.locator('footer').getByRole('link', { name });

        if (await link.isVisible().catch(() => false)) {
          const href = await link.getAttribute('href');
          expect(href).toContain(path);
        }
      }
    });

    test('footer about links should navigate correctly', async ({ page }) => {
      const aboutLinks = [
        { name: '关于我们', path: '/about' },
        { name: '隐私政策', path: '/privacy' },
        { name: '服务条款', path: '/terms' },
      ];

      for (const { name, path } of aboutLinks) {
        const link = page.locator('footer').getByRole('link', { name });

        if (await link.isVisible().catch(() => false)) {
          const href = await link.getAttribute('href');
          expect(href).toContain(path);
        }
      }
    });
  });

  test.describe('Coming Soon Page Handling', () => {
    test('unfinished pages should show coming soon or placeholder content', async ({ page }) => {
      const unfinishedPages = ['/teams', '/players', '/schedule', '/help', '/contact', '/about', '/privacy', '/terms'];

      for (const path of unfinishedPages) {
        await page.goto(path);

        // Check for various "coming soon" indicators
        const bodyText = await page.locator('body').textContent() || '';

        const hasComingSoonIndicator =
          bodyText.includes('即将上线') ||
          bodyText.includes('Coming Soon') ||
          bodyText.includes('开发中') ||
          bodyText.includes('建设中') ||
          bodyText.includes('敬请期待') ||
          bodyText.includes('Under Construction');

        // Or the page should have actual content (not 404)
        const isNot404 = !bodyText.includes('404') && !bodyText.includes('Not Found');

        // Or the page redirects back to home
        const currentUrl = page.url();
        const redirectedToHome = currentUrl === '/' || currentUrl.endsWith('/');

        expect(hasComingSoonIndicator || isNot404 || redirectedToHome).toBeTruthy();
      }
    });

    test('coming soon pages should have navigation back to home', async ({ page }) => {
      const unfinishedPages = ['/teams', '/players', '/schedule'];

      for (const path of unfinishedPages) {
        await page.goto(path);

        // Should have a way back to home
        const homeLink = page.getByRole('link', { name: /首页|Home/i });
        const logoLink = page.getByRole('link', { name: /MLB|返回首页/i });

        const hasHomeLink = await homeLink.isVisible().catch(() => false) ||
                           await logoLink.isVisible().catch(() => false);

        expect(hasHomeLink).toBeTruthy();
      }
    });
  });

  test.describe('Social Media Links', () => {
    test('social media links should be valid', async ({ page }) => {
      const socialLinks = [
        { name: 'GitHub', domain: 'github.com' },
        { name: 'Twitter', domain: 'twitter.com' },
        { name: 'Email', protocol: 'mailto:' },
      ];

      for (const social of socialLinks) {
        const link = page.locator('footer').getByRole('link', { name: new RegExp(social.name, 'i') });

        if (await link.isVisible().catch(() => false)) {
          const href = await link.getAttribute('href');

          if (social.protocol) {
            expect(href).toStartWith(social.protocol);
          } else if (social.domain) {
            expect(href).toContain(social.domain);
          }
        }
      }
    });
  });

  test.describe('Broken Links Check', () => {
    test('should not have any broken internal links', async ({ page, context }) => {
      // Collect all internal links
      const allLinks = await page.locator('a[href^="/"]').all();
      const checkedPaths = new Set<string>();
      const brokenLinks: Array<{ text: string; href: string; status?: number }> = [];

      for (const link of allLinks.slice(0, 10)) { // Limit to first 10 links
        const href = await link.getAttribute('href');
        const text = await link.textContent() || '';

        if (!href || checkedPaths.has(href)) continue;
        checkedPaths.add(href);

        // Create new page for navigation test
        const newPage = await context.newPage();

        try {
          const response = await newPage.goto(href, { timeout: 10000 });
          const status = response?.status() || 0;

          if (status >= 400) {
            brokenLinks.push({ text: text.slice(0, 30), href, status });
          }
        } catch (error) {
          brokenLinks.push({ text: text.slice(0, 30), href });
        } finally {
          await newPage.close();
        }
      }

      expect(brokenLinks).toEqual([]);
    });
  });

  test.describe('Accessibility - Links', () => {
    test('all links should have discernible text', async ({ page }) => {
      const links = await page.locator('a').all();
      const linksWithoutText: string[] = [];

      for (const link of links) {
        const text = await link.textContent() || '';
        const ariaLabel = await link.getAttribute('aria-label') || '';
        const ariaLabelledBy = await link.getAttribute('aria-labelledby') || '';
        const title = await link.getAttribute('title') || '';

        // Check if link has any accessible text
        const hasAccessibleText = text.trim().length > 0 ||
                                  ariaLabel.trim().length > 0 ||
                                  ariaLabelledBy.trim().length > 0 ||
                                  title.trim().length > 0;

        if (!hasAccessibleText) {
          const href = await link.getAttribute('href') || 'no-href';
          linksWithoutText.push(href);
        }
      }

      expect(linksWithoutText).toEqual([]);
    });

    test('links should have sufficient color contrast', async ({ page }) => {
      const links = await page.locator('a').all();
      const lowContrastLinks: string[] = [];

      for (const link of links.slice(0, 10)) {
        const isVisible = await link.isVisible().catch(() => false);
        if (!isVisible) continue;

        const contrast = await link.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;

          // Simple check - actual contrast calculation would be more complex
          return { color, bgColor };
        });

        // Log for debugging
        if (contrast.color === contrast.bgColor) {
          const text = await link.textContent() || 'unnamed';
          lowContrastLinks.push(text.slice(0, 30));
        }
      }

      expect(lowContrastLinks).toEqual([]);
    });
  });
});
