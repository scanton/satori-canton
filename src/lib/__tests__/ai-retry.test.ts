// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "@/lib/ai-retry";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("withRetry", () => {
  it("returns result immediately on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on 503 overload error and succeeds on second attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 Service Unavailable"))
      .mockResolvedValue("ok");

    const promise = withRetry(fn, { maxAttempts: 2, baseDelayMs: 10 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on 429 rate limit and succeeds on second attempt", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValue("ok");

    const promise = withRetry(fn, { maxAttempts: 2, baseDelayMs: 10 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on timeout error", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Request timed out"))
      .mockResolvedValue("ok");

    const promise = withRetry(fn, { maxAttempts: 2, baseDelayMs: 10 });
    await vi.runAllTimersAsync();
    await promise;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws after maxAttempts exhausted", async () => {
    const err = new Error("503 overload");
    const fn = vi.fn().mockRejectedValue(err);

    // Attach rejection handler BEFORE advancing timers to avoid unhandled rejection warning
    const assertion = expect(
      withRetry(fn, { maxAttempts: 2, baseDelayMs: 10 })
    ).rejects.toThrow("503 overload");
    await vi.runAllTimersAsync();
    await assertion;

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 401 auth error", async () => {
    const err = new Error("401 Unauthorized");
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxAttempts: 2 })).rejects.toThrow("401");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry on SyntaxError", async () => {
    const err = new SyntaxError("Unexpected token");
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxAttempts: 2 })).rejects.toThrow(SyntaxError);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does NOT retry on api key error", async () => {
    const err = new Error("Invalid api key provided");
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxAttempts: 2 })).rejects.toThrow("Invalid api key provided");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("respects maxAttempts=1 (no retry)", async () => {
    const err = new Error("503 overload");
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxAttempts: 1 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
