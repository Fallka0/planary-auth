import type { Env } from "../env";

export function mailConfigured(env: Env) {
  return Boolean(env.RESEND_API_KEY);
}

// Same look as the auth pages: ink frame, paper surface, Unbounded headline, indigo pill button.
// Mail clients ignore most CSS, so everything is inline and in tables. Clients that load web fonts
// (Apple Mail, iOS) get Unbounded and Manrope; the rest fall back to system fonts.
const DISPLAY = `'Unbounded','Helvetica Neue',Arial,sans-serif`;
const BODY = `'Manrope',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

function template(heading: string, body: string, action: string, url: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&family=Unbounded:wght@300;400&display=swap" rel="stylesheet"></head>
<body style="margin:0;padding:0;background:#0b0b0f">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0b0b0f"><tr><td style="padding:14px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f7"><tr><td align="center" style="padding:40px 24px 36px">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px"><tr><td style="font-family:${BODY};color:#0b0b0f">
<p style="margin:0 0 48px;font-size:14px;line-height:20px"><span style="font-family:${DISPLAY};font-size:19px;letter-spacing:-.04em;color:#0b0b0f">Planary</span><span style="color:#55555e">&nbsp;&nbsp;|&nbsp;&nbsp;Account</span></p>
<h1 style="margin:0 0 16px;font-family:${DISPLAY};font-weight:300;font-size:32px;line-height:1.08;letter-spacing:-.04em;color:#0b0b0f">${heading}</h1>
<p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#55555e">${body}</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="border-radius:999px;background:#1f1b3a"><a href="${url}" style="display:inline-block;padding:17px 28px;border-radius:999px;background:#1f1b3a;color:#f5f5f7;font-family:${BODY};font-size:14px;font-weight:600;line-height:18px;text-decoration:none">${action}</a></td></tr></table>
<p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#55555e">If the button doesn't work, open this link:<br><a href="${url}" style="color:#0b0b0f;word-break:break-all">${url}</a></p>
<p style="margin:40px 0 0;padding-top:20px;border-top:1px solid #d4d4db;font-size:12px;line-height:1.5;color:#55555e">You get this because someone used this address on auth.planary.ch. If that wasn't you, ignore this mail.</p>
</td></tr></table>
</td></tr></table>
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
