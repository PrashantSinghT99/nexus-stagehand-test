import type { Page } from 'playwright';
import type { Stagehand } from '@browserbasehq/stagehand';

export type UserRole = 'admin' | 'user';

export interface UserCredentials {
  role: UserRole;
  email: string;
  password: string;
}

export type StepAction = 'click' | 'type' | 'navigate' | 'fill' | 'custom';

export interface Step {
  /**
   * Plain action instruction or selector.
   * If prefixed with `ai:`, it will be executed via Stagehand LLM.
   */
  instruction: string;
  selector?: string;
  value?: string;
  action?: StepAction;
}

export type VerifierFn = (page: Page, stagehand?: Stagehand) => Promise<boolean>;

export interface Spec {
  id: string;
  name: string;
  description?: string;
  role?: UserRole;
  timeoutMs?: number;
  setup?: (page: Page) => Promise<void>;
  steps: Step[];
  verify: VerifierFn;
  teardown?: (page: Page) => Promise<void>;
}

export interface TestResult {
  specId: string;
  specName: string;
  passed: boolean;
  durationMs: number;
  error?: Error;
  screenshotPath?: string;
  logs: string[];
}
