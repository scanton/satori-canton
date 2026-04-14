import { streamText } from "ai";
import { getAIModel } from "@/lib/ai-client";
import { buildProfileContext } from "@/lib/content";
import { buildInterviewSystemPrompt } from "@/lib/prompts";
import { sendLeadNotification } from "@/lib/email";
import { withRetry } from "@/lib/ai-retry";
import { toUserMessage } from "@/lib/ai-errors";
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
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Guard against context-stuffing: cap messages array and per-message length
    const MAX_MESSAGES = 50;
    const MAX_MESSAGE_CHARS = 4_000;
    if (messages.length > MAX_MESSAGES) {
      return Response.json(
        { error: "Too many messages in conversation." },
        { status: 400 }
      );
    }
    const oversized = messages.some((m) => m.content.length > MAX_MESSAGE_CHARS);
    if (oversized) {
      return Response.json(
        { error: "Message content too long." },
        { status: 400 }
      );
    }

    // Send lead notification email on first message only (fire-and-forget)
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

    // withRetry wraps streamText — retry completes before stream consumption begins.
    // Model switching mid-stream is impractical, so retry applies to same model only.
    const result = await withRetry(
      () =>
        streamText({
          model: getAIModel(),
          system: systemPrompt,
          messages,
        }),
      { maxAttempts: 2, baseDelayMs: 300 }
    );

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("[chat] Error:", error);
    return Response.json(
      { error: toUserMessage(error, "The chat service") },
      { status: 500 }
    );
  }
}
