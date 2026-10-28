/**
 * Report Generator Module
 * Synthesizes compiler diagnostics, static analysis, execution outcomes,
 * and Groq findings into a comprehensive structured report.
 */

import { randomUUID } from 'crypto';

export function generateReport({
  sourceCode,
  problemStatement,
  compilerResult,
  staticFindings,
  testSummary,
  groqResult,
  reconciliationResult
}) {
  const id = `analysis-${randomUUID()}`;
  const timestamp = new Date().toISOString();

  // Determine Overall Verdict
  let verdict = 'LOGIC_ERRORS_DETECTED';
  let verdictDescription = 'Logical errors or behavioral defects were identified.';

  if (!compilerResult?.success) {
    verdict = 'COMPILATION_ERROR';
    verdictDescription = 'The C++ program failed to compile due to syntax or semantic errors.';
  } else if (testSummary?.testResults?.some((t) => t.status === 'SEGMENTATION_FAULT')) {
    verdict = 'RUNTIME_CRASH';
    verdictDescription = 'The program triggered a runtime crash (Segmentation Fault or Abort).';
  } else if (testSummary?.allPassed && (reconciliationResult?.summary?.verified === 0)) {
    verdict = 'ALL_TESTS_PASSED';
    verdictDescription = 'All supplied test cases passed. Review suspected findings for potential edge cases.';
  }

  const correctedCode = groqResult?.correctedCode || sourceCode;
  const lineDiff = computeLineDiff(sourceCode, correctedCode);

  return {
    id,
    timestamp,
    problemStatement: problemStatement || '',
    sourceCode,
    correctedCode,
    lineDiff,
    verdict,
    verdictDescription,
    compilation: {
      success: compilerResult?.success ?? false,
      exitCode: compilerResult?.exitCode ?? -1,
      durationMs: compilerResult?.durationMs ?? 0,
      compiler: compilerResult?.compiler?.command || 'clang++',
      compilerVersion: compilerResult?.compiler?.version || 'Clang / GCC',
      diagnostics: compilerResult?.diagnostics || [],
      rawOutput: compilerResult?.rawOutput || ''
    },
    testExecution: {
      totalTests: testSummary?.totalTests ?? 0,
      passedCount: testSummary?.passedCount ?? 0,
      failedCount: testSummary?.failedCount ?? 0,
      allPassed: testSummary?.allPassed ?? false,
      tests: testSummary?.testResults || []
    },
    staticAnalysis: {
      totalFindings: staticFindings?.length ?? 0,
      findings: staticFindings || []
    },
    llmAnalysis: {
      model: groqResult?.model || 'openai/gpt-oss-120b',
      source: groqResult?.source || 'groq',
      analysisSummary: groqResult?.analysisSummary || 'Analysis complete.',
      fixExplanation: groqResult?.fixExplanation || '',
      edgeCasesMissed: groqResult?.edgeCasesMissed || []
    },
    reconciliation: {
      bugs: reconciliationResult?.reconciledBugs || [],
      summary: reconciliationResult?.summary || {
        total: 0,
        verified: 0,
        suspected: 0,
        unverified: 0,
        inconclusive: 0
      }
    }
  };
}

/**
 * Computes a lightweight line-by-line diff between original and corrected code
 */
function computeLineDiff(original, corrected) {
  const origLines = (original || '').split('\n');
  const corrLines = (corrected || '').split('\n');

  const diff = [];
  const maxLines = Math.max(origLines.length, corrLines.length);

  for (let i = 0; i < maxLines; i++) {
    const orig = origLines[i] !== undefined ? origLines[i] : null;
    const corr = corrLines[i] !== undefined ? corrLines[i] : null;

    let type = 'unchanged';
    if (orig === null && corr !== null) type = 'added';
    else if (orig !== null && corr === null) type = 'removed';
    else if (orig !== corr) type = 'modified';

    diff.push({
      lineNumber: i + 1,
      original: orig,
      corrected: corr,
      type
    });
  }

  return diff;
}
