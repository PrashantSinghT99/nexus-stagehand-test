import type { Page } from 'playwright';
import type { Stagehand } from '@browserbasehq/stagehand';
import type { Step } from '../types.js';

export async function executeStep(page: Page, stagehand: Stagehand, step: Step): Promise<void> {
  const instruction = step.instruction.trim();
  const action = (step.action || instruction).toLowerCase();

  // Route to AI (Stagehand) if instruction is prefixed with 'ai:'
  if (instruction.startsWith('ai:')) {
    const aiAction = instruction.slice(3).trim();
    await stagehand.page.act(aiAction);
    return;
  }

  // Handle standard navigation instructions
  if (instruction.toLowerCase().startsWith('navigate to ')) {
    const url = instruction.slice(12).trim();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return;
  }

  if (instruction.toLowerCase().startsWith('goto ')) {
    const url = instruction.slice(5).trim();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    return;
  }

  // Handle fill/type actions
  if ((action === 'fill' || action === 'type') && step.selector && step.value !== undefined) {
    await page.fill(step.selector, step.value);
    return;
  }

  // Handle click actions
  if (action === 'click' && step.selector) {
    await page.click(step.selector);
    return;
  }

  // Generic locator fallback for non-AI instruction
  if (step.selector) {
    await page.locator(step.selector).click();
  } else {
    // If no explicit selector is provided and not AI, try finding text or locator directly
    await page.locator(instruction).click();
  }
}
