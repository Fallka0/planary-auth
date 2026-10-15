import type { Env } from "../env";

export function mailConfigured(env: Env) {
  return Boolean(env.RESEND_API_KEY);
}

function template(heading: string, body: string, action: string, url: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f0fa;padding:32px 16px;font-family:-apple-system,Segoe UI,sans-serif;color:#17102e">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px;border:1px solid #e4def3" cellspacing="0" cellpadding="0"><tr><td>
<p style="margin:0 0 20px;font-weight:800;font-size:18px;letter-spacing:.02em;color:#6d28d9">PLANARY</p>
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">${heading}</h1>
<p style="margin:0 0 24px;font-size:15px;line-height:1.55;color:rgba(23,16,46,.74)">${body}</p>
<a href="${url}" style="display:inline-block;background:#6d28d9;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:14px 5px 14px 5px">${action}</a>
<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:rgba(23,16,46,.6)">If the button doesn't work, open this link:<br><span style="word-break:break-all">${url}</span></p>
</td></tr></table>
<p style="margin:16px 0 0;font-size:12px;color:rgba(23,16,46,.55)">You get this because someone used this address on auth.planary.ch. If that wasn't you, ignore this mail.</p>
</td></tr></table></body></html>`;
}

async function send(env: Env, to: string, subject: string, html: string, text: string) {
  if (!env.RESEND_API_KEY) {
    // Local development without mail: print the message so the link can be opened by hand.
    console.log(`[mail disabled] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to, subject, html, text }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
}

export function sendVerifyMail(env: Env, to: string, name: string, url: string) {
  return send(
    env,
    to,
    "Confirm your Planary account",
    template(`Welcome, ${escape(name)}`, "Confirm your email address to finish setting up your Planary account.", "Confirm email", url),
    `Welcome to Planary, ${name}.\n\nConfirm your email address: ${url}\n\nThe link is valid for 24 hours.`,
  );
}

/** `valid` says how long the link works, e.g. "one hour" (asked for by the player) or "24 hours" (made by staff). */
export function sendResetMail(env: Env, to: string, url: string, valid = "one hour") {
  return send(
    env,
    to,
    "Reset your Planary password",
    template("Set a new password", `Someone asked to reset the password for this Planary account. The link is valid for ${valid}.`, "Choose a new password", url),
    `Reset your Planary password: ${url}

The link is valid for ${valid}. If you didn't ask for this, ignore this mail.`,
  );
}

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
