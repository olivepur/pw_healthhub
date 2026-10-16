import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const bddTestDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/playwright-steps/**/*.ts',
  outputDir: 'tests/bdd-generated',
});

const credentialsPath = resolve(__dirname, 'env.local.json');
try {
  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf8')) as {
    email?: string;
    password?: string;
  };
  process.env.HEALTHHUB_EMAIL ??= credentials.email;
  process.env.HEALTHHUB_PASSWORD ??= credentials.password;
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw new Error(`Could not read HealthHub credentials from ${credentialsPath}: ${String(error)}`);
  }
}

export default defineConfig({
  testDir: bddTestDir,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: 'https://healthhub.qualintia.com',
    trace: 'retain-on-failure',
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'healthhub-bdd',
    },
    {
      name: 'healthhub-spec',
      testDir: './tests',
      testMatch: ['*.spec.ts'],
    },
  ],
});