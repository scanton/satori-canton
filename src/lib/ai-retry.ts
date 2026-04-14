import { ERROR_PATTERNS } from "@/lib/ai-errors";

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitter?: boolean;
}

function isRetryable(error: unknown): boolean {
  // Never retry non-transient errors
  if (error instanceof SyntaxError) return false;
  const msg = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();
  if (ERROR_PATTERNS.auth.some((p) => msg.includes(p))) return false;
  return (
    ERROR_PATTERNS.rateLimit.some((p) => msg.includes(p)) ||
    ERROR_PATTERNS.overload.some((p) => msg.includes(p)) ||
    ERROR_PATTERNS.timeout.some((p) => msg.includes(p))
  );
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 2,
    baseDelayMs = 300,
    maxDelayMs = 5000,
    jitter = true,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const isLast = attempt === maxAttempts - 1;
      if (isLast || !isRetryable(err)) {
        throw err;
      }

      const base = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const delay = jitter ? base * (0.5 + Math.random() * 0.5) : base;

      console.warn(
        `[ai-retry] Attempt ${attempt + 1}/${maxAttempts} failed: ${
          err instanceof Error ? err.message : String(err)
        }. Retrying in ${Math.round(delay)}ms`
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
