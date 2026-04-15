# Satori Canton

AI-powered career site. Hiring managers paste a job description and get an honest fit analysis — scored A–F with specific strengths and gaps — then follow up with a virtual interview.

Built with Next.js 14 (App Router), deployed on Vercel.

## What it does

- **Job Fit Evaluator** — paste a JD, get a scored analysis (A–F) with strengths, weaknesses, and a frank hiring recommendation
- **Shareable analysis links** — every analysis gets a unique URL (`/analysis/[id]`), server-rendered, expires after 7 days
- **Virtual interview** — chat session where the AI speaks as Satori, grounded in the documented background
- **Open Source** at `/open-source` — project cards for published tools (Phase2S), with npm badge, highlights, and GitHub link
- **Case stories** — detailed project narratives at `/story/[id]`, referenced in each analysis
- **Resume** at `/resume`

## Local dev

```bash
cp .env.example .env.local
# fill in OPENROUTER_API_KEY at minimum
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tests

```bash
pnpm test
```

87 tests covering retry logic, validation, API routes, UI state, and page rendering.

## Key env vars

See `.env.example`. Required: `OPENROUTER_API_KEY`. Optional: Vercel KV vars (enables caching and `/analysis/[id]` share links), Resend vars (enables lead email notifications).

## What shipped

See `CHANGELOG.md` and `VERSION`.

## What's in progress

See `TODOS.md`.
