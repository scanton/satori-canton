import { generateText } from "ai";
import { getAIModel, MODEL_FALLBACK_LIST } from "@/lib/ai-client";

export const runtime = "nodejs";

interface HealthResponse {
  status: "ok" | "degraded";
  latency_ms: number;
  model: string;
  error?: string;
}

// In-memory probe cache — prevents quota drain from rapid polling.
// Resets on cold start (expected behavior for serverless).
let lastProbe: { ts: number; result: HealthResponse } | null = null;
const PROBE_TTL_MS = 60_000;

export async function GET() {
  if (lastProbe && Date.now() - lastProbe.ts < PROBE_TTL_MS) {
    return Response.json(lastProbe.result);
  }

  const model = MODEL_FALLBACK_LIST[0];
  const start = Date.now();

  try {
    await generateText({
      model: getAIModel(),
      prompt: "Say 'ok'.",
      maxTokens: 5,
      // Hard cap — prevents the probe from holding a connection open indefinitely
      abortSignal: AbortSignal.timeout(30_000),
    });

    const result: HealthResponse = {
      status: "ok",
      latency_ms: Date.now() - start,
      model,
    };
    lastProbe = { ts: Date.now(), result };
    return Response.json(result);
  } catch (err) {
    // Sanitize: don't leak raw provider error messages (API keys, internal URLs)
    const isAuth =
      err instanceof Error &&
      /api key|unauthorized|401|403/i.test(err.message);
    const result: HealthResponse = {
      status: "degraded",
      latency_ms: Date.now() - start,
      model,
      error: isAuth ? "Auth error — check OPENROUTER_API_KEY" : "Model probe failed",
    };
    lastProbe = { ts: Date.now(), result };
    return Response.json(result, { status: 503 });
  }
}
