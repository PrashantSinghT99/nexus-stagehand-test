import type { Page } from 'playwright';
import type { Stagehand } from '@browserbasehq/stagehand';
import type { Step } from '../types.js';

export async function executeStep(page: Page, stagehand: Stagehand, step: Step): Promise<void> {
  const instruction = step.instruction.trim();
  const action = (step.action || instruction).toLowerCase();

  // Route to AI (Stagehand) if instruction is prefixed with 'ai:'
  if (instruction.startsWith('ai:')) {
    const aiAction = instruction.slice(3).trim();
    try {
      const aiPromise = stagehand.page.act(aiAction);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI decision timeout (5000ms)')), 5000)
      );
      await Promise.race([aiPromise, timeoutPromise]);
      return;
    } catch (err: any) {
      // Hybrid Fallback: If AI step is slow or unconfigured, execute Playwright fallback locator
      if (step.selector) {
        console.warn(`⚠️ [AI Fallback Triggered] ${err.message}. Executing fallback locator: ${step.selector}`);
        await page.locator(step.selector).click();
        return;
      }
      throw err;
    }
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
    await page.locator(instruction).click();
  }
}
