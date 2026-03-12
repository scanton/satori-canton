import { generateText } from "ai";
import { getAIModel } from "@/lib/ai-client";
import { buildProfileContext } from "@/lib/content";
import { buildJobFitSystemPrompt } from "@/lib/prompts";
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
    const message =
      error instanceof SyntaxError
        ? "The AI returned an unexpected response format. Please try again."
        : "Job fit analysis failed. Please try again.";
    return Response.json({ error: message }, { status: 500 });
  }
}
