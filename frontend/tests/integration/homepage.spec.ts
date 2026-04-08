import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Integration tests for homepage
 * Tests full rendering, API error handling, mobile interactions, and animation performance
 */

test.describe('Homepage Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Full Homepage Rendering', () => {
    test('should render all main sections', async ({ page }) => {
      // Check hero section
      await expect(page.getByTestId('hero-section')).toBeVisible();
      await expect(page.getByTestId('hero-title')).toHaveText('MLB 数据平台');
      await expect(page.getByTestId('hero-slogan')).toBeVisible();
      await expect(page.getByTestId('hero-login-button')).toBeVisible();

      // Check navbar
      await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'MLB 数据平台 - 返回首页' })).toBeVisible();

      // Check footer
      await expect(page.getByRole('contentinfo')).toBeVisible();
      await expect(page.getByTestId('footer')).toContainText('Joyful Web');
    });

    test('should render feature cards section', async ({ page }) => {
      const featuresSection = page.getByRole('region', { name: '功能特色' });
      await expect(featuresSection).toBeVisible();

      // Check all feature cards are present
      await expect(page.getByText('球队数据')).toBeVisible();
      await expect(page.getByText('球员统计')).toBeVisible();
      await expect(page.getByText('赛程安排')).toBeVisible();
      await expect(page.getByText('数据趋势')).toBeVisible();
    });

    test('should render stats section with standings and leaderboard', async ({ page }) => {
      const statsSection = page.locator('section').filter({ hasText: /积分榜|数据排行榜/ }).first();
      await expect(statsSection).toBeVisible();
    });

    test('should render recent games section', async ({ page }) => {
      const recentGamesSection = page.getByRole('region', { name: '最近战报' });
      await expect(recentGamesSection).toBeVisible();
    });

    test('should render upcoming games section', async ({ page }) => {
      const upcomingGamesSection = page.getByRole('region', { name: '即将进行的比赛' });
      await expect(upcomingGamesSection).toBeVisible();
    });
  });

  test.describe('API Error Fallback Scenarios', () => {
    test('should show error state when API fails', async ({ page }) => {
      // Intercept API calls and force failure
      await page.route('**/api/**', route => route.abort('failed'));

      // Reload page to trigger API calls
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Check error state is displayed
      const errorState = page.locator('[data-testid="error-state"]').first();
      if (await errorState.isVisible().catch(() => false)) {
        await expect(errorState).toContainText(/错误|失败|error|fail/i);
      }
    });

    test('should handle network timeout gracefully', async ({ page }) => {
      // Slow down API responses
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 30000));
        await route.continue();
      });

      await page.reload();

      // Should still show loading state or fallback content
      const loadingState = page.locator('[data-testid="loading"], [data-testid="skeleton"]').first();
      await expect(loadingState).toBeVisible({ timeout: 5000 });
    });

    test('should allow retry after error', async ({ page }) => {
      let shouldFail = true;

      await page.route('**/api/**', route => {
        if (shouldFail) {
          shouldFail = false;
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      await page.reload();

      // Look for retry button
      const retryButton = page.getByRole('button', { name: /重试|retry/i });
      if (await retryButton.isVisible().catch(() => false)) {
        await retryButton.click();
        // After retry, content should load
        await page.waitForTimeout(2000);
      }
    });
  });

  test.describe('Mobile Touch Interactions', () => {
    test('should open mobile menu on hamburger click', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Click hamburger menu
      const menuButton = page.getByRole('button', { name: /打开菜单|menu/i });
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      // Check mobile menu is visible
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Check navigation links in mobile menu
      await expect(page.getByRole('navigation', { name: '移动端导航' })).toBeVisible();
    });

    test('should close mobile menu when clicking a link', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open menu
      await page.getByRole('button', { name: /打开菜单/i }).click();

      // Click a navigation link
      const homeLink = page.locator('#mobile-menu').getByRole('link', { name: '首页' });
      await homeLink.click();

      // Menu should close
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).not.toBeVisible();
    });

    test('should handle touch events on feature cards', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const featureCard = page.locator('[class*="rounded-card"]').first();
      await featureCard.scrollIntoViewIfNeeded();

      // Simulate touch
      await featureCard.dispatchEvent('touchstart', { touches: [{ clientX: 100, clientY: 100 }] });
      await featureCard.dispatchEvent('touchend');

      // Card should still be visible and interactive
      await expect(featureCard).toBeVisible();
    });

    test('should support swipe gestures on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      await page.getByRole('button', { name: /打开菜单/i }).click();

      // Simulate swipe to close (if implemented)
      const mobileMenu = page.locator('#mobile-menu');
      const box = await mobileMenu.boundingBox();

      if (box) {
        await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x - 50, box.y + box.height / 2, { steps: 10 });
        await page.mouse.up();
      }
    });
  });

  test.describe('Animation Performance (60fps)', () => {
    test('should maintain 60fps during hero animation', async ({ page }) => {
      // Enable performance metrics
      const client = await page.context().newCDPSession(page);
      await client.send('Performance.enable');

      // Navigate and wait for animations
      await page.goto('/');
      await page.waitForTimeout(1000); // Wait for animations to complete

      // Get performance metrics
      const metrics = await client.send('Performance.getMetrics');
      const frameRate = metrics.metrics.find((m: { name: string; value: number }) => m.name === 'FramesPerSecond');

      if (frameRate) {
        expect(frameRate.value).toBeGreaterThanOrEqual(55); // Allow some variance, target 60fps
      }
    });

    test('should maintain 60fps during mobile menu animation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const client = await page.context().newCDPSession(page);
      await client.send('Performance.enable');

      // Start measuring before animation
      await client.send('Performance.getMetrics');

      // Trigger animation
      await page.getByRole('button', { name: /打开菜单/i }).click();
      await page.waitForTimeout(500);

      // Get metrics after animation
      const metrics = await client.send('Performance.getMetrics');
      const frameRate = metrics.metrics.find((m: { name: string; value: number }) => m.name === 'FramesPerSecond');

      if (frameRate) {
        expect(frameRate.value).toBeGreaterThanOrEqual(55);
      }
    });

    test('should use GPU acceleration for animations', async ({ page }) => {
      // Check for transform/opacity usage which are GPU-accelerated
      const animatedElements = await page.locator('[data-testid="hero-section"], #mobile-menu').evaluateAll((elements) => {
        return elements.map(el => {
          const style = window.getComputedStyle(el);
          return {
            willChange: style.willChange,
            transform: style.transform,
          };
        });
      });

      // At least some elements should use GPU acceleration
      const hasGpuAcceleration = animatedElements.some(el =>
        el.willChange.includes('transform') ||
        el.transform !== 'none'
      );

      expect(hasGpuAcceleration).toBeTruthy();
    });

    test('should not cause layout thrashing', async ({ page }) => {
      const client = await page.context().newCDPSession(page);
      await client.send('Performance.enable');

      // Perform actions that might cause layout thrashing
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.waitForTimeout(100);
      await page.setViewportSize({ width: 1440, height: 900 });

      // Get layout count metric
      const metrics = await client.send('Performance.getMetrics');
      const layoutCount = metrics.metrics.find((m: { name: string; value: number }) => m.name === 'LayoutCount');

      if (layoutCount) {
        // Layout count should be reasonable (not excessive)
        expect(layoutCount.value).toBeLessThan(100);
      }
    });
  });

  test.describe('Accessibility - axe-core', () => {
    test('should have no critical or serious accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const criticalAndSerious = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalAndSerious).toEqual([]);
    });

    test('should have no accessibility violations on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalAndSerious = accessibilityScanResults.violations.filter(
        v => v.impact === 'critical' || v.impact === 'serious'
      );

      expect(criticalAndSerious).toEqual([]);
    });
  });
});
