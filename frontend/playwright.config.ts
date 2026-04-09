import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for integration and E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Use system Chrome if Playwright browsers not available
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  },

  projects: [
    // Desktop viewports
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },

    // Responsive breakpoints
    {
      name: 'Mobile 320px',
      use: {
        viewport: { width: 320, height: 568 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
    },
    {
      name: 'Mobile 375px',
      use: {
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
    },
    {
      name: 'Tablet 768px',
      use: {
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)',
      },
    },
    {
      name: 'Laptop 1024px',
      use: {
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'Desktop 1440px',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'Desktop 1920px',
      use: {
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
