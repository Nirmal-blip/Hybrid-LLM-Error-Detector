import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Sparkles,
  Server,
  Lock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal
} from 'lucide-react';
import { API_BASE } from '../services/api';

export default function SettingsView({ systemHealth, onRefreshHealth, isRefreshing }) {
  const compiler = systemHealth?.compiler;
  const groq = systemHealth?.groq;
  const sandbox = systemHealth?.sandbox;

  return (
    <div className="flex-1 flex flex-col h-full bg-canvas overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-canvas-border pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <span>System Diagnostics & Environment Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of backend microservices, compiler binaries, Groq LLM integration, and sandboxing.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-canvas-card border border-canvas-border hover:bg-canvas-hover text-slate-300 rounded-md transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Compiler Service */}
        <div className="bg-canvas-card border border-canvas-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-canvas-border pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-200">C++ Compiler</h3>
            </div>
            {compiler?.available ? (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            ) : (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                Missing
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Binary Command</span>
              <span className="text-slate-200">{compiler?.command || 'clang++'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Compiler Version</span>
              <span className="text-slate-300 text-[11px] leading-tight block">
                {compiler?.version || 'Detecting...'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Standard Enabled</span>
              <span className="text-slate-300">C++17 with -O2 -Wall -Wextra</span>
            </div>
          </div>
        </div>

        {/* Groq LLM Service */}
        <div className="bg-canvas-card border border-canvas-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-canvas-border pb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-200">Groq LLM Engine</h3>
            </div>
            {groq?.configured ? (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            ) : (
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Key Required
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Configured Model</span>
              <span className="text-indigo-300">{groq?.model || 'openai/gpt-oss-120b'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">API Integration</span>
              <span className="text-slate-300">Official Groq SDK (Server-Side)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Security</span>
              <span className="text-emerald-400 flex items-center text-[11px]">
                <Lock className="w-3 h-3 mr-1" /> Never exposed to client
              </span>
            </div>
          </div>
        </div>

        {/* Execution Sandbox Service */}
        <div className="bg-canvas-card border border-canvas-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-canvas-border pb-3">
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-200">Execution Sandbox</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Timeout Limit</span>
              <span className="text-slate-200">{sandbox?.timeoutMs || 2000} ms per test case</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Signal Protection</span>
              <span className="text-slate-300">SIGSEGV, SIGFPE, SIGABRT, SIGKILL</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Buffer Ceiling</span>
              <span className="text-slate-300">256 KB stdout/stderr limit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration & Environment Guide Card */}
      <div className="bg-canvas-card border border-canvas-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span>Environment Variable Setup</span>
        </h3>

        <div className="text-xs text-slate-400 space-y-2">
          <p>
            To activate live Groq model reasoning, configure your key inside <code className="text-indigo-300 bg-canvas px-1.5 py-0.5 rounded border border-canvas-border font-mono">backend/.env</code>:
          </p>

          <pre className="bg-canvas p-3 rounded-lg border border-canvas-border text-slate-300 font-mono text-xs overflow-x-auto">
{`# backend/.env
PORT=5001
NODE_ENV=development

# Get your free API key at https://console.groq.com/keys
GROQ_API_KEY=gsk_your_actual_key_here
GROQ_MODEL=openai/gpt-oss-120b

# C++ Compiler binary
CXX_COMPILER=clang++
EXECUTION_TIMEOUT_MS=2000`}
          </pre>

          <p className="text-[11px] text-slate-500 pt-1">
            Note: The system gracefully operates using static heuristics, compilation diagnostics, and test case execution even when offline.
          </p>
        </div>
      </div>
    </div>
  );
}
