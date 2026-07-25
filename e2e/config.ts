import dotenv from 'dotenv';
import type { AvailableModel, ClientOptions } from '@browserbasehq/stagehand';

// Load environment variables before any configuration is evaluated
dotenv.config();

const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || process.env.OPENAI_BASE_URL;

export const config = {
  baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
  timeoutMs: parseInt(process.env.TEST_TIMEOUT_MS || '30000', 10),
  stagehand: {
    env: (process.env.STAGEHAND_ENV as 'LOCAL' | 'BROWSERBASE') || 'LOCAL',
    logLevel: (process.env.STAGEHAND_LOG_LEVEL as 'info' | 'verbose' | 'silent') || 'info',
    headless: process.env.HEADLESS !== 'false',
    modelName: (process.env.STAGEHAND_MODEL || 'gpt-4o') as AvailableModel,
    modelClientOptions: ollamaBaseUrl ? ({
      baseURL: ollamaBaseUrl,
      apiKey: process.env.OPENAI_API_KEY || 'ollama',
    } as ClientOptions) : undefined,
    domSettleTimeoutMs: 3000,
  },
  viewport: {
    width: 1280,
    height: 720,
  },
  cookieStorePath: '.nexus-cookies.json',
  screenshotDir: 'screenshots',
  reportsDir: 'reports',
};

export type FrameworkConfig = typeof config;
