/**
 * Groq LLM Analysis Module
 * Sends source code, compiler diagnostics, static analysis findings,
 * and test execution outcomes to Groq LLM for structured reasoning.
 */

import Groq from 'groq-sdk';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';

export async function analyzeWithGroq({
  sourceCode,
  problemStatement,
  compilerResult,
  staticFindings,
  testSummary
}) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    return generateOfflineHeuristicAnalysis({
      sourceCode,
      problemStatement,
      compilerResult,
      staticFindings,
      testSummary,
      reason: 'Groq API Key not configured in backend/.env'
    });
  }

  const groq = new Groq({ apiKey });

  const systemPrompt = `You are a world-class C++ compiler engineer and algorithmic bug detection specialist.
Your goal is to inspect the user's C++ code, understand the user's true intent, and identify why the program is failing, crashing, or buggy.

STRICT CODE FIDELITY & SURGICAL CORRECTION RULES:
1. MINIMAL SURGICAL FIXES: Never replace the user's program with an unrelated complex algorithm (such as Kadane's algorithm, Dijkstra's algorithm, binary search, or competitive programming templates) unless the user's source code already attempts that algorithm.
2. PRESERVE ORIGINAL STRUCTURE: Keep the user's original logic, variable names, functions, and style. Do NOT inject competitive programming boilerplate like 'ios::sync_with_stdio(false); cin.tie(nullptr);' or complex macros unless already present in the user's code.
3. COMPILATION & SYNTAX ERRORS: When fixing syntax errors or undeclared identifiers (like 'hello;'), diagnose what the user intended (e.g. 'std::cout << "hello" << std::endl;' or declaring a variable). Fix ONLY that specific statement.
4. TARGETED SNIPPET: 'suggestedFixSnippet' must contain ONLY the exact replacement for the lines in 'problematicCode' (1 to 3 lines max). Never put the entire program into 'suggestedFixSnippet'.
5. MATCH DESIRED OUTPUT: If the user provides sample inputs or desired outputs (e.g. outputting "hello"), ensure the corrected code directly produces that exact output cleanly.

JSON SCHEMA:
{
  "analysisSummary": "Concise summary of program bugs and intent",
  "bugs": [
    {
      "id": "bug-1",
      "title": "Bug title",
      "category": "Syntax Error | Compilation Error | Logic Error | Off-by-One | Boundary Condition | Type Hazard",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "lines": [2],
      "rootCause": "Detailed explanation of why this specific line or logic fails",
      "problematicCode": "exact problematic line(s) from user code",
      "suggestedFixSnippet": "minimal replacement line(s) ONLY",
      "confidence": 0.99
    }
  ],
  "correctedCode": "Full minimal corrected C++ program preserving original structure",
  "fixExplanation": "Clear explanation of the surgical fix applied",
  "edgeCasesMissed": ["Edge case description if any"]
};`;

  const userEvidence = {
    sourceCode,
    problemStatement: problemStatement || 'None provided',
    compilation: {
      success: compilerResult?.success,
      diagnostics: compilerResult?.diagnostics || [],
      rawOutput: compilerResult?.rawOutput || ''
    },
    staticAnalysisFindings: staticFindings || [],
    testExecution: {
      totalTests: testSummary?.totalTests || 0,
      passedCount: testSummary?.passedCount || 0,
      failedCount: testSummary?.failedCount || 0,
      allPassed: testSummary?.allPassed,
      tests: (testSummary?.testResults || []).map((t) => ({
        name: t.name,
        input: t.input,
        expected: t.expectedOutput,
        actual: t.actualOutput,
        status: t.status,
        passed: t.passed,
        errorMessage: t.errorMessage
      }))
    }
  };

  try {
    const response = await groq.chat.completions.create({
      model,
      temperature: 0.1, // Low temperature for deterministic analysis
      max_tokens: 3000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Analyze this C++ program with the provided empirical test and compiler data:\n\n${JSON.stringify(userEvidence, null, 2)}`
        }
      ]
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = parseJsonSafely(content);

    return {
      success: true,
      model,
      source: 'groq',
      analysisSummary: parsed.analysisSummary || 'Groq analysis completed.',
      bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
      correctedCode: parsed.correctedCode || sourceCode,
      fixExplanation: parsed.fixExplanation || 'No corrections suggested.',
      edgeCasesMissed: Array.isArray(parsed.edgeCasesMissed) ? parsed.edgeCasesMissed : []
    };
  } catch (err) {
    console.error('Groq API Error:', err.message);
    return generateOfflineHeuristicAnalysis({
      sourceCode,
      problemStatement,
      compilerResult,
      staticFindings,
      testSummary,
      reason: `Groq API call failed: ${err.message}`
    });
  }
}

/**
 * Robust JSON parser capable of extracting JSON from code blocks
 */
function parseJsonSafely(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1]);
      } catch {}
    }
    const startIdx = raw.indexOf('{');
    const endIdx = raw.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(raw.slice(startIdx, endIdx + 1));
      } catch {}
    }
  }
  return {
    analysisSummary: 'Unable to parse LLM structured response.',
    bugs: [],
    correctedCode: '',
    fixExplanation: '',
    edgeCasesMissed: []
  };
}

/**
 * Fallback synthesizer when Groq API key is absent or network fails
 */
function generateOfflineHeuristicAnalysis({
  sourceCode,
  compilerResult,
  staticFindings,
  testSummary,
  reason
}) {
  const bugs = [];

  // Integrate static analysis findings
  if (Array.isArray(staticFindings)) {
    staticFindings.forEach((sf, idx) => {
      bugs.push({
        id: `offline-static-${idx + 1}`,
        title: sf.title,
        category: sf.category,
        severity: sf.severity,
        lines: [sf.line],
        rootCause: sf.message,
        problematicCode: sf.snippet,
        suggestedFixSnippet: sf.suggestedFix,
        confidence: 0.88
      });
    });
  }

  // Integrate compiler warnings/errors
  if (compilerResult && Array.isArray(compilerResult.diagnostics)) {
    compilerResult.diagnostics.forEach((diag, idx) => {
      if (diag.severity === 'error' || diag.severity === 'warning') {
        bugs.push({
          id: `compiler-diag-${idx + 1}`,
          title: `Compiler ${diag.severity.toUpperCase()}: ${diag.message.slice(0, 40)}`,
          category: diag.severity === 'error' ? 'Compilation Error' : 'Compiler Diagnostic',
          severity: diag.severity === 'error' ? 'Critical' : 'Medium',
          lines: [diag.line],
          rootCause: diag.message,
          problematicCode: `Line ${diag.line}, Column ${diag.column}`,
          suggestedFixSnippet: '// Address compiler warning or error',
          confidence: 0.99
        });
      }
    });
  }

  // Integrate failed test cases
  if (testSummary && Array.isArray(testSummary.testResults)) {
    const failedTests = testSummary.testResults.filter((t) => !t.passed);
    failedTests.forEach((ft, idx) => {
      bugs.push({
        id: `dynamic-fail-${idx + 1}`,
        title: `Test Failure on '${ft.name}' (${ft.status})`,
        category: ft.status === 'TIME_LIMIT_EXCEEDED' ? 'Infinite Loop' : ft.status === 'SEGMENTATION_FAULT' ? 'Memory Violation' : 'Logical Discrepancy',
        severity: 'Critical',
        lines: [1],
        rootCause: ft.errorMessage || `Expected output '${ft.expectedOutput?.trim()}', but got '${ft.actualOutput?.trim()}'.`,
        problematicCode: ft.input ? `Input: ${ft.input}` : 'N/A',
        suggestedFixSnippet: '// Re-evaluate algorithm logic for this test case',
        confidence: 0.90
      });
    });
  }

  return {
    success: true,
    model: 'Heuristic Offline Analyzer (Groq Key Not Active)',
    source: 'offline_heuristic',
    note: reason,
    analysisSummary: `Analysis completed using local compiler diagnostics, static heuristics, and test execution results. (${reason})`,
    bugs,
    correctedCode: sourceCode,
    fixExplanation: 'Add your GROQ_API_KEY in backend/.env to enable automated AI code synthesis.',
    edgeCasesMissed: ['Boundary cases', 'Maximum integer ranges', 'Zero/negative inputs']
  };
}
