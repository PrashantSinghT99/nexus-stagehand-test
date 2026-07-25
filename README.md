# Nexus Automate — Hybrid Playwright + Stagehand Framework

Nexus Automate is a hybrid E2E automation framework that seamlessly combines deterministic **Playwright** locators with AI-driven **Stagehand** (`@browserbasehq/stagehand`) fallback actions over a single Chrome DevTools Protocol (CDP) browser context.

## Features

- **CDP Bridge**: Playwright and Stagehand share a single browser instance via `connectOverCDP`.
- **Hybrid Routing**: Standard locators run deterministically via Playwright; instructions starting with `ai:` fall back to Stagehand LLM actions.
- **Fast Auth Reuse**: Persistent JSON cookie store skips UI login on repetitive runs.
- **Spec Timeout Enforcement**: Strict timeout limits per spec run.
- **Strict Exit Codes**: Returns exit code `1` on failure to integrate seamlessly with CI pipelines.

## Quickstart

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```

3. Run E2E tests:
   ```bash
   npm run e2e
   ```

## Spec Structure Example

```ts
import { Spec } from '../types.js';

export const exampleSpec: Spec = {
  id: 'SMOKE-001',
  name: 'Search & Verify Example',
  steps: [
    { instruction: 'navigate to https://example.com' },
    { instruction: 'ai: click on the More Information link' },
  ],
  verify: async (page) => {
    // Playwright assertion
    const title = await page.title();
    return title.includes('Example');
  },
};
```

## License

MIT
