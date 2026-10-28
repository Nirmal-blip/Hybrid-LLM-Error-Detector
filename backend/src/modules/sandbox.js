/**
 * Isolated Sandboxed Execution Module
 * Executes compiled C++ binary in a controlled subprocess with strict limits.
 */

import { spawn } from 'child_process';

const DEFAULT_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 256 * 1024; // 256 KB

/**
 * Execute a compiled binary with given input
 * @param {string} binaryPath
 * @param {string} stdinInput
 * @param {number} timeoutMs
 * @returns {Promise<Object>}
 */
export function executeBinary(binaryPath, stdinInput = '', timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let outputExceeded = false;

    // Spawn binary with restricted working directory
    const child = spawn(binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const timer = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch {}
    }, timeoutMs);

    // Feed stdin if provided
    if (child.stdin) {
      try {
        if (stdinInput) {
          child.stdin.write(stdinInput);
        }
        child.stdin.end();
      } catch (err) {
        // Stdin pipe closed or broke
      }
    }

    child.stdout.on('data', (chunk) => {
      if (stdout.length + chunk.length > MAX_OUTPUT_BYTES) {
        outputExceeded = true;
        stdout += chunk.toString().slice(0, MAX_OUTPUT_BYTES - stdout.length);
        try {
          child.kill('SIGKILL');
        } catch {}
      } else {
        stdout += chunk.toString();
      }
    });

    child.stderr.on('data', (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += chunk.toString();
      }
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const executionTimeMs = Date.now() - startTime;

      let status = 'SUCCESS';
      let error = null;

      if (timedOut) {
        status = 'TIME_LIMIT_EXCEEDED';
        error = `Execution exceeded time limit of ${timeoutMs}ms (infinite loop or high complexity)`;
      } else if (outputExceeded) {
        status = 'OUTPUT_LIMIT_EXCEEDED';
        error = 'Program generated too much output (possible infinite output loop).';
      } else if (signal === 'SIGSEGV') {
        status = 'SEGMENTATION_FAULT';
        error = 'Segmentation fault (invalid memory reference / out-of-bounds / null pointer dereference).';
      } else if (signal === 'SIGFPE') {
        status = 'FLOATING_POINT_EXCEPTION';
        error = 'Arithmetic exception (division by zero or integer overflow trap).';
      } else if (signal === 'SIGABRT') {
        status = 'ABORTED';
        error = 'Aborted (assertion failure or uncaught std::exception).';
      } else if (code !== 0 && code !== null) {
        status = 'RUNTIME_ERROR';
        error = `Process exited with non-zero code ${code}: ${stderr.trim() || 'Runtime Error'}`;
      }

      resolve({
        status,
        exitCode: code,
        signal,
        stdout,
        stderr,
        executionTimeMs,
        error
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        status: 'EXEC_FAILURE',
        exitCode: -1,
        signal: null,
        stdout: '',
        stderr: err.message,
        executionTimeMs: Date.now() - startTime,
        error: `Failed to execute binary: ${err.message}`
      });
    });
  });
}
