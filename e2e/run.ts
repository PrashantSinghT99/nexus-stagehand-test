import type { Spec, TestResult } from './types.js';
import { runSpec } from './engine/lifecycle.js';
import { printSuiteHeader, printSpecStart, printSpecResult, printSuiteSummary } from './reporting/console.js';
import { exampleSpec } from './specs/smoke/example.spec.js';
import { saucedemoSpec } from './specs/smoke/saucedemo.spec.js';

async function main(): Promise<void> {
  printSuiteHeader();

  // Spec discovery list
  const specs: Spec[] = [
    exampleSpec,
    saucedemoSpec,
  ];

  const results: TestResult[] = [];

  for (const spec of specs) {
    printSpecStart(spec.id, spec.name);
    const result = await runSpec(spec);
    printSpecResult(result);
    results.push(result);
  }

  printSuiteSummary(results);

  const hasFailures = results.some((r) => !r.passed);
  if (hasFailures) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal runner failure:', err);
  process.exit(1);
});
