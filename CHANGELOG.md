# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1.0] - 2026-04-15

### Added
- **Open Source page** (`/open-source`) — a dedicated section listing Phase2S with project card, npm package badge, highlights, tech badges, GitHub button, and a link to the case story.
- **Open Source nav link** — "Open Source" appears between "Case Stories" and "Services" in the top navigation on both desktop and mobile.
- **Open Source in AI job-fit context** — `buildProfileContext()` now loads open source projects in parallel and includes them in the AI evaluator's verified background section, so the job-fit tool can reference Phase2S as a demonstrated capability.

### Changed
- **Resume** — Phase2S moved out of the work experience timeline and into the new Open Source section. StyleGuideAI added to the resume summary as an AI consultancy.
- **AI model routing** — `ai-client.ts` updated to `openrouter/free` dynamic router (synced from production). The free-tier router selects the best available model at request time.
- **Job-fit timeout** — per-attempt timeout raised from 15s to 45s, `maxDuration` raised from 120s to 300s (Vercel Pro). Allows 2 models × 2 retries × 45s within budget.

### Fixed
- **Invalid HTML nesting** — GitHub button on `/open-source` now uses the shadcn/ui `asChild` pattern so `<Button>` renders as the `<a>` element directly, eliminating the invalid `<button>` inside `<a>` structure.
- **Content load error isolation** — `loadOpenSourceProjects()` now wraps file I/O in try/catch and returns `[]` on error, preventing a missing or malformed `open-source.json` from cascading into `/api/chat` and `/api/job-fit`.
- **Open source input validation** — `loadOpenSourceProjects()` now guards against non-array JSON (`Array.isArray` check returns `[]`), rejects projects with non-https `githubUrl` values to prevent XSS in rendered links, and strips `heroStoryId` values that contain path-traversal characters (only `[a-z0-9-]` accepted).
- **AI prompt safety** — `buildProfileContext()` wraps each open source project in XML structural tags (`<open_source_project id="...">`) so content field values cannot inadvertently break the prompt's markdown section headers. A 2,000-character cap with truncation marker prevents the section from inflating the context window. The section header is omitted entirely when no projects are loaded, preventing a dangling `### Open Source Projects` heading.

### For contributors
- 102 tests across 13 test files. New this release: 13 tests for `content.ts` (`loadOpenSourceProjects` validation chain and `buildProfileContext` prompt safety), 3 additional tests for `/open-source` page (no-npm-badge, multiple cards, empty-list regression), 1 additional test for NavBar active-link state.

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
- **Vitest test suite** — 77 tests across 10 test files covering all new code paths: retry logic, validation, error messages, API routes, UI state machine, share page, and interview log caps.
