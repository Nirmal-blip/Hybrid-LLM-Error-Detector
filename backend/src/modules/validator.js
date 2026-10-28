/**
 * Request Validation Module
 * Validates C++ source code, test cases, and problem description.
 */

export function validateAnalysisRequest(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Request body must be a valid JSON object.'],
      sanitized: null
    };
  }

  const { sourceCode, problemStatement = '', testCases = [] } = data;

  // Validate Source Code
  if (!sourceCode || typeof sourceCode !== 'string') {
    errors.push('C++ source code is required and must be a string.');
  } else if (sourceCode.trim().length === 0) {
    errors.push('Source code cannot be empty.');
  } else if (sourceCode.length > 100000) {
    errors.push('Source code exceeds maximum allowed length of 100KB.');
  }

  // Validate Problem Statement
  if (problemStatement && typeof problemStatement !== 'string') {
    errors.push('Problem statement must be a text string.');
  }

  // Validate Test Cases
  let sanitizedTestCases = [];
  if (!Array.isArray(testCases)) {
    errors.push('Test cases must be provided as an array.');
  } else {
    sanitizedTestCases = testCases.map((tc, idx) => {
      if (typeof tc !== 'object' || tc === null) {
        errors.push(`Test case #${idx + 1} must be an object.`);
        return null;
      }
      return {
        id: tc.id || `tc-${idx + 1}`,
        name: typeof tc.name === 'string' && tc.name.trim() ? tc.name.trim() : `Test Case #${idx + 1}`,
        input: typeof tc.input === 'string' ? tc.input.replace(/\r\n/g, '\n') : '',
        expectedOutput: typeof tc.expectedOutput === 'string' ? tc.expectedOutput.replace(/\r\n/g, '\n') : ''
      };
    }).filter(Boolean);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      sanitized: null
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      sourceCode: sourceCode.replace(/\r\n/g, '\n'),
      problemStatement: (problemStatement || '').trim(),
      testCases: sanitizedTestCases
    }
  };
}
