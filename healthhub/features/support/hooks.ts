import { After, Before } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import type { HealthHubWorld } from '@support/world';

Before(async function (this: HealthHubWorld) {
  const credentialsPath = resolve(process.cwd(), 'healthhub', 'env.local.json');
  this.credentials = JSON.parse(readFileSync(credentialsPath, 'utf8')) as {
    email?: string;
    password?: string;
  };

  this.browser = await chromium.launch({ headless: process.env.HEALTHHUB_HEADLESS !== 'false' });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function (this: HealthHubWorld) {
  await this.context?.close();
  await this.browser?.close();
});