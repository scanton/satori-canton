import { streamText } from "ai";
import { getAIModel } from "@/lib/ai-client";
import { buildProfileContext } from "@/lib/content";
import { buildInterviewSystemPrompt } from "@/lib/prompts";
import { sendLeadNotification } from "@/lib/email";
import type { JobFitResult, LeadInfo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      jobDescription,
      jobFitResult,
      leadInfo,
      isFirstMessage,
    } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      jobDescription: string;
      jobFitResult: JobFitResult;
      leadInfo: LeadInfo;
      isFirstMessage?: boolean;
    };

    if (!messages || !jobDescription || !jobFitResult || !leadInfo) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Send lead notification email on first message only
    if (isFirstMessage) {
      sendLeadNotification(leadInfo, jobDescription, jobFitResult).catch(
        (err) => console.error("[chat] Lead notification failed:", err)
      );
    }

    const groundTruth = await buildProfileContext();
    const systemPrompt = buildInterviewSystemPrompt(
      groundTruth,
      jobDescription,
      jobFitResult,
      leadInfo
    );

    const result = await streamText({
      model: getAIModel(),
      system: systemPrompt,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[chat] Error:", error);
    return Response.json({ error: toUserMessage(error) }, { status: 500 });
  }
}

function toUserMessage(error: unknown): string {
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
    return "The chat service is temporarily unavailable. Please try again later.";
  }
  return "The AI service had a hiccup. Please try again.";
}
