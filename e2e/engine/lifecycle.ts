import fs from 'fs';
import path from 'path';
import type { Spec, TestResult } from '../types.js';
import { createSharedSession, type SharedBrowserSession } from '../core/browser.js';
import { executeStep } from './executor.js';
import { runVerification } from './verifier.js';
import { getUser } from '../auth/users.js';
import { loginAsUser } from '../auth/login.js';
import { config } from '../config.js';

export async function runSpec(spec: Spec): Promise<TestResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  const sessionHolder: { current: SharedBrowserSession | null } = { current: null };
  let screenshotPath: string | undefined = undefined;

  const timeoutMs = spec.timeoutMs || config.timeoutMs;

  const executionPromise = async (): Promise<void> => {
    const session = await createSharedSession();
    sessionHolder.current = session;
    const { page, context, stagehand } = session;

    // Perform authentication if spec mandates a specific user role
    if (spec.role) {
      const user = getUser(spec.role);
      await loginAsUser(page, context, user);
    }

    // Optional Spec setup phase
    if (spec.setup) {
      logs.push('Executing setup phase...');
      await spec.setup(page);
    }

    // Spec step execution phase
    for (const step of spec.steps) {
      logs.push(`Executing step: ${step.instruction}`);
      await executeStep(page, stagehand, step);
    }

    // Spec verification phase
    logs.push('Executing verification phase...');
    const passed = await runVerification(page, stagehand, spec.verify);
    if (!passed) {
      throw new Error(`Verification failed for spec [${spec.id}] ${spec.name}`);
    }

    // Optional Spec teardown phase
    if (spec.teardown) {
      logs.push('Executing teardown phase...');
      await spec.teardown(page);
    }
  };

  const timeoutPromise = new Promise<void>((_, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Spec [${spec.id}] timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    if (timer.unref) timer.unref();
  });

  try {
    await Promise.race([executionPromise(), timeoutPromise]);
    const durationMs = Date.now() - startTime;
    return {
      specId: spec.id,
      specName: spec.name,
      passed: true,
      durationMs,
      logs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const session = sessionHolder.current;

    // Capture failure screenshot if session exists
    if (session && session.page) {
      try {
        if (!fs.existsSync(config.screenshotDir)) {
          fs.mkdirSync(config.screenshotDir, { recursive: true });
        }
        const fileName = `${spec.id}_${Date.now()}.png`;
        screenshotPath = path.join(config.screenshotDir, fileName);
        await session.page.screenshot({ path: screenshotPath, fullPage: true });
      } catch (err) {
        logs.push(`Failed to capture screenshot: ${(err as Error).message}`);
      }
    }

    return {
      specId: spec.id,
      specName: spec.name,
      passed: false,
      durationMs,
      error: error instanceof Error ? error : new Error(String(error)),
      screenshotPath,
      logs,
    };
  } finally {
    if (sessionHolder.current) {
      await sessionHolder.current.close().catch(() => {});
    }
  }
}
