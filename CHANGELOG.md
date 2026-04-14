# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0.0] - 2026-04-14

### Added
- **Shareable analysis links** — after a job fit analysis completes, a Share button appears that copies a URL to the clipboard. `/analysis/[id]` is a fully rendered SSR page showing the score, grade, strengths, weaknesses, and relevant case studies. Links expire after 7 days.
- **Result caching with Vercel KV** — job fit results are cached by SHA-256 hash of the job description. Repeat analyses with the same JD return in milliseconds from cache rather than calling the model again.
- **LLM retry + model fallback** — `withRetry()` adds exponential backoff with jitter for transient 429/503/timeout errors. The job-fit route cycles through a 3-model fallback list (`openrouter/auto` → `llama-3.1-8b:free` → `gemma-3-12b:free`) if a model is exhausted or returns garbage.
- **Output validation** — `isValidJobFitResult()` checks field presence, grade enum, score range, and minimum lengths before accepting any model response. Invalid responses trigger fallback to the next model.
- **Health endpoint** — `GET /api/health` returns model status and latency. Cached in-memory for 60 seconds to avoid quota drain from polling.
- **Timing-aware analyzing state** — the "Analyzing..." screen shows "Free-tier model is warming up" after 5 seconds and "Trying a backup model — almost done." after 15 seconds, preventing "did it freeze?" confusion.

### Changed
- Job description analysis uses a 3-model outer loop with per-model `AbortSignal.timeout(15s)` and `maxDuration` raised to 120 seconds.
- `scoreToGrade()` is now applied after score clamping, guaranteeing grade/score consistency regardless of model output.
- Stories fetch in the job-fit page is now independent from the analysis fetch — a story API failure no longer causes the entire analysis flow to fail.
- `leadInfo` fields are sanitized (truncated + stripped of newlines) before prompt interpolation.
- Chat route now enforces a 50-message / 4,000-char-per-message limit to prevent context stuffing.
- Health endpoint sanitizes error messages before returning them to avoid leaking provider internals.

### Fixed
- **Health endpoint HTTP status** — `GET /api/health` now returns HTTP 503 (not 200) when the model probe fails. Monitoring tools, load balancers, and uptime checkers now get the correct signal.
- **Analyzing state cancel button** — added a Cancel button to the analyzing screen so users are never trapped waiting if the analysis stalls.
- **Chat route job description length guard** — the `/api/chat` route now enforces the same 8,000-character limit as `/api/job-fit`, closing a context-stuffing bypass path.
- **Interview log caps** — the `/api/chat/log` endpoint now enforces the same 50-message / 4,000-char-per-message caps as the chat route, preventing oversized email payloads.

### For contributors
- **Vitest test suite** — 71 tests across 9 test files covering all new code paths: retry logic, validation, error messages, API routes, UI state machine, and the share page.
