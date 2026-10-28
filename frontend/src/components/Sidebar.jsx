import React from 'react';
import {
  Code2,
  FileCheck2,
  History,
  ShieldCheck,
  Bug,
  CheckCircle2,
  Activity,
  Terminal,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  hasActiveReport,
  historyStats,
  historyCount
}) {
  const navItems = [
    {
      id: 'workspace',
      label: 'Code Workspace',
      description: 'Monaco C++ editor & test cases',
      icon: Code2,
      badge: null
    },
    {
      id: 'results',
      label: 'Analysis Report',
      description: 'Findings, diff & suggestions',
      icon: FileCheck2,
      badge: hasActiveReport ? 'Active' : null,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
    },
    {
      id: 'history',
      label: 'Analysis History',
      description: 'Past runs & benchmark logs',
      icon: History,
      badge: historyCount > 0 ? historyCount : null,
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
    },
    {
      id: 'settings',
      label: 'Diagnostics & API',
      description: 'Compiler & Groq health',
      icon: ShieldCheck,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#090D16]/95 backdrop-blur-xl flex flex-col justify-between shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-3.5 space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Platform Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/5 text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-r-full"></div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-slate-800/60 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-1">
                      {item.description}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Pipeline Metrics Card */}
      <div className="p-4 border-t border-white/[0.08] bg-[#070A12]/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Live Metrics
            </span>
          </div>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#0F172A] p-2.5 rounded-xl border border-white/[0.06]">
            <div className="text-slate-500 text-[10px]">Total Analyses</div>
            <div className="text-base font-bold font-mono text-slate-100 mt-0.5">
              {historyStats?.totalAnalyses ?? 0}
            </div>
          </div>
          <div className="bg-[#0F172A] p-2.5 rounded-xl border border-white/[0.06]">
            <div className="text-slate-500 text-[10px]">Bugs Detected</div>
            <div className="text-base font-bold font-mono text-amber-400 mt-0.5">
              {historyStats?.totalBugsDetected ?? 0}
            </div>
          </div>
        </div>

        <div className="bg-[#0F172A] p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Verified Bugs</span>
          </div>
          <span className="font-mono font-bold text-xs text-emerald-400">
            {historyStats?.verifiedFindings ?? 0}
          </span>
        </div>

        {/* Keyboard shortcut */}
        <div className="pt-1 text-[10px] text-slate-500 text-center font-mono flex items-center justify-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-white/10 rounded text-slate-400">⌘</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-white/10 rounded text-slate-400">Enter</kbd>
          <span className="text-slate-500">to analyze</span>
        </div>
      </div>
    </aside>
  );
}
