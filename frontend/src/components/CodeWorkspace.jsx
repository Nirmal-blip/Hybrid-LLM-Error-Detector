import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Plus,
  Trash2,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  Code,
  Terminal,
  Flame,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

export default function CodeWorkspace({
  sourceCode,
  setSourceCode,
  problemStatement,
  setProblemStatement,
  testCases,
  setTestCases,
  onAnalyze,
  isAnalyzing,
  presets = []
}) {
  const [showProblemStatement, setShowProblemStatement] = useState(true);
  const [activePreset, setActivePreset] = useState('');

  // Handle Preset Selection
  const handleSelectPreset = (presetId) => {
    setActivePreset(presetId);
    const selected = presets.find((p) => p.id === presetId);
    if (selected) {
      setSourceCode(selected.sourceCode);
      setProblemStatement(selected.problemStatement);
      setTestCases(selected.testCases || []);
    }
  };

  // Add new test case
  const handleAddTestCase = () => {
    const nextNum = testCases.length + 1;
    setTestCases([
      ...testCases,
      {
        id: `tc-${Date.now()}`,
        name: `Custom Test Case #${nextNum}`,
        input: '',
        expectedOutput: ''
      }
    ]);
  };

  // Update test case field
  const handleUpdateTestCase = (index, field, value) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  // Remove test case
  const handleRemoveTestCase = (index) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  // Clear all problem description and test cases
  const handleClearAll = () => {
    setProblemStatement('');
    setTestCases([]);
    setActivePreset('');
  };

  // Reset workspace to clean template
  const handleReset = () => {
    if (window.confirm('Reset workspace to a fresh template?')) {
      setSourceCode(`#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`);
      setProblemStatement('');
      setTestCases([
        { id: 'tc-1', name: 'Sample Test', input: '', expectedOutput: 'Hello, World!' }
      ]);
      setActivePreset('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-[#07090E] overflow-hidden">
      {/* Top Action Toolbar */}
      <div className="h-14 border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between bg-[#0B0F19]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center space-x-3 overflow-x-auto py-1">
          {/* C++ Indicator */}
          <div className="flex items-center space-x-2 text-xs font-mono bg-[#0F172A] px-3 py-1.5 rounded-lg border border-white/[0.08] text-slate-200 shrink-0">
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-100">C++17</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Clang Core</span>
          </div>

          {/* Preset Benchmark Pills */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-500 uppercase flex items-center gap-1 pl-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> Benchmarks:
            </span>
            {presets.map((preset) => {
              const isCurrent = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-white/[0.06]'
                  }`}
                >
                  {preset.title.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleClearAll}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#0F172A] border border-white/[0.08] rounded-lg hover:bg-slate-800 transition"
            title="Clear problem statement and test cases"
          >
            <span>Clear Inputs</span>
          </button>

          <button
            onClick={handleReset}
            disabled={isAnalyzing}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#0F172A] border border-white/[0.08] rounded-lg hover:bg-slate-800 transition"
            title="Reset code editor to template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !sourceCode.trim()}
            className="flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Run Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Editor + Sidebar Drawer) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Monaco Editor Pane */}
        <div className="flex-1 flex flex-col min-h-[400px] lg:min-h-0 min-w-0 border-b lg:border-b-0 lg:border-r border-white/[0.08] bg-[#07090E] relative overflow-hidden">
          {/* File Tab Bar */}
          <div className="h-10 px-4 bg-[#0B0F19] border-b border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono select-none">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1 rounded bg-[#07090E] border-t-2 border-indigo-500 text-slate-200">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-xs">solution.cpp</span>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                (Target Algorithm)
              </span>
            </div>

            <div className="flex items-center space-x-3 text-[11px] text-slate-500">
              <span>{sourceCode.split('\n').length} Lines</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Synced
              </span>
            </div>
          </div>

          {/* Monaco Editor Component with explicit height guarantee */}
          <div className="flex-1 relative w-full h-full min-h-0">
            <Editor
              height="100%"
              width="100%"
              language="cpp"
              theme="vs-dark"
              value={sourceCode}
              onChange={(value) => setSourceCode(value || '')}
              options={{
                fontSize: 13.5,
                fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, monospace",
                fontLigatures: true,
                minimap: { enabled: true, scale: 0.85 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 4,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                automaticLayout: true,
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>
        </div>

        {/* Right Drawer: Problem Statement & Test Cases Suite */}
        <div className="w-full lg:w-[420px] flex flex-col bg-[#090D16] min-h-0 overflow-y-auto shrink-0 border-l border-white/[0.08]">
          {/* Problem Statement Section */}
          <div className="border-b border-white/[0.08]">
            <div className="w-full px-4 py-3 flex items-center justify-between text-xs font-semibold text-slate-200 select-none">
              <button
                onClick={() => setShowProblemStatement(!showProblemStatement)}
                className="flex items-center space-x-2 hover:text-indigo-300 transition"
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs">Problem Description</span>
                {showProblemStatement ? (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                )}
              </button>

              {problemStatement && (
                <button
                  onClick={() => setProblemStatement('')}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition"
                  title="Clear problem description"
                >
                  Clear
                </button>
              )}
            </div>

            {showProblemStatement && (
              <div className="p-3.5 bg-[#0B0F19]/50 border-t border-white/[0.04]">
                <textarea
                  value={problemStatement}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  placeholder="Optional: Describe program requirements or desired output (e.g. 'Print hello'). Leave blank if not needed."
                  rows={3}
                  className="w-full bg-[#07090E] border border-white/[0.08] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 font-sans resize-none leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Test Cases Suite Header */}
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between bg-[#0B0F19]/60 select-none">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Test Suite</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/[0.06]">
                {testCases.length}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {testCases.length > 0 && (
                <button
                  onClick={() => setTestCases([])}
                  className="text-[11px] text-slate-500 hover:text-rose-400 px-1.5 py-0.5 transition"
                  title="Clear all test cases"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={handleAddTestCase}
                className="flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Case</span>
              </button>
            </div>
          </div>

          {/* Test Cases List */}
          <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
            {testCases.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No test cases defined. Click "Add Case" to specify inputs and expected outputs.
              </div>
            ) : (
              testCases.map((tc, index) => (
                <div
                  key={tc.id || index}
                  className="bg-[#0D121E] border border-white/[0.08] rounded-xl p-3.5 space-y-2.5 relative group hover:border-indigo-500/30 transition shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                    <input
                      type="text"
                      value={tc.name}
                      onChange={(e) => handleUpdateTestCase(index, 'name', e.target.value)}
                      className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none border-b border-transparent focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleRemoveTestCase(index)}
                      className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition p-1"
                      title="Delete test case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Standard Input */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                      stdin (Stream Input)
                    </label>
                    <textarea
                      value={tc.input}
                      onChange={(e) => handleUpdateTestCase(index, 'input', e.target.value)}
                      placeholder="Input parameters..."
                      rows={2}
                      className="w-full bg-[#07090E] border border-white/[0.06] rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Expected Output */}
                  <div>
                    <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block mb-1">
                      stdout (Expected Output)
                    </label>
                    <textarea
                      value={tc.expectedOutput}
                      onChange={(e) => handleUpdateTestCase(index, 'expectedOutput', e.target.value)}
                      placeholder="Expected output string..."
                      rows={2}
                      className="w-full bg-[#07090E] border border-white/[0.06] rounded-lg p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
