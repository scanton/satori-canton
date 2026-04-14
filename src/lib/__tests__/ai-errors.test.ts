// @vitest-environment node
import { describe, it, expect } from "vitest";
import { toUserMessage, ERROR_PATTERNS } from "@/lib/ai-errors";

describe("ERROR_PATTERNS", () => {
  it("exports rateLimit patterns", () => {
    expect(ERROR_PATTERNS.rateLimit).toContain("rate limit");
    expect(ERROR_PATTERNS.rateLimit).toContain("429");
  });

  it("exports overload patterns", () => {
    expect(ERROR_PATTERNS.overload).toContain("503");
    expect(ERROR_PATTERNS.overload).toContain("no endpoints");
  });
});

describe("toUserMessage", () => {
  it("returns format error for SyntaxError", () => {
    const msg = toUserMessage(new SyntaxError("Unexpected token"));
    expect(msg).toContain("unexpected response format");
  });

  it("returns rate limit message for 429", () => {
    const msg = toUserMessage(new Error("429 Too Many Requests"));
    expect(msg).toContain("rate-limited");
  });

  it("returns rate limit message for 'rate limit' text", () => {
    const msg = toUserMessage(new Error("OpenRouter rate limit exceeded"));
    expect(msg).toContain("rate-limited");
  });

  it("returns overload message for 503", () => {
    const msg = toUserMessage(new Error("503 Service Unavailable"));
    expect(msg).toContain("overloaded");
  });

  it("returns overload message for 'no endpoints'", () => {
    const msg = toUserMessage(new Error("no endpoints available"));
    expect(msg).toContain("overloaded");
  });

  it("returns timeout message for 'timed out'", () => {
    const msg = toUserMessage(new Error("Request timed out"));
    expect(msg).toContain("timed out");
  });

  it("returns unavailable message for 401", () => {
    const msg = toUserMessage(new Error("401 Unauthorized"), "Analysis");
    expect(msg).toContain("Analysis is temporarily unavailable");
  });

  it("returns unavailable message for 'api key'", () => {
    const msg = toUserMessage(new Error("Invalid api key"), "Chat");
    expect(msg).toContain("Chat is temporarily unavailable");
  });

  it("returns generic fallback for unknown errors", () => {
    const msg = toUserMessage(new Error("Something totally unexpected"));
    expect(msg).toContain("failed");
  });

  it("handles non-Error objects", () => {
    const msg = toUserMessage("some string error");
    expect(typeof msg).toBe("string");
  });

  it("uses default context when none provided", () => {
    const msg = toUserMessage(new Error("401"));
    expect(msg).toContain("The request is temporarily unavailable");
  });
});
