/**
 * Analysis Routes
 * Exposes API endpoints for analysis, history, presets, and health.
 */

import { Router } from 'express';
import {
  analyzeCode,
  getAnalysisById,
  getHistory,
  deleteHistoryItem,
  clearHistory,
  getPresets,
  healthCheck
} from '../controllers/analysis.controller.js';

const router = Router();

// Core Analysis Endpoints
router.post('/analyze', analyzeCode);
router.get('/analyze/:id', getAnalysisById);

// History & Statistics
router.get('/history', getHistory);
router.delete('/history/:id', deleteHistoryItem);
router.delete('/history', clearHistory);

// Preset Benchmarks
router.get('/presets', getPresets);

// Health & System Status
router.get('/health', healthCheck);

export default router;
