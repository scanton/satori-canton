// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock all external deps before importing the route
vi.mock("@/lib/ai-client", () => ({
  MODEL_FALLBACK_LIST: ["model-primary", "model-secondary"],
  getOpenRouterModel: vi.fn((id: string) => ({ id })),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

vi.mock("@/lib/content", () => ({
  buildProfileContext: vi.fn().mockResolvedValue("profile context"),
}));

vi.mock("@/lib/prompts", () => ({
  buildJobFitSystemPrompt: vi.fn().mockReturnValue("system prompt"),
}));

vi.mock("@/lib/email", () => ({
  sendJDNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/utils", () => ({
  extractJSON: vi.fn((text: string) => text),
  scoreToGrade: vi.fn((score: number) => (score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F")),
}));

vi.mock("@/lib/ai-retry", () => ({
  withRetry: vi.fn((fn: () => unknown) => fn()),
}));

vi.mock("@/lib/ai-validate", () => ({
  isValidJobFitResult: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/analysis-cache", () => ({
  getCachedAnalysisByJD: vi.fn().mockResolvedValue(null),
  writeCachedAnalysis: vi.fn().mockResolvedValue("share-id-123"),
}));

import { POST } from "@/app/api/job-fit/route";
import { generateText } from "ai";
import { isValidJobFitResult } from "@/lib/ai-validate";
import { getCachedAnalysisByJD, writeCachedAnalysis } from "@/lib/analysis-cache";

const validResult = {
  score: 78,
  grade: "B" as const,
  headline: "Strong technical fit with a leadership gap",
  roleAlignment: "Good alignment.",
  recommendation: "This recommendation is long enough to be valid.",
  strengths: [{ claim: "Deep AI expertise", evidence: "...", heroStoryIds: [] }],
  weaknesses: [],
  relevantStoryIds: [],
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/job-fit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.mocked(generateText).mockResolvedValue({ text: JSON.stringify(validResult) } as any);
  vi.mocked(isValidJobFitResult).mockReturnValue(true);
  vi.mocked(getCachedAnalysisByJD).mockResolvedValue(null);
  vi.mocked(writeCachedAnalysis).mockResolvedValue("share-id-123");
});

describe("POST /api/job-fit", () => {
  it("returns 400 when jobDescription is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("jobDescription is required");
  });

  it("returns 400 when jobDescription is too long", async () => {
    const res = await POST(makeRequest({ jobDescription: "x".repeat(8001) }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("too long");
  });

  it("returns 200 with result and id on valid input", async () => {
    const res = await POST(makeRequest({ jobDescription: "Senior AI Engineer at Acme Corp" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.score).toBe(78);
    expect(data.id).toBe("share-id-123");
    expect(data.cached).toBe(false);
  });

  it("returns cached result when cache hit", async () => {
    vi.mocked(getCachedAnalysisByJD).mockResolvedValue({
      id: "cached-id",
      result: validResult,
      roleHint: "Senior AI Engineer",
      createdAt: "2026-04-14T00:00:00Z",
    });

    const res = await POST(makeRequest({ jobDescription: "Senior AI Engineer at Acme Corp" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("cached-id");
    expect(data.cached).toBe(true);
  });

  it("returns id: null when KV write fails", async () => {
    vi.mocked(writeCachedAnalysis).mockResolvedValue(null);

    const res = await POST(makeRequest({ jobDescription: "Senior AI Engineer" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBeNull();
  });

  it("tries next model when validation fails for primary", async () => {
    vi.mocked(isValidJobFitResult)
      .mockReturnValueOnce(false)   // primary fails validation
      .mockReturnValue(true);       // secondary passes

    const res = await POST(makeRequest({ jobDescription: "Head of AI role" }));
    expect(res.status).toBe(200);
  });

  it("returns 500 when all models fail", async () => {
    vi.mocked(generateText).mockRejectedValue(new Error("503 Service Unavailable"));
    vi.mocked(isValidJobFitResult).mockReturnValue(false);

    const res = await POST(makeRequest({ jobDescription: "Head of AI role" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });

  it("returns rate limit error message for 429", async () => {
    vi.mocked(generateText).mockRejectedValue(new Error("429 Too Many Requests"));

    const res = await POST(makeRequest({ jobDescription: "Some role" }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("rate-limited");
  });
});
