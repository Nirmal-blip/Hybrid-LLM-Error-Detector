/**
 * Analysis History Persistence Module
 * Dual persistence: MongoDB Atlas Cloud Database + Local Disk (backend/data/history.json)
 * Automatically syncs with MongoDB Atlas when connected, with local disk as instant cache.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AnalysisReport } from '../models/analysis.model.js';
import { isDbConnected } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'history.json');
const MAX_HISTORY = 100;

const historyMap = new Map();

// Initialize data directory and load existing records from disk / MongoDB
async function initStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // 1. Try loading from MongoDB if connected
    if (isDbConnected()) {
      try {
        const docs = await AnalysisReport.find().sort({ createdAt: -1 }).limit(MAX_HISTORY).lean();
        if (docs && docs.length > 0) {
          docs.forEach((doc) => {
            if (doc && doc.id) {
              historyMap.set(doc.id, doc);
            }
          });
          persistToDisk();
          console.log(`✓ Loaded ${docs.length} analysis record(s) from MongoDB Atlas`);
          return;
        }
      } catch (err) {
        console.warn('MongoDB query warning during init:', err.message);
      }
    }

    // 2. Fallback to local disk file
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      if (raw.trim()) {
        const records = JSON.parse(raw);
        if (Array.isArray(records)) {
          records.forEach((r) => {
            if (r && r.id) {
              historyMap.set(r.id, r);
            }
          });
          console.log(`✓ Loaded ${historyMap.size} persistent analysis record(s) from ${DATA_FILE}`);
        }
      }
    }
  } catch (err) {
    console.warn('History store initialization warning:', err.message);
  }
}

// Persist current memory snapshot to disk file
function persistToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const records = Array.from(historyMap.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist history to disk:', err.message);
  }
}

// Initial synchronous load from disk
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (raw.trim()) {
      const records = JSON.parse(raw);
      if (Array.isArray(records)) {
        records.forEach((r) => {
          if (r && r.id) historyMap.set(r.id, r);
        });
      }
    }
  }
} catch {}

export const historyStore = {
  /**
   * Sync memory store with MongoDB after connection is established
   */
  async syncWithDatabase() {
    await initStore();
  },

  /**
   * Save an analysis report to Memory, Disk, and MongoDB Atlas
   */
  async save(report) {
    if (!report || !report.id) return;

    // Prune oldest if limit exceeded
    if (historyMap.size >= MAX_HISTORY) {
      const oldestKey = historyMap.keys().next().value;
      historyMap.delete(oldestKey);
    }

    historyMap.set(report.id, report);
    persistToDisk();

    // Asynchronously upsert to MongoDB Atlas
    if (isDbConnected()) {
      try {
        await AnalysisReport.findOneAndUpdate(
          { id: report.id },
          report,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Failed to upsert report to MongoDB Atlas:', err.message);
      }
    }

    return report;
  },

  /**
   * Retrieve list of analysis summaries
   */
  getAll() {
    const list = Array.from(historyMap.values()).map((r) => ({
      id: r.id,
      timestamp: r.timestamp,
      problemStatement: r.problemStatement ? r.problemStatement.slice(0, 80) : 'Custom C++ Code Analysis',
      verdict: r.verdict,
      verdictDescription: r.verdictDescription,
      compilationSuccess: r.compilation?.success,
      totalBugs: r.reconciliation?.summary?.total || 0,
      verifiedBugs: r.reconciliation?.summary?.verified || 0,
      testsPassed: r.testExecution?.passedCount || 0,
      totalTests: r.testExecution?.totalTests || 0,
      modelUsed: r.llmAnalysis?.model || 'openai/gpt-oss-120b'
    }));

    return list.reverse();
  },

  /**
   * Get single analysis report by ID
   */
  getById(id) {
    return historyMap.get(id) || null;
  },

  /**
   * Delete an analysis by ID and update disk + MongoDB
   */
  async deleteById(id) {
    const deleted = historyMap.delete(id);
    if (deleted) {
      persistToDisk();
      if (isDbConnected()) {
        try {
          await AnalysisReport.deleteOne({ id });
        } catch (err) {
          console.warn('Failed to delete report from MongoDB:', err.message);
        }
      }
    }
    return deleted;
  },

  /**
   * Clear all history from memory, disk, and MongoDB Atlas
   */
  async clear() {
    historyMap.clear();
    persistToDisk();
    if (isDbConnected()) {
      try {
        await AnalysisReport.deleteMany({});
      } catch (err) {
        console.warn('Failed to clear reports from MongoDB:', err.message);
      }
    }
    return true;
  },

  /**
   * Aggregate statistics for dashboard metrics
   */
  getStats() {
    const all = Array.from(historyMap.values());
    const totalAnalyses = all.length;
    let totalBugsDetected = 0;
    let verifiedFindings = 0;
    let totalTestsExecuted = 0;
    let totalTestsPassed = 0;

    for (const r of all) {
      totalBugsDetected += r.reconciliation?.summary?.total || 0;
      verifiedFindings += r.reconciliation?.summary?.verified || 0;
      totalTestsExecuted += r.testExecution?.totalTests || 0;
      totalTestsPassed += r.testExecution?.passedCount || 0;
    }

    return {
      totalAnalyses,
      totalBugsDetected,
      verifiedFindings,
      totalTestsExecuted,
      totalTestsPassed,
      verificationRate: totalBugsDetected > 0 ? Math.round((verifiedFindings / totalBugsDetected) * 100) : 0,
      testPassRate: totalTestsExecuted > 0 ? Math.round((totalTestsPassed / totalTestsExecuted) * 100) : 0
    };
  }
};
