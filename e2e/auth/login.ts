import type { Page, BrowserContext } from 'playwright';
import type { UserCredentials } from '../types.js';
import { saveUserCookies, loadUserCookies } from './cookie-store.js';
import { config } from '../config.js';

export async function loginAsUser(
  page: Page,
  context: BrowserContext,
  user: UserCredentials
): Promise<void> {
  // Check if saved cookies exist and are valid
  const hasCookies = await loadUserCookies(context, user.email);
  if (hasCookies) {
    return;
  }

  // Navigate to login page
  const loginUrl = `${config.baseUrl}/login`;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

  // Native Playwright locators for fast deterministic login
  await page.fill('input[type="email"], input[name="email"], input[name="username"]', user.email);
  await page.fill('input[type="password"], input[name="password"]', user.password);
  await page.click('button[type="submit"], input[type="submit"]');

  // Wait for navigation / authenticated indicator
  await page.waitForLoadState('networkidle');

  // Persist cookies for subsequent runs
  await saveUserCookies(context, user.email);
}
