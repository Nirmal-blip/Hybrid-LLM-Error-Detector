import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import CodeWorkspace from './components/CodeWorkspace.jsx';
import ResultsDashboard from './components/ResultsDashboard.jsx';
import HistoryView from './components/HistoryView.jsx';
import SettingsView from './components/SettingsView.jsx';
import AnalysisProgress from './components/AnalysisProgress.jsx';
import { api } from './services/api.js';

const INITIAL_CODE = `#include <iostream>
#include <vector>

using namespace std;

// Buggy Binary Search:
// 1. mid = (l + r) / 2 can overflow for large indices.
// 2. r = mid leads to an infinite loop if target is smaller than middle element.
int binarySearch(const vector<int>& arr, int target) {
    int l = 0;
    int r = arr.size(); // Potential boundary issue

    while (l <= r) {
        int mid = (l + r) / 2; // Midpoint integer overflow hazard
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            l = mid + 1;
        } else {
            r = mid; // Bug: leads to infinite loop when target is smaller
        }
    }
    return -1;
}

int main() {
    int n, target;
    if (!(cin >> n >> target)) return 0;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    cout << binarySearch(arr, target) << endl;
    return 0;
}
`;

const INITIAL_PROBLEM = "Given a sorted array of N integers and a target value, output the 0-based index if target exists in array, or -1 otherwise.";

