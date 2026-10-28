/**
 * Mongoose Schema & Model for C++ Analysis Reports
 */

import mongoose from 'mongoose';

const AnalysisReportSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    problemStatement: {
      type: String,
      default: ''
    },
    sourceCode: {
      type: String,
      required: true
    },
    correctedCode: {
      type: String,
      default: ''
    },
    lineDiff: {
      type: Array,
      default: []
    },
    verdict: {
      type: String,
      required: true,
      index: true
    },
    verdictDescription: {
      type: String,
      default: ''
    },
    compilation: {
      type: Object,
      default: {}
    },
    testExecution: {
      type: Object,
      default: {}
    },
    staticAnalysis: {
      type: Object,
      default: {}
    },
    llmAnalysis: {
      type: Object,
      default: {}
    },
    reconciliation: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'analysis_reports'
  }
);

export const AnalysisReport = mongoose.models.AnalysisReport || mongoose.model('AnalysisReport', AnalysisReportSchema);
