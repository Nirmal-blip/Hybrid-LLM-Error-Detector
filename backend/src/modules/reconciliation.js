/**
 * Evidence-Based Bug Reconciliation Module
 * Cross-references Groq LLM findings with compilation diagnostics,
 * static check warnings, and dynamic test execution results.
 * 
 * Classifies each finding as:
 * - VERIFIED: Confirmed by failing test case, runtime crash, or compiler diagnostic
 * - SUSPECTED: Flagged by LLM + corroborating static analysis, but dynamic tests passed
 * - UNVERIFIED: Suggested by LLM alone without corroborating static or runtime evidence
 * - INCONCLUSIVE: Compilation failed or program crashed before logic could execute
 */

export function reconcileFindings({
  llmFindings = [],
  compilerResult = {},
  staticFindings = [],
  testSummary = {}
}) {
  const compilerSuccess = compilerResult?.success ?? false;
  const compilerDiagnostics = compilerResult?.diagnostics || [];
  const failedTests = (testSummary?.testResults || []).filter((t) => !t.passed);
  const hasDynamicFailures = failedTests.length > 0;

  const reconciledBugs = [];

  for (const bug of llmFindings) {
    const bugLines = Array.isArray(bug.lines) ? bug.lines : [bug.line || 1];
    const bugCategory = (bug.category || '').toLowerCase();
    const bugTitle = (bug.title || '').toLowerCase();
    const bugDesc = (bug.rootCause || '').toLowerCase();

    // 1. Check for compilation failure (Inconclusive if code couldn't even compile)
    if (!compilerSuccess) {
      const matchingCompilerDiag = compilerDiagnostics.find((diag) =>
        bugLines.includes(diag.line)
      );

      reconciledBugs.push({
        ...bug,
        verificationStatus: matchingCompilerDiag ? 'VERIFIED' : 'INCONCLUSIVE',
        evidence: matchingCompilerDiag
          ? `Confirmed by compiler error at line ${matchingCompilerDiag.line}: ${matchingCompilerDiag.message}`
          : 'Compilation failed, so dynamic behavioral logic cannot be evaluated.',
        confidence: matchingCompilerDiag ? 0.99 : 0.4
      });
      continue;
    }

    // 2. Cross-reference with Compiler Warnings
    const matchingWarning = compilerDiagnostics.find(
      (diag) => diag.severity === 'warning' && bugLines.includes(diag.line)
    );

    // 3. Cross-reference with Static Checker findings
    const matchingStatic = staticFindings.find((sf) =>
      bugLines.includes(sf.line) ||
      sf.category.toLowerCase().includes(bugCategory) ||
      bugTitle.includes(sf.category.toLowerCase())
    );

    // 4. Cross-reference with Dynamic Execution Failures
    const dynamicMatch = findDynamicCorroboration(bug, failedTests);

    // Determine Status
    let status = 'UNVERIFIED';
    let evidence = 'Suggested by LLM; no direct runtime failure or static check triggered.';
    let confidence = bug.confidence || 0.6;

    if (dynamicMatch) {
      status = 'VERIFIED';
      evidence = `Empirically verified by dynamic test case: ${dynamicMatch.reason}`;
      confidence = Math.max(confidence, 0.95);
    } else if (matchingWarning) {
      status = 'VERIFIED';
      evidence = `Corroborated by compiler diagnostic at line ${matchingWarning.line}: ${matchingWarning.message}`;
      confidence = Math.max(confidence, 0.92);
    } else if (matchingStatic) {
      if (hasDynamicFailures) {
        status = 'VERIFIED';
        evidence = `Corroborated by static analysis rule '${matchingStatic.title}' and observed test failures.`;
        confidence = Math.max(confidence, 0.9);
      } else {
        status = 'SUSPECTED';
        evidence = `Flagged by LLM and matches static heuristic '${matchingStatic.title}', but existing test cases did not trigger a failure.`;
        confidence = Math.max(confidence, 0.75);
      }
    } else if (hasDynamicFailures) {
      status = 'SUSPECTED';
      evidence = 'Observed test case failures exist, but could not link directly to this specific line.';
      confidence = Math.max(confidence, 0.7);
    }

    reconciledBugs.push({
      ...bug,
      verificationStatus: status,
      evidence,
      confidence: parseFloat(confidence.toFixed(2))
    });
  }

  // Also include any static findings that the LLM might have missed!
  for (const sf of staticFindings) {
    const alreadyCovered = reconciledBugs.some((rb) =>
      (rb.lines || []).includes(sf.line)
    );

    if (!alreadyCovered) {
      const isDynamicFail = hasDynamicFailures;
      reconciledBugs.push({
        id: sf.id,
        title: sf.title,
        category: sf.category,
        severity: sf.severity,
        lines: [sf.line],
        rootCause: sf.message,
        problematicCode: sf.snippet,
        suggestedFixSnippet: sf.suggestedFix,
        verificationStatus: isDynamicFail ? 'VERIFIED' : 'SUSPECTED',
        evidence: `Discovered by static analyzer rule: ${sf.title}`,
        confidence: isDynamicFail ? 0.9 : 0.75
      });
    }
  }

  return {
    reconciledBugs,
    summary: {
      total: reconciledBugs.length,
      verified: reconciledBugs.filter((b) => b.verificationStatus === 'VERIFIED').length,
      suspected: reconciledBugs.filter((b) => b.verificationStatus === 'SUSPECTED').length,
      unverified: reconciledBugs.filter((b) => b.verificationStatus === 'UNVERIFIED').length,
      inconclusive: reconciledBugs.filter((b) => b.verificationStatus === 'INCONCLUSIVE').length
    }
  };
}

/**
 * Checks if a bug hypothesis matches an observed dynamic test failure
 */
function findDynamicCorroboration(bug, failedTests) {
  if (!failedTests || failedTests.length === 0) return null;

  const text = `${bug.title} ${bug.category} ${bug.rootCause}`.toLowerCase();

  for (const ft of failedTests) {
    if (ft.status === 'TIME_LIMIT_EXCEEDED' && (text.includes('loop') || text.includes('infinite') || text.includes('timeout'))) {
      return { reason: `Test '${ft.name}' timed out due to infinite loop or recursion.` };
    }
    if (ft.status === 'SEGMENTATION_FAULT' && (text.includes('bound') || text.includes('memory') || text.includes('segfault') || text.includes('pointer') || text.includes('index'))) {
      return { reason: `Test '${ft.name}' crashed with Segmentation Fault (memory violation).` };
    }
    if (ft.status === 'WRONG_ANSWER') {
      return { reason: `Test '${ft.name}' failed with Wrong Answer (Expected: '${ft.expectedOutput?.trim()}', Actual: '${ft.actualOutput?.trim()}').` };
    }
  }

  return null;
}
