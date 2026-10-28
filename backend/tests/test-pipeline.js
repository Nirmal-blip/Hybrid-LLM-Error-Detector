/**
 * End-to-End Pipeline Unit and Integration Test
 */

import { compileCpp, cleanupTempDir } from '../src/modules/compiler.js';
import { runStaticChecks } from '../src/modules/staticChecker.js';
import { runTestCases } from '../src/modules/testRunner.js';
import { reconcileFindings } from '../src/modules/reconciliation.js';
import { generateReport } from '../src/modules/reportGenerator.js';

async function runPipelineTests() {
  console.log('🧪 Starting Hybrid Error Detection Pipeline Tests...\n');

  // Test 1: Static Checker
  console.log('Test 1: Testing Static Code Analyzer...');
  const buggyCode = `
#include <iostream>
using namespace std;
int main() {
    int x = 5;
    if (x = 10) { // Bug: assignment in if
        cout << "Oops" << endl;
    }
    for (int i = 0; i <= 5; i++) { // Bug: off-by-one on <= 5
        cout << i << endl;
    }
    int mid = (0 + 100) / 2; // Mid overflow risk
    return 0;
}
  `;
  const staticFindings = runStaticChecks(buggyCode);
  console.log(`✓ Static Checker found ${staticFindings.length} findings:`);
  staticFindings.forEach((f) => console.log(`  - [${f.severity}] Line ${f.line}: ${f.title}`));
  if (staticFindings.length < 2) {
    throw new Error('Static analysis failed to detect expected bug patterns.');
  }

  // Test 2: C++ Compilation
  console.log('\nTest 2: Testing Isolated C++ Compilation...');
  const compileRes = await compileCpp(buggyCode);
  console.log(`✓ Compilation completed: success=${compileRes.success}, duration=${compileRes.durationMs}ms`);
  console.log(`✓ Diagnostics captured: ${compileRes.diagnostics.length} lines`);
  if (!compileRes.success) {
    throw new Error('Compilation failed unexpectedly for valid C++ syntax.');
  }

  // Test 3: Sandboxed Test Case Execution
  console.log('\nTest 3: Testing Sandboxed Execution & Test Runner...');
  const testCases = [
    { id: '1', name: 'Smoke Test', input: '', expectedOutput: 'Oops\n0\n1\n2\n3\n4\n5' }
  ];
  const testRes = await runTestCases(compileRes.binaryPath, testCases, 2000);
  console.log(`✓ Tests executed: ${testRes.totalTests}, passed: ${testRes.passedCount}, failed: ${testRes.failedCount}`);
  await cleanupTempDir(compileRes.tempDir);

  // Test 4: Infinite Loop Timeout in Sandbox
  console.log('\nTest 4: Testing Infinite Loop Detection & Sandbox Timeout...');
  const infiniteLoopCode = `
#include <iostream>
int main() {
    volatile int x = 0;
    while(true) { x++; }
    return 0;
}
  `;
  const infCompile = await compileCpp(infiniteLoopCode);
  const timeoutTest = await runTestCases(infCompile.binaryPath, [{ id: 't1', input: '' }], 800);
  console.log(`✓ Timeout handling status: ${timeoutTest.testResults[0].status}`);
  if (timeoutTest.testResults[0].status !== 'TIME_LIMIT_EXCEEDED') {
    throw new Error('Failed to enforce execution timeout limit.');
  }
  await cleanupTempDir(infCompile.tempDir);

  // Test 5: Bug Reconciliation
  console.log('\nTest 5: Testing Evidence-Based Bug Reconciliation...');
  const mockLLMBugs = [
    {
      id: 'llm-1',
      title: 'Assignment in Conditional',
      category: 'Logical Operator Bug',
      severity: 'Critical',
      lines: [6],
      rootCause: 'Using assignment = instead of equality ==',
      confidence: 0.95
    }
  ];
  const reconciled = reconcileFindings({
    llmFindings: mockLLMBugs,
    compilerResult: compileRes,
    staticFindings,
    testSummary: testRes
  });
  console.log(`✓ Reconciled bugs: ${reconciled.reconciledBugs.length}`);
  console.log(`  - Verified: ${reconciled.summary.verified}`);
  console.log(`  - Suspected: ${reconciled.summary.suspected}`);
  console.log(`  - Unverified: ${reconciled.summary.unverified}`);

  // Test 6: Report Generation
  console.log('\nTest 6: Testing Report Generation & Line Diff...');
  const report = generateReport({
    sourceCode: buggyCode,
    problemStatement: 'Print 0 to 5',
    compilerResult: compileRes,
    staticFindings,
    testSummary: testRes,
    groqResult: {
      model: 'llama-3.3-70b-versatile',
      source: 'groq',
      analysisSummary: 'Found assignment in if and off-by-one.',
      correctedCode: buggyCode.replace('x = 10', 'x == 10'),
      fixExplanation: 'Replaced assignment operator.'
    },
    reconciliationResult: reconciled
  });

  console.log(`✓ Report ID: ${report.id}`);
  console.log(`✓ Verdict: ${report.verdict}`);
  console.log(`✓ Diff lines computed: ${report.lineDiff.length}`);

  console.log('\n🎉 ALL PIPELINE TESTS PASSED SUCCESSFULLY!\n');
}

runPipelineTests().catch((err) => {
  console.error('❌ Pipeline Test Failure:', err);
  process.exit(1);
});
