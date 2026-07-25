import type { TestResult } from '../types.js';

export function printSuiteHeader(): void {
  console.log('\n======================================================');
  console.log('         Nexus Automate — E2E Test Execution         ');
  console.log('======================================================\n');
}

export function printSpecStart(specId: string, specName: string): void {
  console.log(`\n▶ Running Spec: [${specId}] ${specName}`);
}

export function printSpecResult(result: TestResult): void {
  const icon = result.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} [${result.specId}] ${result.specName} (${result.durationMs}ms)`);
  if (!result.passed && result.error) {
    console.error(`   Error: ${result.error.message}`);
    if (result.screenshotPath) {
      console.log(`   Screenshot saved: ${result.screenshotPath}`);
    }
  }
}

export function printSuiteSummary(results: TestResult[]): void {
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  const totalTime = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log('\n======================================================');
  console.log(` Summary: ${passed}/${total} Passed | ${failed} Failed | Duration: ${totalTime}ms`);
  console.log('======================================================\n');
}
