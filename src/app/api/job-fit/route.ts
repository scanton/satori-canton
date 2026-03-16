import { generateText } from "ai";
import { getAIModel } from "@/lib/ai-client";
import { buildProfileContext } from "@/lib/content";
import { buildJobFitSystemPrompt } from "@/lib/prompts";
import { sendJDNotification } from "@/lib/email";
import { extractJSON } from "@/lib/utils";
import type { JobFitResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

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
    sendJDNotification(jobDescription);

    const groundTruth = await buildProfileContext();
    const systemPrompt = buildJobFitSystemPrompt(groundTruth);

    const { text } = await generateText({
      model: getAIModel(),
      system: systemPrompt,
      prompt: `Please analyze the fit for the following job description:\n\n${jobDescription}`,
    });

    // Strip markdown fences if model wraps response
    const cleaned = extractJSON(text);
    const result: JobFitResult = JSON.parse(cleaned);

    // Ensure score is within bounds
    result.score = Math.min(100, Math.max(0, result.score));

    return Response.json(result);
  } catch (error) {
    console.error("[job-fit] Error:", error);
    return Response.json({ error: toUserMessage(error, "Analysis") }, { status: 500 });
  }
}

function toUserMessage(error: unknown, context: string): string {
  if (error instanceof SyntaxError) {
    return "The AI returned an unexpected response format. Please try again.";
  }
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")) {
    return "The AI service is rate-limited right now. Please wait a moment and try again.";
  }
  if (msg.includes("overload") || msg.includes("503") || msg.includes("capacity") || msg.includes("no endpoints")) {
    return "The AI model is temporarily overloaded. Please try again in a few seconds.";
  }
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("deadline")) {
    return "The request timed out. Please try again.";
  }
  if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("401") || msg.includes("403")) {
    return `${context} is temporarily unavailable. Please try again later.`;
  }
  return `${context} failed. Please try again.`;
}
