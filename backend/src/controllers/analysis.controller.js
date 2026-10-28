/**
 * Analysis Controller
 * Orchestrates the full Hybrid Error Detection Pipeline:
 * Validation -> Static Analysis -> C++ Compilation -> Sandboxed Execution ->
 * Groq LLM Analysis -> Reconciliation -> Report Synthesis -> History Storage
 */

import { validateAnalysisRequest } from '../modules/validator.js';
import { compileCpp, cleanupTempDir, detectCompiler } from '../modules/compiler.js';
import { runStaticChecks } from '../modules/staticChecker.js';
import { runTestCases } from '../modules/testRunner.js';
import { analyzeWithGroq } from '../modules/groqAnalyzer.js';
import { reconcileFindings } from '../modules/reconciliation.js';
import { generateReport } from '../modules/reportGenerator.js';
import { historyStore } from '../modules/historyStore.js';
import { PRESET_EXAMPLES } from '../modules/presets.js';
import { isDbConnected } from '../config/database.js';

export async function analyzeCode(req, res) {
  try {
    // 1. Request Validation
    const validation = validateAnalysisRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.errors
      });
    }

    const { sourceCode, problemStatement, testCases } = validation.sanitized;

    // 2. Static Code Analysis
    const staticFindings = runStaticChecks(sourceCode);

    // 3. Isolated C++ Compilation
    const compilerResult = await compileCpp(sourceCode);

    // 4. Sandboxed Dynamic Execution (if compilation succeeded)
    let testSummary = {
      totalTests: testCases.length,
      passedCount: 0,
      failedCount: 0,
      testResults: [],
      allPassed: false
    };

    if (compilerResult.success && compilerResult.binaryPath) {
      testSummary = await runTestCases(
        compilerResult.binaryPath,
        testCases,
        parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 2000
      );
      // Clean up temporary binary
      await cleanupTempDir(compilerResult.tempDir);
    } else if (compilerResult.tempDir) {
      await cleanupTempDir(compilerResult.tempDir);
    }

    // 5. Groq LLM Analysis with empirical evidence
    const groqResult = await analyzeWithGroq({
      sourceCode,
      problemStatement,
      compilerResult,
      staticFindings,
      testSummary
    });

    // 6. Evidence-Based Bug Reconciliation
    const reconciliationResult = reconcileFindings({
      llmFindings: groqResult.bugs,
      compilerResult,
      staticFindings,
      testSummary
    });

    // 7. Generate Full Report
    const report = generateReport({
      sourceCode,
      problemStatement,
      compilerResult,
      staticFindings,
      testSummary,
      groqResult,
      reconciliationResult
    });

    // 8. Persist Report to History Store
    historyStore.save(report);

    return res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Analysis Pipeline Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error in analysis pipeline: ' + error.message
    });
  }
}

export function getAnalysisById(req, res) {
  const { id } = req.params;
  const report = historyStore.getById(id);

  if (!report) {
    return res.status(404).json({
      success: false,
      message: `Analysis report with ID '${id}' not found.`
    });
  }

  return res.status(200).json({
    success: true,
    report
  });
}

export function getHistory(req, res) {
  const history = historyStore.getAll();
  const stats = historyStore.getStats();

  return res.status(200).json({
    success: true,
    history,
    stats
  });
}

export function deleteHistoryItem(req, res) {
  const { id } = req.params;
  const deleted = historyStore.deleteById(id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: `Analysis record '${id}' not found.`
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Record deleted successfully.'
  });
}

export function clearHistory(req, res) {
  historyStore.clear();
  return res.status(200).json({
    success: true,
    message: 'Analysis history cleared.'
  });
}

export function getPresets(req, res) {
  return res.status(200).json({
    success: true,
    presets: PRESET_EXAMPLES
  });
}

export async function healthCheck(req, res) {
  const compiler = await detectCompiler();
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '' && process.env.GROQ_API_KEY !== 'your_groq_api_key_here');

  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Hybrid LLM C++ Error Detector Backend',
    compiler: {
      available: Boolean(compiler),
      command: compiler?.command || 'not found',
      version: compiler?.version || 'N/A'
    },
    groq: {
      configured: hasGroqKey,
      model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
    },
    sandbox: {
      active: true,
      timeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 2000
    },
    database: {
      connected: isDbConnected(),
      type: isDbConnected() ? 'MongoDB Atlas (Cluster0)' : 'Local Persistent Disk (JSON)',
      cluster: isDbConnected() ? 'cluster0.rv1c6ir.mongodb.net' : 'local'
    }
  });
}
