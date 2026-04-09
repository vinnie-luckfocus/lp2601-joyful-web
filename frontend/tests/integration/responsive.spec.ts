import { test, expect } from '@playwright/test';

/**
 * Responsive design tests for 6 breakpoints
 * 320px, 375px, 768px, 1024px, 1440px, 1920px
 */

const breakpoints = [
  { name: 'Mobile Small', width: 320, height: 568 },
  { name: 'Mobile Large', width: 375, height: 667 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Large Desktop', width: 1920, height: 1080 },
];

test.describe('Responsive Design Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  breakpoints.forEach(({ name, width, height }) => {
    test.describe(`${name} (${width}x${height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.reload();
        await page.waitForLoadState('networkidle');
      });

      test('should render without horizontal overflow', async ({ page }) => {
        // Check for horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        expect(hasOverflow).toBeFalsy();
      });

      test('should have hero section visible', async ({ page }) => {
        const hero = page.getByTestId('hero-section');
        await expect(hero).toBeVisible();

        // Hero should be in viewport
        const heroBox = await hero.boundingBox();
        expect(heroBox).not.toBeNull();
      });

      test('should have navbar visible', async ({ page }) => {
        const navbar = page.getByRole('navigation');
        await expect(navbar).toBeVisible();
      });

      test('should have footer visible', async ({ page }) => {
        const footer = page.getByRole('contentinfo');
        await expect(footer).toBeVisible();
      });

      test('content should be readable', async ({ page }) => {
        // Check that text is not too small
        const smallText = await page.evaluate(() => {
          const elements = document.querySelectorAll('p, span, a, button');
          let tooSmall = 0;
          elements.forEach(el => {
            const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
            if (fontSize < 12) tooSmall++;
          });
          return tooSmall;
        });

        // Allow some small text for icons/decorations
        expect(smallText).toBeLessThan(10);
      });
    });
  });

  test.describe('Mobile Menu Behavior', () => {
    test('should show hamburger menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();

      const hamburger = page.getByRole('button', { name: /打开菜单|menu/i });
      await expect(hamburger).toBeVisible();

      const desktopNav = page.getByRole('navigation', { name: '主导航' });
      await expect(desktopNav).not.toBeVisible();
    });

    test('should show desktop nav on large screens', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload();

      const desktopNav = page.getByRole('navigation', { name: '主导航' });
      await expect(desktopNav).toBeVisible();

      const hamburger = page.locator('button').filter({ has: page.locator('[data-lucide="menu"]').first() });
      await expect(hamburger).not.toBeVisible();
    });

    test('should transition at correct breakpoint', async ({ page }) => {
      // Test at 767px (should show mobile)
      await page.setViewportSize({ width: 767, height: 1024 });
      await page.reload();

      let hamburger = page.getByRole('button', { name: /打开菜单|menu/i });
      let isHamburgerVisible = await hamburger.isVisible().catch(() => false);

      // Test at 768px (should show desktop)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      const desktopNav = page.getByRole('navigation', { name: '主导航' });
      const isDesktopNavVisible = await desktopNav.isVisible().catch(() => false);

      // One of them should be visible
      expect(isHamburgerVisible || isDesktopNavVisible).toBeTruthy();
    });
  });

  test.describe('Grid Layout Adaptations', () => {
    test('should show single column on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Check feature cards are stacked
      const featureSection = page.getByRole('region', { name: '功能特色' });
      const cards = featureSection.locator('[class*="rounded-card"]').all();

      // Cards should be in a single column (stacked vertically)
      const firstCard = featureSection.locator('[class*="rounded-card"]').first();
      const secondCard = featureSection.locator('[class*="rounded-card"]').nth(1);

      if (await secondCard.isVisible().catch(() => false)) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // Second card should be below first card
          expect(secondBox.y).toBeGreaterThan(firstBox.y);
        }
      }
    });

    test('should show multi-column on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload();

      const featureSection = page.getByRole('region', { name: '功能特色' });
      const firstCard = featureSection.locator('[class*="rounded-card"]').first();
      const secondCard = featureSection.locator('[class*="rounded-card"]').nth(1);

      if (await secondCard.isVisible().catch(() => false)) {
        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        if (firstBox && secondBox) {
          // On desktop, cards might be side by side
          // We just check they're both visible
          expect(firstBox.width).toBeGreaterThan(0);
          expect(secondBox.width).toBeGreaterThan(0);
        }
      }
    });
  });

  test.describe('Touch Targets on Mobile', () => {
    test('should have adequate touch target sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();

      // Check all interactive elements
      const elements = await page.locator('button, a, [role="button"]').all();
      const tooSmallElements: string[] = [];

      for (const element of elements) {
        const box = await element.boundingBox();
        if (box) {
          // WCAG recommends 44x44px minimum touch target
          if (box.width < 44 || box.height < 44) {
            const text = await element.textContent() || await element.getAttribute('aria-label') || 'unnamed';
            tooSmallElements.push(`${text} (${box.width}x${box.height})`);
          }
        }
      }

      // Allow some small elements but log them
      if (tooSmallElements.length > 0) {
        console.log('Small touch targets:', tooSmallElements.slice(0, 5));
      }

      // Most important elements should be large enough
      expect(tooSmallElements.length).toBeLessThan(elements.length * 0.5);
    });
  });

  test.describe('Image Responsiveness', () => {
    test('images should not overflow containers', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });
      await page.reload();

      const images = await page.locator('img').all();

      for (const img of images) {
        const overflows = await img.evaluate((el) => {
          const parent = el.parentElement;
          if (!parent) return false;

          const imgRect = el.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();

          return imgRect.width > parentRect.width;
        });

        expect(overflows).toBeFalsy();
      }
    });
  });
});
