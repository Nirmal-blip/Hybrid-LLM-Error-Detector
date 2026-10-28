# Hybrid LLM Error Detector

**Hybrid LLM Error Detector** is an advanced developer tool designed to detect subtle logical errors, boundary bugs, integer overflows, and memory violations in C++ programs.

It combines **Groq LLM reasoning** (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) with empirical engineering validation:
- **Static code analysis** (heuristic pattern matching, operator precedence checks, infinite loop analysis)
- **Isolated C++ compilation** via `clang++` or `g++` (`-std=c++17 -O2 -Wall -Wextra -Wpedantic`)
- **Sandboxed execution** with strict CPU timeouts, memory limits, and signal traps (`SIGSEGV`, `SIGFPE`, `SIGABRT`)
- **Test-case validation** (stdin stream piping vs expected stdout matching with float delta tolerance)
- **Evidence-based bug reconciliation** (classifying findings as `VERIFIED`, `SUSPECTED`, `UNVERIFIED`, or `INCONCLUSIVE`)

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│  - Monaco Editor with C++ syntax highlighting          │
│  - Custom Test Case Suite Manager                      │
│  - Real Multi-Step Pipeline Feedback                   │
│  - Structured Findings & Line-by-Line Code Diff View   │
│  - Analysis History & System Diagnostics               │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (JSON)
┌───────────────────────────▼────────────────────────────┐
│              Backend (Node.js + Express ES Modules)    │
├────────────────────────────────────────────────────────┤
│ 1. Request Validator (Input sanitization & checks)     │
│ 2. Static Analyzer (Logical bug heuristics)            │
│ 3. C++ Compiler (clang++ / g++ in isolated /tmp)       │
│ 4. Execution Sandbox (Subprocess with 2000ms timeout)  │
│ 5. Test Runner (Stream comparator & verdict assigner)  │
│ 6. Groq Analyzer (llama-3.3-70b structured JSON)       │
│ 7. Reconciliation Engine (Evidence cross-referencing)  │
│ 8. Report Generator (Diff computation & statistics)    │
│ 9. History Store (In-memory cache with persistence)    │
└────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Dark-First Developer Dashboard**:
   - Sleek charcoal/slate interface with monospaced code typography (`Fira Code`).
   - Integrated Monaco Editor with syntax highlighting, line numbers, and minimap.
   - Built-in Benchmark Presets: Binary Search Overflow, Two Sum Hash Collision, Kadane's Negative Subarray Bug.

2. **Real Multi-Step Progress**:
   - Meaningful state transitions: Validating → Compiling → Executing → LLM Analysis → Evidence Reconciliation → Report Generation.

3. **Evidence-Based Bug Classification**:
   - `VERIFIED`: Confirmed by execution failure (Wrong Answer, Segfault, Timeout) or direct compiler diagnostic.
   - `SUSPECTED`: Flagged by LLM + corroborating static check, but existing tests passed.
   - `UNVERIFIED`: Proposed by LLM without corroborating empirical evidence.
   - `INCONCLUSIVE`: When code fails to compile or crashes before logic can be evaluated.

4. **Code Comparison (Diff)**:
   - Line-by-line diff comparing original user code and AI-suggested corrections.
   - One-click "Load Fix into Editor" to immediately re-test the solution.

---

## Getting Started

### Prerequisites
- **Node.js** v18+ (Node v22 recommended)
- **C++ Compiler**: `clang++` or `g++` (available on macOS via `xcode-select --install` or Linux via `apt install build-essential`)
- (Optional) **Groq API Key**: Get a free key at [console.groq.com/keys](https://console.groq.com/keys). If omitted, the tool automatically operates in offline heuristic mode using compiler diagnostics and static checks.

### 1. Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env

# (Optional) Add your Groq API Key to backend/.env
# GROQ_API_KEY=gsk_your_key_here
# GROQ_MODEL=llama-3.3-70b-versatile

# Run test suite
npm test

# Start backend server
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite development server
npm run dev
# Open http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyze` | Run full hybrid analysis pipeline on C++ source code & test cases |
| `GET` | `/api/analyze/:id` | Fetch specific analysis report by ID |
| `GET` | `/api/history` | Retrieve past analysis sessions and dashboard metrics |
| `DELETE` | `/api/history/:id` | Delete specific history item |
| `DELETE` | `/api/history` | Clear all history |
| `GET` | `/api/presets` | Get ready-to-test benchmark C++ problems |
| `GET` | `/api/health` | System health check (compiler status, Groq config, sandbox limits) |

---

## Safety & Sandboxing

- User C++ code is compiled into isolated temporary directories.
- Subprocesses execute with an enforced `EXECUTION_TIMEOUT_MS` (default 2000ms).
- Output stream buffer ceiling (256KB) prevents memory exhaustion from runaway printing loops.
- Signals such as `SIGSEGV` (segmentation fault), `SIGFPE` (division by zero), and `SIGABRT` are intercepted and cleanly reported to the developer.
