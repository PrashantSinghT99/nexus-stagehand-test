import type { Page } from 'playwright';
import type { Stagehand } from '@browserbasehq/stagehand';
import type { z, AnyZodObject } from 'zod';
import type { VerifierFn } from '../types.js';

export async function runVerification(
  page: Page,
  stagehand: Stagehand,
  verify: VerifierFn
): Promise<boolean> {
  return await verify(page, stagehand);
}

/**
 * AI Extract verification helper for Zod schema evaluation.
 */
export async function verifyWithAIExtract<T extends AnyZodObject>(
  stagehand: Stagehand,
  instruction: string,
  schema: T
): Promise<z.infer<T>> {
  return await stagehand.page.extract({
    instruction,
    schema,
  });
}
