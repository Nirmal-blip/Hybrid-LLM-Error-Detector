import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export default function AnalysisProgress({ currentStep, error }) {
  const steps = [
    { id: 1, title: 'Validating source code', desc: 'Sanitizing input syntax and structure' },
    { id: 2, title: 'Compiling C++', desc: 'Invoking isolated clang++ compiler with -O2 -Wall' },
    { id: 3, title: 'Executing test cases', desc: 'Running binary in sandboxed process with timeouts' },
    { id: 4, title: 'Analyzing potential logical errors', desc: 'Evaluating logic with Groq LLM & static checks' },
    { id: 5, title: 'Validating findings', desc: 'Cross-referencing model assertions against execution evidence' },
    { id: 6, title: 'Preparing final report', desc: 'Generating reconciliation verdict and code diff' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-canvas/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-canvas-card border border-canvas-border rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-canvas-border pb-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base">
              Hybrid Error Detection In Progress
            </h3>
            <p className="text-xs text-slate-400">
              Correlating Groq LLM reasoning with compiler and execution data
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Step {Math.min(currentStep, 6)} of 6
          </span>
        </div>

        {error ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start space-x-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <div className="font-semibold text-rose-200">Pipeline Execution Error</div>
              <div className="mt-1">{error}</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-2.5 rounded-lg transition-all ${
                    isCurrent
                      ? 'bg-indigo-500/10 border border-indigo-500/30'
                      : 'border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-xs font-medium ${
                        isCompleted
                          ? 'text-slate-300'
                          : isCurrent
                          ? 'text-indigo-300 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[11px] text-slate-500">{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-[11px] text-slate-500 text-center font-mono">
          Isolated Sandbox • CPU/Memory Guardrails Active
        </div>
      </div>
    </div>
  );
}
