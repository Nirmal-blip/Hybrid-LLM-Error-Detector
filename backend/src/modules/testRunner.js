/**
 * Test Runner Module
 * Runs test cases against compiled binary and compares results.
 */

import { executeBinary } from './sandbox.js';

export async function runTestCases(binaryPath, testCases = [], timeoutMs = 2000) {
  if (!binaryPath || !Array.isArray(testCases) || testCases.length === 0) {
    return {
      totalTests: 0,
      passedCount: 0,
      failedCount: 0,
      testResults: [],
      allPassed: true
    };
  }

  const results = [];
  let passedCount = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const execResult = await executeBinary(binaryPath, tc.input, timeoutMs);

    const actualTrimmed = (execResult.stdout || '').trim().replace(/\r\n/g, '\n');
    const expectedTrimmed = (tc.expectedOutput || '').trim().replace(/\r\n/g, '\n');

    let isPassed = false;
    let verdict = execResult.status;

    if (execResult.status === 'SUCCESS') {
      if (tc.expectedOutput !== undefined && tc.expectedOutput !== null && tc.expectedOutput !== '') {
        isPassed = compareOutputs(actualTrimmed, expectedTrimmed);
        verdict = isPassed ? 'PASSED' : 'WRONG_ANSWER';
      } else {
        // No expected output specified, treated as execution smoke test
        isPassed = true;
        verdict = 'EXECUTED';
      }
    }

    if (isPassed) {
      passedCount++;
    }

    results.push({
      id: tc.id || `tc-${i + 1}`,
      name: tc.name || `Test Case #${i + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      actualOutput: execResult.stdout,
      stderr: execResult.stderr,
      status: verdict,
      passed: isPassed,
      executionTimeMs: execResult.executionTimeMs,
      exitCode: execResult.exitCode,
      signal: execResult.signal,
      errorMessage: execResult.error
    });
  }

  return {
    totalTests: testCases.length,
    passedCount,
    failedCount: testCases.length - passedCount,
    testResults: results,
    allPassed: passedCount === testCases.length
  };
}

/**
 * Robust string / numerical output comparator
 */
function compareOutputs(actual, expected) {
  if (actual === expected) return true;

  // Compare line-by-line ignoring trailing space per line
  const actualLines = actual.split('\n').map((l) => l.trimEnd());
  const expectedLines = expected.split('\n').map((l) => l.trimEnd());

  if (actualLines.length === expectedLines.length) {
    let match = true;
    for (let i = 0; i < actualLines.length; i++) {
      const a = actualLines[i];
      const e = expectedLines[i];
      if (a !== e) {
        // Try numeric comparison if both are floating-point
        const numA = parseFloat(a);
        const numB = parseFloat(e);
        if (!isNaN(numA) && !isNaN(numB) && Math.abs(numA - numB) < 1e-5) {
          continue;
        }
        match = false;
        break;
      }
    }
    if (match) return true;
  }

  return false;
}
