// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/ai-client", () => ({
  getAIModel: vi.fn(() => ({ id: "test-model" })),
}));

vi.mock("ai", () => ({
  streamText: vi.fn(),
}));

vi.mock("@/lib/content", () => ({
  buildProfileContext: vi.fn().mockResolvedValue("profile context"),
}));

vi.mock("@/lib/prompts", () => ({
  buildInterviewSystemPrompt: vi.fn().mockReturnValue("system prompt"),
}));

vi.mock("@/lib/email", () => ({
  sendLeadNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/ai-retry", () => ({
  withRetry: vi.fn((fn: () => unknown) => fn()),
}));

import { POST } from "@/app/api/chat/route";
import { streamText } from "ai";
import { sendLeadNotification } from "@/lib/email";

const validBody = {
  messages: [{ role: "user", content: "Hello" }],
  jobDescription: "Senior AI Engineer",
  jobFitResult: { score: 78, grade: "B", headline: "Good fit", strengths: [], weaknesses: [], relevantStoryIds: [], roleAlignment: "Good", recommendation: "Recommended" },
  leadInfo: { name: "Test User", email: "test@test.com" },
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const mockStream = {
  toDataStreamResponse: vi.fn(() => new Response("stream", { status: 200 })),
};

beforeEach(() => {
  vi.mocked(streamText).mockResolvedValue(mockStream as any);
  vi.mocked(sendLeadNotification).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/chat", () => {
  it("returns 400 when messages is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, messages: undefined }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Missing required fields");
  });

  it("returns 400 when leadInfo is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, leadInfo: undefined }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when jobDescription is missing", async () => {
    const res = await POST(makeRequest({ ...validBody, jobDescription: undefined }));
    expect(res.status).toBe(400);
  });

  it("returns stream response on valid input", async () => {
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(mockStream.toDataStreamResponse).toHaveBeenCalled();
  });

  it("returns 500 with error message when streamText fails", async () => {
    vi.mocked(streamText).mockRejectedValue(new Error("503 overload"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("overloaded");
  });

  it("returns rate limit message on 429", async () => {
    vi.mocked(streamText).mockRejectedValue(new Error("429 rate limit exceeded"));

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toContain("rate-limited");
  });

  it("sends lead notification only on isFirstMessage=true", async () => {
    await POST(makeRequest({ ...validBody, isFirstMessage: true }));
    expect(vi.mocked(sendLeadNotification)).toHaveBeenCalledWith(
      validBody.leadInfo,
      validBody.jobDescription,
      validBody.jobFitResult
    );
  });

  it("does NOT send lead notification when isFirstMessage is absent", async () => {
    await POST(makeRequest(validBody)); // isFirstMessage not set
    expect(vi.mocked(sendLeadNotification)).not.toHaveBeenCalled();
  });
});
