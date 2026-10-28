/**
 * Frontend API Service
 * Interacts with the Hybrid Error Detector Backend.
 */

export const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:5001');

async function request(path, options = {}) {
  // Use relative path if API_BASE is empty (Vite dev proxy)
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: `Server returned ${response.status} ${response.statusText}`
  }));

  if (!response.ok) {
    const errorMsg = data.message || (data.errors ? data.errors.join(', ') : `HTTP ${response.status}`);
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Analyze C++ code with test cases
  analyzeCode(payload) {
    return request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Get specific report by ID
  getAnalysis(id) {
    return request(`/api/analyze/${id}`);
  },

  // Get analysis history & dashboard stats
  getHistory() {
    return request('/api/history');
  },

  // Delete single history item
  deleteHistoryItem(id) {
    return request(`/api/history/${id}`, {
      method: 'DELETE'
    });
  },

  // Clear all history
  clearHistory() {
    return request('/api/history', {
      method: 'DELETE'
    });
  },

  // Get preset benchmark C++ examples
  getPresets() {
    return request('/api/presets');
  },

  // Check backend & compiler & Groq health
  getHealth() {
    return request('/api/health');
  }
};
