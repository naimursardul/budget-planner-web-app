/**
 * Transactional email, config-ready.
 *
 * Uses Resend's REST API directly over `fetch` — no SDK dependency to install
 * or keep current. Until RESEND_API_KEY and RESEND_FROM are set the app must
 * say so plainly rather than claim a message was sent; `isMailConfigured()` is
 * what the UI checks to decide which story to tell.
 *
 * Swapping providers means rewriting this file only.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function send({ to, subject, html, text }: SendArgs): Promise<boolean> {
  if (!isMailConfigured()) return false;

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to, subject, html, text }),
    });

    if (!response.ok) {
      // Log server-side only — the caller must not reveal delivery details to
      // the browser, or the form becomes an account-existence oracle.
      console.error("[mailer] Resend rejected the message:", response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[mailer] Could not reach Resend:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<boolean> {
  return send({
    to,
    subject: "Reset your Smart Budget Planner password",
    text: [
      "We received a request to reset your Smart Budget Planner password.",
      "",
      `Reset it here: ${resetUrl}`,
      "",
      "This link expires in 1 hour and can only be used once.",
      "If you didn't ask for this, you can ignore this email — your password stays the same.",
    ].join("\n"),
    html: `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#252329">
        <h1 style="font-size:20px;margin:0 0 16px">Reset your password</h1>
        <p style="margin:0 0 16px;line-height:1.6">
          We received a request to reset your Smart Budget Planner password.
        </p>
        <p style="margin:0 0 24px">
          <a href="${resetUrl}" style="display:inline-block;background:#252329;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">
            Choose a new password
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:14px;color:#6b6772;line-height:1.6">
          This link expires in 1 hour and can only be used once.
        </p>
        <p style="margin:0;font-size:14px;color:#6b6772;line-height:1.6">
          If you didn't ask for this, you can ignore this email — your password stays the same.
        </p>
      </div>
    `,
  });
}
