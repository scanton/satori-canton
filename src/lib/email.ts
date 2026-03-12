import { Resend } from "resend";
import type { LeadInfo, JobFitResult } from "@/lib/types";

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
