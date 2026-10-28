/**
 * C++ Compiler Module
 * Compiles C++ source in an isolated temporary directory using clang++ or g++.
 * Captures line-by-line compiler warnings, notes, and errors.
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

let cachedCompiler = null;

export async function detectCompiler() {
  if (cachedCompiler) return cachedCompiler;

  const candidates = [
    process.env.CXX_COMPILER,
    'clang++',
    'g++',
    '/usr/bin/clang++',
    '/usr/bin/g++'
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      const version = await getCompilerVersion(candidate);
      if (version) {
        cachedCompiler = {
          command: candidate,
          version: version.trim().split('\n')[0]
        };
        return cachedCompiler;
      }
    } catch {
      // continue searching
    }
  }

  // Fallback if probe fails
  cachedCompiler = { command: 'clang++', version: 'Apple clang / g++' };
  return cachedCompiler;
}

function getCompilerVersion(cmd) {
  return new Promise((resolve) => {
    const child = spawn(cmd, ['--version']);
    let output = '';
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('close', (code) => {
      if (code === 0 && output) resolve(output);
      else resolve(null);
    });
    child.on('error', () => resolve(null));
  });
}

/**
 * Compiles source code to binary in an isolated temporary folder
 * @param {string} sourceCode 
 * @returns {Promise<Object>}
 */
export async function compileCpp(sourceCode) {
  const compilerInfo = await detectCompiler();
  const startTime = Date.now();

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cpp_build_'));
  const sourcePath = path.join(tempDir, 'source.cpp');
  const binaryPath = path.join(tempDir, 'binary.out');

  await fs.writeFile(sourcePath, sourceCode, 'utf8');

  const args = [
    '-std=c++17',
    '-O2',
    '-Wall',
    '-Wextra',
    '-Wpedantic',
    '-o',
    binaryPath,
    sourcePath
  ];

  return new Promise((resolve) => {
    const child = spawn(compilerInfo.command, args);
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {}
      resolve({
        success: false,
        binaryPath: null,
        tempDir,
        diagnostics: [{
          line: 0,
          column: 0,
          severity: 'error',
          message: 'Compilation timed out after 10 seconds.'
        }],
        rawOutput: 'Compilation timed out.',
        durationMs: Date.now() - startTime
      });
    }, 10000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      const durationMs = Date.now() - startTime;
      const combinedOutput = (stderr + '\n' + stdout).trim();
      const diagnostics = parseCompilerDiagnostics(combinedOutput);

      const success = code === 0;

      resolve({
        success,
        exitCode: code,
        binaryPath: success ? binaryPath : null,
        tempDir,
        diagnostics,
        rawOutput: combinedOutput,
        durationMs,
        compiler: compilerInfo
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        exitCode: -1,
        binaryPath: null,
        tempDir,
        diagnostics: [{
          line: 0,
          column: 0,
          severity: 'error',
          message: `Compiler invocation error: ${err.message}`
        }],
        rawOutput: err.message,
        durationMs: Date.now() - startTime,
        compiler: compilerInfo
      });
    });
  });
}

/**
 * Parses compiler output into structured line diagnostics
 */
export function parseCompilerDiagnostics(rawText) {
  const diagnostics = [];
  if (!rawText) return diagnostics;

  const lines = rawText.split('\n');
  const diagRegex = /(?:.*?[\\/])?source\.cpp:(\d+):(\d+):\s*(warning|error|fatal error|note):\s*(.*)/i;

  for (const line of lines) {
    const match = line.match(diagRegex);
    if (match) {
      const lineNum = parseInt(match[1], 10);
      const colNum = parseInt(match[2], 10);
      let severity = match[3].toLowerCase();
      if (severity === 'fatal error') severity = 'error';
      const message = match[4].trim();

      diagnostics.push({
        line: lineNum,
        column: colNum,
        severity,
        message,
        raw: line.trim()
      });
    }
  }

  return diagnostics;
}

/**
 * Cleanup temporary directory
 */
export async function cleanupTempDir(tempDir) {
  if (!tempDir) return;
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}
