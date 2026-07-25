import type { Spec } from '../../types.js';

export const exampleSpec: Spec = {
  id: 'SMOKE-001',
  name: 'Example Domain Verification',
  description: 'Verifies home navigation and page content on example.com',
  steps: [
    { instruction: 'navigate to https://example.com' },
  ],
  verify: async (page) => {
    const title = await page.title();
    const heading = await page.textContent('h1');
    return title.includes('Example Domain') && (heading?.includes('Example Domain') ?? false);
  },
};
