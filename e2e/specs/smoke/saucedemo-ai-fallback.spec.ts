import type { Spec } from '../../types.js';

export const saucedemoAIFallbackSpec: Spec = {
  id: 'SAUCE-002',
  name: 'SauceDemo AI Fallback & Decision Making',
  description: 'Demonstrates Stagehand AI decision making with automatic deterministic locator fallback.',
  timeoutMs: 15000,
  steps: [
    { instruction: 'navigate to https://www.saucedemo.com' },
    { instruction: 'fill username', action: 'fill', selector: '#user-name', value: 'standard_user' },
    { instruction: 'fill password', action: 'fill', selector: '#password', value: 'secret_sauce' },
    { instruction: 'click login', action: 'click', selector: '#login-button' },
    // AI Fallback step: Tries Stagehand AI decision making first; falls back to locator if LLM is slow/unavailable
    { 
      instruction: 'ai: click on the Add to cart button for Sauce Labs Bike Light',
      selector: '#add-to-cart-sauce-labs-bike-light'
    },
    { instruction: 'click cart link', action: 'click', selector: '.shopping_cart_link' },
  ],
  verify: async (page) => {
    const isCartUrl = page.url().includes('/cart.html');
    const badgeText = await page.textContent('.shopping_cart_badge');
    const cartItem = await page.textContent('.inventory_item_name');

    return isCartUrl && badgeText?.trim() === '1' && (cartItem?.includes('Bike Light') ?? false);
  },
};
