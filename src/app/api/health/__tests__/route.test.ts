// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/ai-client", () => ({
  getAIModel: vi.fn(() => ({ id: "test-model" })),
  MODEL_FALLBACK_LIST: ["openrouter/auto"],
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "ai";

beforeEach(() => {
  vi.mocked(generateText).mockResolvedValue({ text: "ok" } as any);
  // Reset module to clear in-memory cache between tests
  vi.resetModules();
});

describe("GET /api/health", () => {
  it("returns status: ok when model responds", async () => {
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(typeof data.latency_ms).toBe("number");
    expect(data.model).toBe("openrouter/auto");
  });

  it("returns status: degraded when model fails", async () => {
    vi.mocked(generateText).mockRejectedValue(new Error("503 overload"));
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.status).toBe("degraded");
    expect(data.error).toBeTruthy();
  });
});
