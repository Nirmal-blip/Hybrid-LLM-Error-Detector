import React from 'react';
import {
  Terminal,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  Zap,
  RotateCcw,
  ShieldCheck,
  Flame
} from 'lucide-react';

export default function Header({
  systemHealth,
  onNewAnalysis,
  onAnalyze,
  isAnalyzing,
  onSelectPreset,
  presets = []
}) {
  const compilerAvailable = systemHealth?.compiler?.available;
  const groqConfigured = systemHealth?.groq?.configured;
  const modelName = systemHealth?.groq?.model || 'openai/gpt-oss-120b';

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#090D16]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0 select-none">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-60 group-hover:opacity-90 transition duration-300"></div>
          <div className="relative h-10 w-10 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-center shadow-inner">
            <Terminal className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-slate-100 tracking-tight text-base sm:text-lg flex items-center gap-1.5">
              <span>Hybrid LLM</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-cyan-400">
                Error Detector
              </span>
            </h1>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              C++ Core
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <span>Groq LLM</span>
            <span className="text-slate-600">•</span>
            <span>Static Heuristics</span>
            <span className="text-slate-600">•</span>
            <span>Clang Sandboxed Sandbox</span>
          </p>
        </div>
      </div>

      {/* Preset Quick Launches in Header */}
      <div className="hidden xl:flex items-center space-x-2 bg-slate-900/60 p-1 rounded-lg border border-white/[0.06] text-xs">
        <span className="text-[11px] text-slate-400 font-mono px-2 flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> Presets:
        </span>
        {presets.slice(0, 3).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectPreset(p.id)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-300 hover:text-white hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30 transition-all truncate max-w-[150px]"
            title={p.problemStatement}
          >
            {p.title.split('(')[0].trim()}
          </button>
        ))}
      </div>

      {/* Status Badges & Main CTA */}
      <div className="flex items-center space-x-3">
        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center space-x-2 bg-[#0F172A] border border-white/[0.08] px-3 py-1.5 rounded-lg text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono text-[11px]">
            {compilerAvailable ? (systemHealth?.compiler?.command || 'clang++') : 'Compiler Active'}
          </span>
        </div>

        {/* Model Indicator */}
        <div className="hidden md:flex items-center space-x-2 bg-[#0F172A] border border-white/[0.08] px-3 py-1.5 rounded-lg text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-slate-300 font-mono text-[11px]">{modelName}</span>
        </div>

        {/* Analyze Code Primary Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none transition-all active:scale-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 rounded-xl transition-all duration-300 group-hover:opacity-90"></div>
          <div className="relative px-4 py-2 rounded-[11px] bg-gradient-to-r from-indigo-600 to-indigo-700 flex items-center space-x-2 text-white font-medium text-xs sm:text-sm">
            <Play className={`w-3.5 h-3.5 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Running Pipeline...' : 'Analyze Code'}</span>
            <span className="hidden sm:inline-block text-[10px] bg-black/30 border border-white/20 px-1.5 py-0.5 rounded text-indigo-200 font-mono">
              ⌘↵
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
