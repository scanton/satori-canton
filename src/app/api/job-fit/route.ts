import { generateText } from "ai";
import { getOpenRouterModel, MODEL_FALLBACK_LIST } from "@/lib/ai-client";
import { buildProfileContext } from "@/lib/content";
import { buildJobFitSystemPrompt } from "@/lib/prompts";
import { sendJDNotification } from "@/lib/email";
import { extractJSON, scoreToGrade } from "@/lib/utils";
import { withRetry } from "@/lib/ai-retry";
import { isValidJobFitResult } from "@/lib/ai-validate";
import { toUserMessage } from "@/lib/ai-errors";
import { getCachedAnalysisByJD, writeCachedAnalysis } from "@/lib/analysis-cache";
import type { JobFitResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_JD_LENGTH = 8000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobDescription } = body as { jobDescription: string };

    if (!jobDescription || typeof jobDescription !== "string") {
      return Response.json(
        { error: "jobDescription is required" },
        { status: 400 }
      );
    }

    if (jobDescription.length > MAX_JD_LENGTH) {
      return Response.json(
        {
          error: `Job description is too long. Please keep it under ${MAX_JD_LENGTH} characters.`,
        },
        { status: 400 }
      );
    }

    // Fire-and-forget — never delays the analysis response
    sendJDNotification(jobDescription).catch((err) =>
      console.error("[job-fit] JD notification failed:", err)
    );

    // Cache hit: return immediately if this exact JD was already analyzed
    const cached = await getCachedAnalysisByJD(jobDescription);
    if (cached) {
      console.log(`[job-fit] Cache hit: analysis:${cached.id}`);
      return Response.json({ ...cached.result, id: cached.id, cached: true });
    }

    const groundTruth = await buildProfileContext();
    const systemPrompt = buildJobFitSystemPrompt(groundTruth);

    let result: JobFitResult | null = null;
    let lastError: unknown;

    // Outer loop: try each model in fallback order
    for (const modelId of MODEL_FALLBACK_LIST) {
      console.log(`[job-fit] Cache miss, trying model: ${modelId}`);
      try {
        // AbortSignal.timeout inside closure = fresh 25s per attempt
        // 2 models × 2 attempts × 25s = 100s worst case, within maxDuration: 120s
        const { text } = await withRetry(
          () =>
            generateText({
              model: getOpenRouterModel(modelId),
              abortSignal: AbortSignal.timeout(25000),
              maxRetries: 0, // disable AI SDK internal retries; withRetry() controls all retry logic
              system: systemPrompt,
              prompt: `Please analyze the fit for the following job description:\n\n${jobDescription}`,
            }),
          { maxAttempts: 2, baseDelayMs: 300 }
        );

        const cleaned = extractJSON(text);
        const parsed = JSON.parse(cleaned);

        if (!isValidJobFitResult(parsed)) {
          console.warn(`[job-fit] Validation failed for model ${modelId}`);
          lastError = new Error(`Invalid response shape from model ${modelId}`);
          continue; // try next model
        }

        parsed.score = Math.min(100, Math.max(0, parsed.score));
        // Re-derive grade from clamped score — prevents model inconsistency (score:95, grade:"F")
        parsed.grade = scoreToGrade(parsed.score);
        result = parsed;
        break;
      } catch (err) {
        lastError = err;
        const isLast = modelId === MODEL_FALLBACK_LIST.at(-1);
        console.warn(
          `[job-fit] Model ${modelId} exhausted${isLast ? " (all models exhausted)" : ", trying next"}:`,
          err instanceof Error ? err.message : err
        );
        if (isLast) throw err;
      }
    }

    if (!result) {
      console.error("[job-fit] All models exhausted");
      throw lastError ?? new Error("All models exhausted");
    }

    // Write to cache — only return id if write was confirmed (prevents dead share links)
    const shareId = await writeCachedAnalysis(jobDescription, result);

    return Response.json({ ...result, id: shareId, cached: false });
  } catch (error) {
    console.error("[job-fit] Error:", error);
    return Response.json(
      { error: toUserMessage(error, "Analysis") },
      { status: 500 }
    );
  }
}
