import React from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart2
} from 'lucide-react';

export default function HistoryView({
  history = [],
  stats = {},
  onSelectReport,
  onDeleteReport,
  onClearHistory
}) {
  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-y-auto p-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-canvas-border pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <span>Analysis History & Benchmark Runs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse and inspect previous C++ diagnostic reports and empirical findings.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-canvas-card border border-canvas-border rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Runs</div>
          <div className="text-2xl font-bold font-mono text-slate-100 mt-1">
            {stats?.totalAnalyses ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Persisted sessions</div>
        </div>

        <div className="bg-canvas-card border border-canvas-border rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Bugs Flagged</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {stats?.totalBugsDetected ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Logical, memory, syntax</div>
        </div>

        <div className="bg-canvas-card border border-canvas-border rounded-xl p-4">
          <div className="text-xs text-slate-400">Verified Findings</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {stats?.verifiedFindings ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.verificationRate ?? 0}% verification rate
          </div>
        </div>

        <div className="bg-canvas-card border border-canvas-border rounded-xl p-4">
          <div className="text-xs text-slate-400">Test Suite Pass Rate</div>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {stats?.testPassRate ?? 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.totalTestsPassed ?? 0} / {stats?.totalTestsExecuted ?? 0} tests passed
          </div>
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Recent Analyses ({history.length})
        </h3>

        {history.length === 0 ? (
          <div className="p-8 text-center bg-canvas-card border border-canvas-border rounded-xl text-slate-500 text-xs">
            No previous analyses recorded yet. Run your first analysis from the Code Workspace.
          </div>
        ) : (
          history.map((item) => {
            const isAllPassed = item.verdict === 'ALL_TESTS_PASSED';
            const isCompileError = item.verdict === 'COMPILATION_ERROR';

            return (
              <div
                key={item.id}
                className="bg-canvas-card border border-canvas-border hover:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    {isAllPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCompileError ? (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    <span className="font-bold text-slate-200 text-sm">
                      {item.problemStatement || 'C++ Algorithm Inspection'}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.verdict}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-500" />
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span>
                      Bugs:{' '}
                      <strong className="text-amber-400">{item.totalBugs}</strong> (
                      <strong className="text-emerald-400">{item.verifiedBugs}</strong> verified)
                    </span>
                    <span>
                      Tests:{' '}
                      <strong className="text-slate-200">{item.testsPassed}</strong>/
                      {item.totalTests}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onSelectReport(item.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md transition shadow-sm"
                  >
                    <span>View Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteReport(item.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
