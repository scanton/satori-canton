import { sendInterviewLog } from "@/lib/email";
import type { LeadInfo, JobFitResult } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, leadInfo, jobFitResult, jobDescription } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      leadInfo: LeadInfo;
      jobFitResult: JobFitResult;
      jobDescription: string;
    };

    if (!messages?.length || !leadInfo || !jobFitResult) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Same caps as the chat route — prevents oversized email payloads / Resend abuse
    const MAX_MESSAGES = 50;
    const MAX_MESSAGE_CHARS = 4_000;
    if (messages.length > MAX_MESSAGES) {
      return Response.json({ error: "Too many messages." }, { status: 400 });
    }
    if (messages.some((m: { role: string; content: string }) => m.content.length > MAX_MESSAGE_CHARS)) {
      return Response.json({ error: "Message content too long." }, { status: 400 });
    }

    await sendInterviewLog(leadInfo, jobDescription ?? "", jobFitResult, messages);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[chat/log] Error:", error);
    return Response.json({ error: "Failed to send interview log" }, { status: 500 });
  }
}
