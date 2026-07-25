import { Stagehand } from '@browserbasehq/stagehand';
import type { Browser, BrowserContext, Page } from 'playwright';
import { config } from '../config.js';

export interface SharedBrowserSession {
  stagehand: Stagehand;
  browser: Browser | null;
  context: BrowserContext;
  page: Page;
  close: () => Promise<void>;
}

/**
 * Initializes Stagehand and shares its underlying Playwright context and page.
 */
export async function createSharedSession(): Promise<SharedBrowserSession> {
  const stagehand = new Stagehand({
    env: config.stagehand.env,
    headless: config.stagehand.headless,
    modelName: config.stagehand.modelName,
    domSettleTimeoutMs: config.stagehand.domSettleTimeoutMs,
  });

  await stagehand.init();

  const context = stagehand.context as unknown as BrowserContext;
  const page = stagehand.page as unknown as Page;
  const browser = (context.browser ? context.browser() : null) as Browser | null;

  return {
    stagehand,
    browser,
    context,
    page,
    close: async () => {
      await stagehand.close().catch(() => {});
    },
  };
}
