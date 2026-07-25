import fs from 'fs';
import path from 'path';
import type { BrowserContext, Cookie } from 'playwright';
import { config } from '../config.js';

interface CookieStoreData {
  [userEmail: string]: {
    savedAt: string;
    cookies: Cookie[];
  };
}

function getStoreFilePath(): string {
  return path.resolve(process.cwd(), config.cookieStorePath);
}

function loadStore(): CookieStoreData {
  const filePath = getStoreFilePath();
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStore(data: CookieStoreData): void {
  const filePath = getStoreFilePath();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function saveUserCookies(context: BrowserContext, userEmail: string): Promise<void> {
  const cookies = await context.cookies();
  const store = loadStore();
  store[userEmail] = {
    savedAt: new Date().toISOString(),
    cookies,
  };
  saveStore(store);
}

export async function loadUserCookies(context: BrowserContext, userEmail: string): Promise<boolean> {
  const store = loadStore();
  const userData = store[userEmail];
  if (!userData || !userData.cookies || userData.cookies.length === 0) {
    return false;
  }
  await context.addCookies(userData.cookies);
  return true;
}

export function clearCookieStore(): void {
  const filePath = getStoreFilePath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
