import { World, setWorldConstructor, type IWorldOptions } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';

export class HealthHubWorld extends World {
  credentials?: { email?: string; password?: string };
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  appointmentTitle?: string;
  medicationName?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  get currentPage(): Page {
    if (!this.page) {
      throw new Error('Browser page has not been initialized for this scenario.');
    }
    return this.page;
  }
}

setWorldConstructor(HealthHubWorld);