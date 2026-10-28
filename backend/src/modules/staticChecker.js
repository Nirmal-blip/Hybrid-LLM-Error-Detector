/**
 * Static Analysis Module
 * Scans C++ source code for common logical bugs, UB, precedence errors,
 * off-by-one errors, and anti-patterns.
 */

export function runStaticChecks(sourceCode) {
  const findings = [];
  const lines = sourceCode.split('\n');

  lines.forEach((lineText, index) => {
    const lineNum = index + 1;
    const trimmed = lineText.trim();

    // Skip comment lines
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    // 1. Assignment in condition: if (a = b) instead of if (a == b)
    const assignInIfRegex = /\b(if|while)\s*\(\s*([a-zA-Z_]\w*)\s*=\s*([^=][^;)]*)\)/;
    const assignMatch = trimmed.match(assignInIfRegex);
    if (assignMatch) {
      findings.push({
        id: `static-assign-cond-${lineNum}`,
        title: 'Assignment in Conditional Expression',
        category: 'Logical Operator Bug',
        severity: 'Critical',
        line: lineNum,
        snippet: lineText.trim(),
        message: `Found assignment '=' inside '${assignMatch[1]}' condition. Did you intend equality comparison '=='?`,
        suggestedFix: lineText.replace(/=/, '==')
      });
    }

    // 2. Off-by-one loop boundary on 0-indexed container
    const offByOneLoopRegex = /for\s*\(\s*(?:int|size_t|auto)\s+([a-zA-Z_]\w*)\s*=\s*0\s*;\s*\1\s*<=\s*([a-zA-Z_0-9]+(?:\.size\(\)|\.length\(\)|\[\w+\])?)\s*;/;
    const offByOneMatch = trimmed.match(offByOneLoopRegex);
    if (offByOneMatch && !trimmed.includes('<= 0')) {
      const bound = offByOneMatch[2];
      findings.push({
        id: `static-off-by-one-${lineNum}`,
        title: 'Potential Off-by-One Array Boundary (Out of Bounds)',
        category: 'Boundary & Array Access',
        severity: 'High',
        line: lineNum,
        snippet: lineText.trim(),
        message: `Loop condition uses '<= ${bound}' starting at index 0. If indexing a 0-indexed container of size ${bound}, this will access out of bounds. Consider '<'.`,
        suggestedFix: lineText.replace('<=', '<')
      });
    }

    // 3. Integer overflow in binary search mid calculation
    const bsMidOverflow = /(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*\(\s*([a-zA-Z_0-9]+)\s*\+\s*([a-zA-Z_0-9]+)\s*\)\s*\/\s*2/;
    const bsMatch = trimmed.match(bsMidOverflow);
    if (bsMatch && (bsMatch[1].toLowerCase().includes('mid') || bsMatch[2].toLowerCase().includes('l') || bsMatch[3].toLowerCase().includes('r') || bsMatch[2].toLowerCase().includes('low') || bsMatch[3].toLowerCase().includes('high'))) {
      const varName = bsMatch[1];
      const left = bsMatch[2];
      const right = bsMatch[3];
      findings.push({
        id: `static-overflow-bs-${lineNum}`,
        title: 'Integer Overflow in Midpoint Calculation',
        category: 'Integer Overflow',
        severity: 'Medium',
        line: lineNum,
        snippet: lineText.trim(),
        message: `'(${left} + ${right}) / 2' can cause 32-bit signed integer overflow when both indices are large. Use '${left} + (${right} - ${left}) / 2' instead.`,
        suggestedFix: lineText.replace(`(${left} + ${right}) / 2`, `${left} + (${right} - ${left}) / 2`)
      });
    }

    // 4. Bitwise operator precedence mistake: a & b == c
    const bitwisePrecedenceRegex = /if\s*\(.*?\b\w+\s*(&|\||\^)\s*\w+\s*(==|!=|<|>|<=|>=)/;
    if (bitwisePrecedenceRegex.test(trimmed)) {
      findings.push({
        id: `static-precedence-${lineNum}`,
        title: 'Operator Precedence Hazard (Bitwise vs Comparison)',
        category: 'Operator Precedence',
        severity: 'High',
        line: lineNum,
        snippet: lineText.trim(),
        message: `Comparison operators (==, !=, <, >) have higher precedence than bitwise operators (&, |, ^). Wrap the bitwise expression in parentheses like '(a & b) == c'.`,
        suggestedFix: 'Wrap bitwise expression in parentheses: (a & b) == c'
      });
    }

    // 5. Direct floating point equality comparison
    const floatEqualityRegex = /if\s*\(.*?\b([a-zA-Z_]\w*)\s*(==|!=)\s*(\d+\.\d+|\b0\.0\b)/;
    if (floatEqualityRegex.test(trimmed)) {
      findings.push({
        id: `static-float-eq-${lineNum}`,
        title: 'Direct Floating-Point Equality Comparison',
        category: 'Precision & Numerical Stability',
        severity: 'Medium',
        line: lineNum,
        snippet: lineText.trim(),
        message: 'Direct equality comparison (==, !=) on floating point numbers is unreliable due to IEEE 754 precision issues. Use std::abs(a - b) < EPSILON.',
        suggestedFix: 'Use std::abs(val - target) < 1e-9'
      });
    }

    // 6. Integer division assigned to float/double
    const intDivisionRegex = /(?:double|float)\s+([a-zA-Z_]\w*)\s*=\s*([a-zA-Z_]\w*|\d+)\s*\/\s*([a-zA-Z_]\w*|\d+)\s*;/;
    const intDivMatch = trimmed.match(intDivisionRegex);
    if (intDivMatch && !trimmed.includes('static_cast') && !trimmed.includes('(double)') && !trimmed.includes('.0')) {
      findings.push({
        id: `static-int-div-${lineNum}`,
        title: 'Potential Integer Division Truncation',
        category: 'Type Conversion & Precision',
        severity: 'Low',
        line: lineNum,
        snippet: lineText.trim(),
        message: `Expression '${intDivMatch[2]} / ${intDivMatch[3]}' performs integer division before assigning to floating point type '${intDivMatch[1]}'. Cast an operand to double: 'static_cast<double>(${intDivMatch[2]}) / ${intDivMatch[3]}'.`,
        suggestedFix: `static_cast<double>(${intDivMatch[2]}) / ${intDivMatch[3]};`
      });
    }

    // 7. Infinite loop: wrong step variable in for-loop
    const wrongStepRegex = /for\s*\(\s*(?:int|size_t)\s+([a-zA-Z_]\w*)\s*=\s*\d+\s*;\s*\1\s*<\s*([a-zA-Z_]\w*)\s*;\s*\1--\s*\)/;
    if (wrongStepRegex.test(trimmed)) {
      findings.push({
        id: `static-loop-step-${lineNum}`,
        title: 'Decreasing Counter in Forward Loop (Infinite Loop / Underflow)',
        category: 'Control Flow',
        severity: 'Critical',
        line: lineNum,
        snippet: lineText.trim(),
        message: 'Loop condition tests index < bound but decrements counter with --, causing underflow and an infinite loop.',
        suggestedFix: lineText.replace(/--/, '++')
      });
    }
  });

  return findings;
}
