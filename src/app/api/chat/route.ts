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
    return Response.json({ error: "Chat failed. Please try again." }, { status: 500 });
  }
}
