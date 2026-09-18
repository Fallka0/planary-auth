import type { Env } from "../env";
import { base64url, randomToken } from "./crypto";

export type Provider = "google" | "github";

export interface OAuthProfile {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string;
}

export function providerEnabled(env: Env, provider: Provider) {
  return provider === "google"
    ? Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
    : Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

export function callbackUrl(env: Env, provider: Provider) {
  return `${env.PUBLIC_URL}/oauth/${provider}/callback`;
}

/** Builds the provider redirect plus the state we keep in a short-lived cookie. */
export async function authorizationUrl(env: Env, provider: Provider) {
  const state = randomToken(24);
  const verifier = randomToken(48);
  const challenge = base64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));

  if (provider === "google") {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.search = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID!,
      redirect_uri: callbackUrl(env, "google"),
      response_type: "code",
      scope: "openid email profile",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();
    return { url: url.toString(), state, verifier };
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID!,
    redirect_uri: callbackUrl(env, "github"),
    scope: "read:user user:email",
    state,
    allow_signup: "true",
  }).toString();
  return { url: url.toString(), state, verifier };
}

export async function fetchProfile(env: Env, provider: Provider, code: string, verifier: string): Promise<OAuthProfile> {
  if (provider === "google") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID!,
        client_secret: env.GOOGLE_CLIENT_SECRET!,
        code,
        code_verifier: verifier,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl(env, "google"),
      }),
    });
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) throw new Error("Google token exchange failed");
    const info = (await (
      await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } })
    ).json()) as { sub: string; email: string; email_verified: boolean; name?: string; given_name?: string };
    return {
      providerUserId: info.sub,
      email: info.email,
      emailVerified: Boolean(info.email_verified),
      name: info.given_name || info.name || info.email.split("@")[0],
    };
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID!,
      client_secret: env.GITHUB_CLIENT_SECRET!,
      code,
      redirect_uri: callbackUrl(env, "github"),
    }),
  });
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("GitHub token exchange failed");
  const headers = { Authorization: `Bearer ${token.access_token}`, "User-Agent": "planary-auth", Accept: "application/vnd.github+json" };
  const user = (await (await fetch("https://api.github.com/user", { headers })).json()) as { id: number; login: string; name?: string };
  const emails = (await (await fetch("https://api.github.com/user/emails", { headers })).json()) as {
    email: string;
    primary: boolean;
    verified: boolean;
  }[];
  const primary = emails.find((e) => e.primary && e.verified) ?? emails.find((e) => e.verified);
  if (!primary) throw new Error("GitHub account has no verified email");
  return {
    providerUserId: String(user.id),
    email: primary.email,
    emailVerified: true,
    name: user.name?.split(" ")[0] || user.login,
  };
}
