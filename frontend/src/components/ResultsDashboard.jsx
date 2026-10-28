import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  FileCode,
  GitCompare,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Flame,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ResultsDashboard({
  report,
  onLoadFixIntoEditor,
  onRunDemoAnalysis
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedFix, setCopiedFix] = useState(false);

  // If no report is loaded, show a gorgeous interactive Empty State
  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#07090E] select-none">
        <div className="relative group max-w-md w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-2xl blur-xl opacity-75"></div>
          <div className="relative bg-[#0D121E] border border-white/10 rounded-2xl p-8 space-y-5 shadow-2xl">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-100">
                Ready for Hybrid Error Analysis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Run an analysis from the Code Workspace or launch an instant benchmark demo to see Groq reasoning, compiler diagnostics, and empirical bug reconciliation.
              </p>
            </div>

            <button
              onClick={onRunDemoAnalysis}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current text-indigo-200" />
              <span>Run Benchmark Analysis Now</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    id,
    timestamp,
    verdict,
    verdictDescription,
    compilation,
    testExecution,
    staticAnalysis,
    llmAnalysis,
    reconciliation,
    correctedCode,
    lineDiff
  } = report;

  const bugs = reconciliation?.bugs || [];
  const tests = testExecution?.tests || [];

  const handleCopyFix = () => {
    if (correctedCode) {
      navigator.clipboard.writeText(correctedCode);
      setCopiedFix(true);
      setTimeout(() => setCopiedFix(false), 2000);
    }
  };

  const getVerdictHero = () => {
    if (verdict === 'ALL_TESTS_PASSED') {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30',
        text: 'text-emerald-400',
        badge: 'ALL TESTS PASSED',
        icon: CheckCircle2,
        desc: 'All test suite inputs validated successfully. No empirical behavioral defects triggered.'
      };
    }
    if (verdict === 'COMPILATION_ERROR') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30',
        text: 'text-rose-400',
        badge: 'COMPILATION FAILURE',
        icon: XCircle,
        desc: 'The C++ compiler encountered syntax or semantic errors before execution.'
      };
    }
    if (verdict === 'RUNTIME_CRASH') {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30',
        text: 'text-rose-400',
        badge: 'RUNTIME CRASH (SEGFAULT / ABORT)',
        icon: XCircle,
        desc: 'Program violated memory bounds or triggered an uncaught hardware exception.'
      };
    }
    return {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-400',
      badge: 'LOGICAL ERRORS DETECTED',
      icon: AlertTriangle,
      desc: verdictDescription || 'Empirical test failures and model reasoning identified logical flaws.'
    };
  };

  const hero = getVerdictHero();
  const HeroIcon = hero.icon;

  const getVerificationPill = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Verified Finding
          </span>
        );
      case 'SUSPECTED':
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Suspected Finding
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {status}
          </span>
        );
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || 'medium').toLowerCase();
    if (s === 'critical') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">CRITICAL</span>;
    }
    if (s === 'high') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40">HIGH</span>;
    }
    if (s === 'medium') {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">MEDIUM</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/10">LOW</span>;
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#07090E] overflow-hidden">
      {/* Top Hero Banner */}
      <div className="border-b border-white/[0.08] bg-[#090D16]/90 backdrop-blur-xl px-6 pt-5 pb-0 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
          <div className="flex items-start space-x-3.5">
            <div className={`p-2.5 rounded-xl border ${hero.bg} ${hero.text} shadow-lg shrink-0 mt-0.5`}>
              <HeroIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg font-bold text-slate-100 tracking-tight">Analysis Report</h2>
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${hero.bg} ${hero.text}`}>
                  {hero.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {hero.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 shrink-0 bg-[#0F172A] px-4 py-2 rounded-xl border border-white/[0.08]">
            <div>
              Compiler: <span className="text-slate-200 font-semibold">{compilation?.compiler}</span>
            </div>
            <div className="text-slate-600">|</div>
            <div>
              Tests:{' '}
              <span className="text-emerald-400 font-bold">{testExecution?.passedCount}</span>/
              <span className="text-slate-200 font-bold">{testExecution?.totalTests}</span> Passed
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 overflow-x-auto text-xs font-medium border-t border-white/[0.06] pt-2 select-none">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bugs', label: `Bug Findings (${bugs.length})` },
            { id: 'tests', label: `Test Suite (${testExecution?.totalTests || 0})` },
            { id: 'diff', label: 'Code Comparison (Diff)' },
            { id: 'fix', label: 'Suggested Fix' },
            { id: 'logs', label: 'Compiler & Exec Logs' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-white bg-[#0D121E] font-semibold shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content Container */}
      <div className="flex-1 p-6 overflow-y-auto min-h-0">
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0D121E] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Compilation Status</div>
                <div className="text-lg font-bold font-mono mt-1.5 flex items-center">
                  {compilation?.success ? (
                    <span className="text-emerald-400 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" /> Success
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center">
                      <XCircle className="w-4 h-4 mr-1.5" /> Failed
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-mono">
                  Build duration: {compilation?.durationMs}ms
                </div>
              </div>

              <div className="bg-[#0D121E] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Dynamic Test Outcome</div>
                <div className="text-lg font-bold font-mono mt-1.5 text-slate-100">
                  {testExecution?.passedCount} / {testExecution?.totalTests} Passed
                </div>
                <div className="text-[11px] mt-1 font-mono">
                  {testExecution?.failedCount > 0 ? (
                    <span className="text-rose-400 font-semibold">
                      {testExecution?.failedCount} failing test(s)
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">100% test cases passing</span>
                  )}
                </div>
              </div>

              <div className="bg-[#0D121E] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Verified Findings</div>
                <div className="text-lg font-bold font-mono mt-1.5 text-emerald-400">
                  {reconciliation?.summary?.verified || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Confirmed by runtime failures / compiler
                </div>
              </div>

              <div className="bg-[#0D121E] p-4 rounded-2xl border border-white/[0.08] shadow-sm">
                <div className="text-xs text-slate-400 font-medium">Suspected Findings</div>
                <div className="text-lg font-bold font-mono mt-1.5 text-amber-400">
                  {reconciliation?.summary?.suspected || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Static analysis & model heuristics
                </div>
              </div>
            </div>

            {/* Executive Analysis Summary */}
            <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Executive Analysis Summary</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {llmAnalysis?.analysisSummary || 'Analysis complete.'}
              </p>
            </div>

            {/* Potential Edge Cases */}
            {llmAnalysis?.edgeCasesMissed && llmAnalysis.edgeCasesMissed.length > 0 && (
              <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-sm">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Potential Edge Cases & Boundary Conditions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {llmAnalysis.edgeCasesMissed.map((ec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#07090E] border border-white/[0.04] text-xs text-slate-300 flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      <span>{ec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. BUG FINDINGS TAB */}
        {activeTab === 'bugs' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {bugs.length === 0 ? (
              <div className="p-12 text-center bg-[#0D121E] border border-white/[0.08] rounded-2xl text-slate-400 text-xs">
                No bugs were detected. Your code passed all validation checks!
              </div>
            ) : (
              bugs.map((bug, idx) => (
                <div
                  key={bug.id || idx}
                  className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-6 space-y-4 hover:border-indigo-500/40 transition shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <div className="flex items-center space-x-3">
                      {getSeverityBadge(bug.severity)}
                      <h4 className="font-bold text-slate-100 text-sm sm:text-base">{bug.title}</h4>
                      <span className="text-xs font-mono text-slate-500">
                        [{bug.category}]
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      {getVerificationPill(bug.verificationStatus)}
                      {bug.confidence && (
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-white/5">
                          {Math.round(bug.confidence * 100)}% Conf
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Line Reference */}
                  {bug.lines && bug.lines.length > 0 && (
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                      <span>Source Line Reference:</span>
                      <span className="font-bold">{bug.lines.join(', ')}</span>
                    </div>
                  )}

                  {/* Root Cause */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-1 font-semibold">
                      Defect Root Cause
                    </span>
                    {bug.rootCause}
                  </div>

                  {/* Empirical Verification Evidence */}
                  {bug.evidence && (
                    <div className="p-3 rounded-xl bg-[#07090E] border border-white/[0.06] text-xs text-slate-300 flex items-start space-x-2.5">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                        Verification Evidence:
                      </span>
                      <span className="text-slate-300">{bug.evidence}</span>
                    </div>
                  )}

                  {/* Problematic snippet & fix suggestion */}
                  {(bug.problematicCode || bug.suggestedFixSnippet) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {bug.problematicCode && (
                        <div className="bg-[#07090E] border border-rose-500/30 rounded-xl p-3.5">
                          <div className="text-[10px] font-mono uppercase text-rose-400 font-semibold mb-1.5">
                            Problematic Code
                          </div>
                          <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {bug.problematicCode}
                          </pre>
                        </div>
                      )}
                      {bug.suggestedFixSnippet && (
                        <div className="bg-[#07090E] border border-emerald-500/30 rounded-xl p-3.5">
                          <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold mb-1.5">
                            Suggested Replacement
                          </div>
                          <pre className="text-xs font-mono text-emerald-200 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                            {bug.suggestedFixSnippet}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. TEST CASES TAB */}
        {activeTab === 'tests' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {tests.length === 0 ? (
              <div className="p-12 text-center bg-[#0D121E] border border-white/[0.08] rounded-2xl text-slate-400 text-xs">
                No test cases were executed.
              </div>
            ) : (
              tests.map((tc, idx) => {
                const isPassed = tc.passed;
                return (
                  <div
                    key={tc.id || idx}
                    className={`bg-[#0D121E] border rounded-2xl p-5 space-y-3.5 shadow-sm ${
                      isPassed ? 'border-emerald-500/30' : 'border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                      <div className="flex items-center space-x-2.5">
                        {isPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-400" />
                        )}
                        <span className="font-bold text-sm text-slate-100">
                          {tc.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs font-mono">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                            isPassed
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {tc.status}
                        </span>
                        <span className="text-slate-500">{tc.executionTimeMs}ms</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="bg-[#07090E] p-3 rounded-xl border border-white/[0.06]">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                          Standard Input (stdin)
                        </div>
                        <pre className="text-slate-300 whitespace-pre-wrap">
                          {tc.input || '<empty>'}
                        </pre>
                      </div>

                      <div className="bg-[#07090E] p-3 rounded-xl border border-white/[0.06]">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                          Expected Output (stdout)
                        </div>
                        <pre className="text-emerald-300 whitespace-pre-wrap">
                          {tc.expectedOutput || '<any>'}
                        </pre>
                      </div>

                      <div className="bg-[#07090E] p-3 rounded-xl border border-white/[0.06]">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 font-semibold">
                          Actual Output (stdout)
                        </div>
                        <pre
                          className={`whitespace-pre-wrap ${
                            isPassed ? 'text-emerald-300' : 'text-rose-300 font-bold'
                          }`}
                        >
                          {tc.actualOutput || '<no output>'}
                        </pre>
                      </div>
                    </div>

                    {tc.errorMessage && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
                        {tc.errorMessage}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 4. CODE COMPARISON (DIFF) TAB */}
        {activeTab === 'diff' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
                  <GitCompare className="w-4 h-4 text-indigo-400" />
                  <span>Line-by-Line Code Comparison</span>
                </div>
                <div className="flex items-center space-x-4 text-[11px] font-mono">
                  <span className="flex items-center text-rose-400">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 mr-1.5"></span> Original Source
                  </span>
                  <span className="flex items-center text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-500 mr-1.5"></span> Suggested Patch
                  </span>
                </div>
              </div>

              {/* Diff Table */}
              <div className="border border-white/[0.08] rounded-xl overflow-x-auto bg-[#07090E]">
                <table className="w-full text-left font-mono text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-[#090D16] text-[11px] text-slate-400">
                      <th className="py-2 px-3 w-12 text-center">#</th>
                      <th className="py-2 px-4 w-1/2 border-r border-white/[0.08]">Original Code</th>
                      <th className="py-2 px-4 w-1/2">Suggested Fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(lineDiff || []).map((row, idx) => {
                      const isMod = row.type === 'modified';
                      const isAdd = row.type === 'added';
                      const isRem = row.type === 'removed';

                      return (
                        <tr
                          key={idx}
                          className={`border-b border-white/[0.02] ${
                            isMod
                              ? 'bg-amber-500/10'
                              : isAdd
                              ? 'bg-emerald-500/10'
                              : isRem
                              ? 'bg-rose-500/10'
                              : ''
                          }`}
                        >
                          <td className="py-1 px-2 text-center text-slate-600 select-none border-r border-white/[0.08] text-[11px]">
                            {row.lineNumber}
                          </td>
                          <td
                            className={`py-1 px-4 border-r border-white/[0.08] whitespace-pre-wrap ${
                              isMod || isRem ? 'text-rose-300 bg-rose-500/10 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {row.original !== null ? row.original : ''}
                          </td>
                          <td
                            className={`py-1 px-4 whitespace-pre-wrap ${
                              isMod || isAdd ? 'text-emerald-300 bg-emerald-500/10 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {row.corrected !== null ? row.corrected : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. SUGGESTED FIX TAB */}
        {activeTab === 'fix' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Synthesized C++ Solution</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Grounded with compiler diagnostics and test validation.
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <button
                    onClick={handleCopyFix}
                    className="flex items-center space-x-1.5 px-3.5 py-2 text-xs bg-[#0F172A] border border-white/[0.08] hover:bg-slate-800 text-slate-200 rounded-xl transition"
                  >
                    {copiedFix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFix ? 'Copied' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={() => onLoadFixIntoEditor(correctedCode)}
                    className="flex items-center space-x-2 px-4 py-2 text-xs bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-600/30 active:scale-95"
                  >
                    <span>Load Fix into Editor & Re-Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rationale */}
              {llmAnalysis?.fixExplanation && (
                <div className="text-xs sm:text-sm text-slate-300 bg-[#07090E] p-4 rounded-xl border border-white/[0.06] leading-relaxed">
                  <span className="font-semibold text-indigo-400 block mb-1 text-xs">
                    Correction Rationale:
                  </span>
                  {llmAnalysis.fixExplanation}
                </div>
              )}

              {/* Code Box */}
              <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                <div className="bg-[#090D16] px-4 py-2.5 border-b border-white/[0.08] text-xs font-mono text-slate-400 flex items-center justify-between select-none">
                  <span>corrected_solution.cpp</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">Compilable C++17</span>
                </div>
                <pre className="p-4 bg-[#07090E] text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {correctedCode || 'No corrected code generated.'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 6. EXECUTION LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-4 max-w-6xl mx-auto">
            {/* Compiler Output */}
            <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/[0.06] pb-2.5">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Compiler Diagnostics ({compilation?.compiler})</span>
                </div>
                <span className={compilation?.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  Exit Code: {compilation?.exitCode}
                </span>
              </div>
              <pre className="bg-[#07090E] p-3.5 rounded-xl border border-white/[0.04] text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-72 overflow-y-auto">
                {compilation?.rawOutput || 'No compiler warnings or notes emitted.'}
              </pre>
            </div>

            {/* Static Analysis Findings */}
            <div className="bg-[#0D121E] border border-white/[0.08] rounded-2xl p-5 space-y-2.5 shadow-sm">
              <div className="text-xs font-mono text-slate-400 border-b border-white/[0.06] pb-2.5">
                Static Analysis Flags ({staticAnalysis?.totalFindings || 0})
              </div>
              {staticAnalysis?.findings?.length > 0 ? (
                <div className="space-y-2">
                  {staticAnalysis.findings.map((f, idx) => (
                    <div key={idx} className="bg-[#07090E] p-3 rounded-xl border border-white/[0.04] text-xs font-mono">
                      <div className="text-amber-400 font-bold">
                        Line {f.line}: [{f.category}] {f.title}
                      </div>
                      <div className="text-slate-400 mt-1">{f.message}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 font-mono">No static warnings flagged.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