const INITIAL_TESTS = [
  {
    id: 'tc-1',
    name: 'Target Present in Middle',
    input: '5 7\n1 3 5 7 9',
    expectedOutput: '3'
  },
  {
    id: 'tc-2',
    name: 'Target Smaller Than Left (Edge Case)',
    input: '5 0\n1 3 5 7 9',
    expectedOutput: '-1'
  },
  {
    id: 'tc-3',
    name: 'Single Element Not Found',
    input: '1 4\n5',
    expectedOutput: '-1'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [sourceCode, setSourceCode] = useState(INITIAL_CODE);
  const [problemStatement, setProblemStatement] = useState(INITIAL_PROBLEM);
  const [testCases, setTestCases] = useState(INITIAL_TESTS);

  const [activeReport, setActiveReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState(1);
  const [progressError, setProgressError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [presets, setPresets] = useState([]);
  const [isRefreshingHealth, setIsRefreshingHealth] = useState(false);

  // Fetch initial system status, history, and presets
  const fetchInitialData = useCallback(async () => {
    try {
      const [healthRes, historyRes, presetsRes] = await Promise.allSettled([
        api.getHealth(),
        api.getHistory(),
        api.getPresets()
      ]);

      if (healthRes.status === 'fulfilled') {
        setSystemHealth(healthRes.value);
      }
      if (historyRes.status === 'fulfilled' && historyRes.value.success) {
        setHistory(historyRes.value.history || []);
        setHistoryStats(historyRes.value.stats || null);
      }
      if (presetsRes.status === 'fulfilled' && presetsRes.value.success) {
        setPresets(presetsRes.value.presets || []);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Refresh health check manually
  const handleRefreshHealth = async () => {
    setIsRefreshingHealth(true);
    try {
      const health = await api.getHealth();
      setSystemHealth(health);
    } catch (err) {
      console.error('Failed to refresh health:', err);
    } finally {
      setIsRefreshingHealth(false);
    }
  };

  // Run Hybrid Analysis Pipeline
  const handleAnalyze = async (customCode, customProblem, customTests) => {
    const codeToAnalyze = typeof customCode === 'string' ? customCode : sourceCode;
    const problemToAnalyze = typeof customProblem === 'string' ? customProblem : problemStatement;
    const testsToAnalyze = Array.isArray(customTests) ? customTests : testCases;

    if (!codeToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setProgressStep(1);
    setProgressError(null);

    // Realistic progress animation sequencing
    const stepTimer = setInterval(() => {
      setProgressStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 450);

    try {
      const response = await api.analyzeCode({
        sourceCode: codeToAnalyze,
        problemStatement: problemToAnalyze,
        testCases: testsToAnalyze
      });

      clearInterval(stepTimer);
      setProgressStep(6);

      if (response.success && response.report) {
        setActiveReport(response.report);

        // Refresh history & metrics
        const historyData = await api.getHistory().catch(() => null);
        if (historyData && historyData.success) {
          setHistory(historyData.history || []);
          setHistoryStats(historyData.stats || null);
        }

        // Brief delay for user to register final step completion
        setTimeout(() => {
          setIsAnalyzing(false);
          setActiveTab('results');
        }, 500);
      } else {
        throw new Error(response.message || 'Analysis failed to return a report');
      }
    } catch (err) {
      clearInterval(stepTimer);
      setProgressError(err.message || 'Pipeline analysis encountered an error.');
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 3500);
    }
  };

  // Select preset
  const handleSelectPreset = (presetId) => {
    const selected = presets.find((p) => p.id === presetId);
    if (selected) {
      setSourceCode(selected.sourceCode);
      setProblemStatement(selected.problemStatement);
      setTestCases(selected.testCases || []);
      setActiveTab('workspace');
    }
  };

  // Run Benchmark Demo directly
  const handleRunDemoAnalysis = () => {
    const demo = presets[0];
    if (demo) {
      setSourceCode(demo.sourceCode);
      setProblemStatement(demo.problemStatement);
      setTestCases(demo.testCases);
      handleAnalyze(demo.sourceCode, demo.problemStatement, demo.testCases);
    } else {
      handleAnalyze();
    }
  };

  // Global Keyboard Shortcut: Ctrl/Cmd + Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isAnalyzing) {
          handleAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnalyzing, sourceCode, problemStatement, testCases]);

  // Select historical report
  const handleSelectReport = async (id) => {
    try {
      const res = await api.getAnalysis(id);
      if (res.success && res.report) {
        setActiveReport(res.report);
        setActiveTab('results');
      }
    } catch (err) {
      alert('Failed to load report: ' + err.message);
    }
  };

  // Delete historical report
  const handleDeleteReport = async (id) => {
    try {
      await api.deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Clear all history
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete all analysis records?')) {
      try {
        await api.clearHistory();
        setHistory([]);
        setHistoryStats(null);
        setActiveReport(null);
      } catch (err) {
        alert('Clear history failed: ' + err.message);
      }
    }
  };

  // Load suggested fix directly into Monaco Editor
  const handleLoadFixIntoEditor = (fixCode) => {
    if (fixCode) {
      setSourceCode(fixCode);
      setActiveTab('workspace');
    }
  };

  // Start fresh analysis
  const handleNewAnalysis = () => {
    setActiveTab('workspace');
  };

  return (
    <div className="flex flex-col h-screen w-screen min-h-0 min-w-0 overflow-hidden bg-[#07090E] text-slate-100 font-sans">
      {/* Top Header */}
      <Header
        systemHealth={systemHealth}
        onNewAnalysis={handleNewAnalysis}
        onAnalyze={() => handleAnalyze()}
        isAnalyzing={isAnalyzing}
        onSelectPreset={handleSelectPreset}
        presets={presets}
      />

      {/* Main Layout Pane */}
      <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasActiveReport={Boolean(activeReport)}
          historyStats={historyStats}
          historyCount={history.length}
        />

        {/* View Switcher Container */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden relative bg-[#07090E]">
          {activeTab === 'workspace' && (
            <CodeWorkspace
              sourceCode={sourceCode}
              setSourceCode={setSourceCode}
              problemStatement={problemStatement}
              setProblemStatement={setProblemStatement}
              testCases={testCases}
              setTestCases={setTestCases}
              onAnalyze={() => handleAnalyze()}
              isAnalyzing={isAnalyzing}
              presets={presets}
            />
          )}

          {activeTab === 'results' && (
            <ResultsDashboard
              report={activeReport}
              onLoadFixIntoEditor={handleLoadFixIntoEditor}
              onRunDemoAnalysis={handleRunDemoAnalysis}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              stats={historyStats}
              onSelectReport={handleSelectReport}
              onDeleteReport={handleDeleteReport}
              onClearHistory={handleClearHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              systemHealth={systemHealth}
              onRefreshHealth={handleRefreshHealth}
              isRefreshing={isRefreshingHealth}
            />
          )}
        </main>
      </div>

      {/* Active Pipeline Progress Overlay */}
      {isAnalyzing && (
        <AnalysisProgress
          currentStep={progressStep}
          error={progressError}
        />
      )}
    </div>
  );
}
