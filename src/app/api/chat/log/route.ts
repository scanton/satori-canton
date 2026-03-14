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

    await sendInterviewLog(leadInfo, jobDescription ?? "", jobFitResult, messages);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[chat/log] Error:", error);
    return Response.json({ error: "Failed to send interview log" }, { status: 500 });
  }
}
