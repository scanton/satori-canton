import { Resend } from "resend";
import type { LeadInfo, JobFitResult } from "@/lib/types";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Lazy init — avoids throw at module load time when key is absent
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendLeadNotification(
  leadInfo: LeadInfo,
  jobDescription: string,
  jobFitResult: JobFitResult
): Promise<void> {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[email] NOTIFICATION_EMAIL not set — skipping lead notification");
    return;
  }

  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping lead notification");
    return;
  }

  const subject = `New Interview Request: ${leadInfo.name}${leadInfo.company ? ` (${leadInfo.company})` : ""} — ${jobFitResult.grade} Fit (${jobFitResult.score}/100)`;

  const html = `
<h2>New Virtual Interview Request</h2>

<table style="border-collapse: collapse; margin-bottom: 16px;">
  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Name</td><td>${leadInfo.name}</td></tr>
  <tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Email</td><td><a href="mailto:${leadInfo.email}">${leadInfo.email}</a></td></tr>
  ${leadInfo.company ? `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold;">Company/Role</td><td>${leadInfo.company}</td></tr>` : ""}
</table>

<h3>Job Fit Results</h3>
<p><strong>Score:</strong> ${jobFitResult.score}/100 — Grade ${jobFitResult.grade} — ${jobFitResult.headline}</p>
<p><strong>Role Alignment:</strong> ${jobFitResult.roleAlignment}</p>

<h3>Job Description Submitted</h3>
<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; white-space: pre-wrap; font-family: monospace; font-size: 13px;">${jobDescription.slice(0, 2000)}${jobDescription.length > 2000 ? "\n\n[truncated...]" : ""}</pre>
`;

  await resend.emails.send({
    from: "Satori Canton Site <noreply@satoricanton.com>",
    to,
    subject,
    html,
  });
}

export async function sendInterviewLog(
  leadInfo: LeadInfo,
  jobDescription: string,
  jobFitResult: JobFitResult,
  messages: ChatMessage[]
): Promise<void> {
  const to = process.env.NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("[email] NOTIFICATION_EMAIL not set — skipping interview log");
    return;
  }

  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping interview log");
    return;
  }

  const subject = `Interview Log: ${leadInfo.name}${leadInfo.company ? ` (${leadInfo.company})` : ""} — ${messages.length} messages · ${jobFitResult.grade} (${jobFitResult.score}/100)`;

  const transcript = messages
    .map((m) => {
      const label = m.role === "user" ? leadInfo.name : "Satori (AI)";
      const color = m.role === "user" ? "#6366f1" : "#555";
      return `<div style="margin-bottom:14px">
  <div style="font-weight:bold;color:${color};margin-bottom:4px">${label}</div>
  <div style="white-space:pre-wrap;line-height:1.5">${m.content}</div>
</div>`;
    })
    .join('<hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0" />');

  const html = `
<h2 style="margin-bottom:4px">Interview Transcript</h2>
<table style="border-collapse:collapse;margin-bottom:20px;font-size:14px">
  <tr><td style="padding:3px 16px 3px 0;font-weight:bold">Name</td><td>${leadInfo.name}</td></tr>
  <tr><td style="padding:3px 16px 3px 0;font-weight:bold">Email</td><td><a href="mailto:${leadInfo.email}">${leadInfo.email}</a></td></tr>
  ${leadInfo.company ? `<tr><td style="padding:3px 16px 3px 0;font-weight:bold">Company / Role</td><td>${leadInfo.company}</td></tr>` : ""}
  <tr><td style="padding:3px 16px 3px 0;font-weight:bold">Fit Score</td><td>${jobFitResult.score}/100 — Grade ${jobFitResult.grade} — ${jobFitResult.headline}</td></tr>
  <tr><td style="padding:3px 16px 3px 0;font-weight:bold">Messages</td><td>${messages.length}</td></tr>
</table>

<h3>Conversation</h3>
${transcript}

<hr style="border:none;border-top:1px solid #e5e5e5;margin:20px 0" />
<h3 style="margin-bottom:6px">Job Description</h3>
<pre style="background:#f5f5f5;padding:12px;border-radius:4px;white-space:pre-wrap;font-family:monospace;font-size:12px">${jobDescription.slice(0, 3000)}${jobDescription.length > 3000 ? "\n\n[truncated…]" : ""}</pre>
`;

  await resend.emails.send({
    from: "Satori Canton Site <noreply@satoricanton.com>",
    to,
    subject,
    html,
  });
}
