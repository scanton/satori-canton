// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/email", () => ({
  sendInterviewLog: vi.fn(),
}));

import { sendInterviewLog } from "@/lib/email";

const validBody = {
  messages: [
    { role: "user" as const, content: "Tell me about your experience." },
    { role: "assistant" as const, content: "I have 10 years of experience." },
  ],
  leadInfo: { name: "Alice", email: "alice@example.com", company: "Acme" },
  jobFitResult: {
    score: 80,
    grade: "B" as const,
    headline: "Strong fit",
    roleAlignment: "Good.",
    recommendation: "Recommend for interview.",
    strengths: [],
    weaknesses: [],
    relevantStoryIds: [],
  },
  jobDescription: "Senior Engineer role...",
};

beforeEach(() => {
  vi.mocked(sendInterviewLog).mockResolvedValue(undefined);
  vi.resetModules();
});

describe("POST /api/chat/log", () => {
  it("returns 200 ok on valid input", async () => {
    const { POST } = await import("@/app/api/chat/log/route");
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(sendInterviewLog).toHaveBeenCalledOnce();
  });

  it("returns 400 when messages is missing", async () => {
    const { POST } = await import("@/app/api/chat/log/route");
    const body = { ...validBody, messages: [] };
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when leadInfo is missing", async () => {
    const { POST } = await import("@/app/api/chat/log/route");
    const { leadInfo: _, ...body } = validBody;
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when message count exceeds 50", async () => {
    const { POST } = await import("@/app/api/chat/log/route");
    const messages = Array.from({ length: 51 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant" as const,
      content: `Message ${i}`,
    }));
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify({ ...validBody, messages }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/too many/i);
  });

  it("returns 400 when a message exceeds 4000 chars", async () => {
    const { POST } = await import("@/app/api/chat/log/route");
    const messages = [
      { role: "user" as const, content: "x".repeat(4001) },
    ];
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify({ ...validBody, messages }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/too long/i);
  });

  it("returns 500 when sendInterviewLog throws", async () => {
    vi.mocked(sendInterviewLog).mockRejectedValue(new Error("SMTP failure"));
    const { POST } = await import("@/app/api/chat/log/route");
    const req = new Request("http://localhost/api/chat/log", {
      method: "POST",
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
