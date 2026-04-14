// Shared error classification for all AI routes.
// Single source of truth — imported by ai-retry.ts and both API routes.

export const ERROR_PATTERNS = {
  rateLimit: ["rate limit", "429", "too many requests"],
  overload: ["overload", "503", "capacity", "no endpoints"],
  timeout: ["timeout", "timed out", "deadline"],
  auth: ["api key", "unauthorized", "401", "403"],
};

export function toUserMessage(error: unknown, context = "The request"): string {
  if (error instanceof SyntaxError) {
    return "The AI returned an unexpected response format. Please try again.";
  }
  const msg = (
    error instanceof Error ? error.message : String(error)
  ).toLowerCase();
  if (ERROR_PATTERNS.rateLimit.some((p) => msg.includes(p))) {
    return "The AI service is rate-limited right now. Please wait a moment and try again.";
  }
  if (ERROR_PATTERNS.overload.some((p) => msg.includes(p))) {
    return "The AI model is temporarily overloaded. Please try again in a few seconds.";
  }
  if (ERROR_PATTERNS.timeout.some((p) => msg.includes(p))) {
    return "The request timed out. Please try again.";
  }
  if (ERROR_PATTERNS.auth.some((p) => msg.includes(p))) {
    return `${context} is temporarily unavailable. Please try again later.`;
  }
  return `${context} failed. Please try again.`;
}
