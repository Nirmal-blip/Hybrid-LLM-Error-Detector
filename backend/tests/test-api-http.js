/**
 * Integration Test: Live HTTP API Endpoints
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import analysisRoutes from '../src/routes/analysis.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', analysisRoutes);

const server = app.listen(5055, async () => {
  console.log('🚀 Test server running on http://localhost:5055');

  try {
    // 1. Test /api/health
    console.log('\nTesting GET /api/health...');
    const healthRes = await fetch('http://localhost:5055/api/health');
    const healthJson = await healthRes.json();
    console.log('✓ Health response:', JSON.stringify(healthJson.compiler));

    // 2. Test /api/presets
    console.log('\nTesting GET /api/presets...');
    const presetsRes = await fetch('http://localhost:5055/api/presets');
    const presetsJson = await presetsRes.json();
    console.log(`✓ Presets loaded: ${presetsJson.presets?.length} benchmarks`);

    // 3. Test POST /api/analyze with a buggy C++ binary search
    console.log('\nTesting POST /api/analyze...');
    const analyzePayload = {
      sourceCode: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    int target;
    if (cin >> target) {
        if (target = 10) { // Bug: assignment in if
            cout << "Found" << endl;
        } else {
            cout << "Not Found" << endl;
        }
    }
    return 0;
}`,
      problemStatement: 'Check if input equals 10',
      testCases: [
        {
          id: 'tc-1',
          name: 'Target is 5 (should be Not Found)',
          input: '5',
          expectedOutput: 'Not Found'
        }
      ]
    };

    const analyzeRes = await fetch('http://localhost:5055/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analyzePayload)
    });

    const analyzeJson = await analyzeRes.json();
    if (!analyzeJson.success) {
      throw new Error('Analyze API failed: ' + analyzeJson.message);
    }

    const report = analyzeJson.report;
    console.log('✓ Report generated successfully:');
    console.log(`  - Report ID: ${report.id}`);
    console.log(`  - Verdict: ${report.verdict} (${report.verdictDescription})`);
    console.log(`  - Compilation: success=${report.compilation.success}`);
    console.log(`  - Tests: ${report.testExecution.passedCount}/${report.testExecution.totalTests} passed`);
    console.log(`  - Reconciled Findings: ${report.reconciliation.bugs.length} bugs`);
    report.reconciliation.bugs.forEach((b) => {
      console.log(`    * [${b.verificationStatus}] ${b.title} (${b.severity})`);
    });

    // 4. Test GET /api/history
    console.log('\nTesting GET /api/history...');
    const historyRes = await fetch('http://localhost:5055/api/history');
    const historyJson = await historyRes.json();
    console.log(`✓ History items count: ${historyJson.history?.length}`);
    console.log(`✓ Total bugs recorded: ${historyJson.stats?.totalBugsDetected}`);

    console.log('\n🎉 ALL LIVE HTTP ENDPOINT TESTS COMPLETED SUCCESSFULLY!\n');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ HTTP Test Failure:', err);
    server.close();
    process.exit(1);
  }
});
