import { defineConfig } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Restful-Booker: offene Übungs-API, https://restful-booker.herokuapp.com/apidoc/index.html
type LocalConfig = {
  baseURL?: string;
  username?: string;
  password?: string;
  bookingData?: {
    firstname?: string;
    lastname?: string;
    totalprice?: number;
    depositpaid?: boolean;
    bookingdates?: { checkin?: string; checkout?: string };
    additionalneeds?: string;
  };
};

const credentialsPath = resolve(__dirname, 'env.local.json');
let localConfig: LocalConfig = {};
try {
  localConfig = JSON.parse(readFileSync(credentialsPath, 'utf8')) as LocalConfig;
  process.env.BOOKER_USERNAME ??= localConfig.username;
  process.env.BOOKER_PASSWORD ??= localConfig.password;
  process.env.BOOKER_BASE_URL ??= localConfig.baseURL;
  process.env.BOOKER_TEST_DATA ??= JSON.stringify(localConfig.bookingData ?? {});
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
    throw new Error(`Could not read Restful-Booker credentials from ${credentialsPath}: ${String(error)}`);
  }
}

const proxyServer = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Die Heroku-App antwortet nach Pausen beim ersten Aufruf langsam.
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    // Hinter dem Firmen-Proxy: request nutzt HTTPS_PROXY nicht von selbst.
    ...(proxyServer ? { proxy: { server: proxyServer } } : {}),
  },
  projects: [{ name: 'api' }],
});
