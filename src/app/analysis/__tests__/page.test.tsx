import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// React.cache() is a Server Components API not available in jsdom — stub it out
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T extends (...args: unknown[]) => unknown>(fn: T): T => fn };
});

vi.mock("@/lib/analysis-cache", () => ({
  getCachedAnalysisById: vi.fn(),
}));

vi.mock("@/lib/content", () => ({
  loadStoryIndex: vi.fn().mockResolvedValue([]),
}));

// Next.js Link and navigation stubs
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/job-fit/ScoreGauge", () => ({
  ScoreGauge: ({ score, grade }: { score: number; grade: string }) => (
    <div data-testid="score-gauge">{score} {grade}</div>
  ),
}));

vi.mock("@/components/job-fit/StrengthsList", () => ({
  StrengthsList: () => <div data-testid="strengths-list" />,
}));

vi.mock("@/components/job-fit/WeaknessesList", () => ({
  WeaknessesList: () => <div data-testid="weaknesses-list" />,
}));

vi.mock("@/components/job-fit/RelevantStories", () => ({
  RelevantStories: () => <div data-testid="relevant-stories" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<object>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

import { getCachedAnalysisById } from "@/lib/analysis-cache";
import AnalysisPage from "@/app/analysis/[id]/page";

const validCached = {
  id: "test1234ab",
  roleHint: "Senior AI Engineer at Acme Corp",
  createdAt: "2026-04-14T00:00:00Z",
  result: {
    score: 78,
    grade: "B" as const,
    headline: "Strong technical fit with a leadership gap",
    roleAlignment: "Good alignment on AI stack.",
    recommendation: "Solid recommendation that is long enough for validation.",
    strengths: [{ claim: "AI expertise", evidence: "...", heroStoryIds: [] }],
    weaknesses: [],
    relevantStoryIds: [],
  },
};

describe("AnalysisPage", () => {
  it("renders score, grade, and headline for valid cached result", async () => {
    vi.mocked(getCachedAnalysisById).mockResolvedValue(validCached);

    const page = await AnalysisPage({ params: { id: "test1234ab" } });
    render(page as React.ReactElement);

    expect(screen.getByText("Job Fit Analysis")).toBeInTheDocument();
    expect(screen.getByText(/78.*B/)).toBeInTheDocument();
    expect(
      screen.getByText("Strong technical fit with a leadership gap")
    ).toBeInTheDocument();
  });

  it("shows roleHint when present", async () => {
    vi.mocked(getCachedAnalysisById).mockResolvedValue(validCached);

    const page = await AnalysisPage({ params: { id: "test1234ab" } });
    render(page as React.ReactElement);

    expect(screen.getByText("Senior AI Engineer at Acme Corp")).toBeInTheDocument();
  });

  it("shows expired state when result not found", async () => {
    vi.mocked(getCachedAnalysisById).mockResolvedValue(null);

    const page = await AnalysisPage({ params: { id: "dead567890" } });
    render(page as React.ReactElement);

    expect(screen.getByText("This analysis has expired")).toBeInTheDocument();
    expect(screen.getByText("Evaluate your own role")).toBeInTheDocument();
  });

  it("shows expired state when KV returns null (network error fallback)", async () => {
    vi.mocked(getCachedAnalysisById).mockResolvedValue(null);

    const page = await AnalysisPage({ params: { id: "anyid12345" } });
    render(page as React.ReactElement);

    expect(screen.getByText("This analysis has expired")).toBeInTheDocument();
  });

  it("renders CTA to run own analysis", async () => {
    vi.mocked(getCachedAnalysisById).mockResolvedValue(validCached);

    const page = await AnalysisPage({ params: { id: "test1234ab" } });
    render(page as React.ReactElement);

    expect(screen.getByText("Run your own analysis")).toBeInTheDocument();
  });
});
