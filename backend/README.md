# Hybrid LLM Error Detector - Backend

Node.js, Express, and Groq-powered backend with isolated C++ compilation, static analysis, and test case execution.

## Features
- **Isolated C++17 Compilation**: Invokes `clang++` or `g++` inside temporary directories with `-O2 -Wall -Wextra -Wpedantic`.
- **Sandboxed Execution**: Subprocess with strict 2000ms CPU/wall limits, memory caps, and signal handling (`SIGSEGV`, `SIGFPE`, `SIGABRT`).
- **Static Code Analyzer**: AST-like regex heuristics for off-by-one errors, midpoint overflow, operator precedence, and infinite loops.
- **Groq LLM Reasoning**: Structured JSON output via `llama-3.3-70b-versatile` with offline heuristic fallback.
- **Evidence-Based Bug Reconciler**: Cross-checks model assertions against dynamic runtime failures.
- **In-Memory History Cache**: Instant session persistence with statistical aggregation.

## Setup & Running

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your GROQ_API_KEY (optional, fallback active if omitted)

# 3. Run automated tests
npm test

# 4. Start the server
npm start
```
Default port: `http://localhost:5000`
