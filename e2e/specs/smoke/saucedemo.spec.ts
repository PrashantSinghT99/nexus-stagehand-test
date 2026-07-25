import type { Spec } from '../../types.js';

export const saucedemoSpec: Spec = {
  id: 'SAUCE-001',
  name: 'SauceDemo E2E Login & Add To Cart Verification',
  description: 'Navigates to SauceDemo, authenticates standard_user, adds Sauce Labs Backpack to cart, and verifies cart inventory.',
  steps: [
    { instruction: 'navigate to https://www.saucedemo.com' },
    { instruction: 'fill username', action: 'fill', selector: '#user-name', value: 'standard_user' },
    { instruction: 'fill password', action: 'fill', selector: '#password', value: 'secret_sauce' },
    { instruction: 'click login', action: 'click', selector: '#login-button' },
    { instruction: 'click add to cart', action: 'click', selector: '#add-to-cart-sauce-labs-backpack' },
    { instruction: 'click cart link', action: 'click', selector: '.shopping_cart_link' },
  ],
  verify: async (page) => {
    // Verify user redirected to cart page
    const currentUrl = page.url();
    const isCartUrl = currentUrl.includes('/cart.html');

    // Verify item name in cart container
    const cartItemName = await page.textContent('.inventory_item_name');
    const hasItem = cartItemName?.trim() === 'Sauce Labs Backpack';

    // Verify cart badge count
    const badgeText = await page.textContent('.shopping_cart_badge');
    const hasBadge = badgeText?.trim() === '1';

    return isCartUrl && hasItem && hasBadge;
  },
};
