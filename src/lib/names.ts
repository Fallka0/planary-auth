import type { Env } from "../env";

/**
 * Names suggested from an address that follows first.last@domain (any domain): "anna-lena.de.la.cruz" gives
 * "Anna-Lena De La Cruz". Numbers that tell apart people with the same name (max.muster2) are dropped.
 * A suggestion only: people can change their display name, except where an app uses its own names.
 */
export function nameFromAddress(email: string): { first: string; last: string } | null {
  const local = (email.split("@")[0] ?? "").toLowerCase().replace(/\d+$/, "");
  const parts = local.split(".").filter(Boolean);
  if (parts.length < 2 || parts.some((p) => !/^[\p{L}-]+$/u.test(p))) return null;
  const word = (w: string) =>
    w
      .split("-")
      .map((p) => (p ? p[0]!.toUpperCase() + p.slice(1) : p))
      .join("-");
  return { first: word(parts[0]!), last: parts.slice(1).map(word).join(" ") };
}

/** "Anna-Lena De La Cruz", or "" when the address doesn't follow first.last. */
export function suggestedName(email: string): string {
  const n = nameFromAddress(email);
  return n ? `${n.first} ${n.last}` : "";
}

/** "Anna-Lena D.", or the part before @ when the address doesn't follow first.last. */
export function shortName(email: string): string {
  const n = nameFromAddress(email);
  return n ? `${n.first} ${n.last[0]}.` : (email.split("@")[0] ?? "");
}

/**
 * Apps that keep their own names (e.g. the bwd Portal takes names from the school address): sign-up from them
 * skips the display name, and Planary uses the short name ("Mykyta P.") so no full name ends up on public
 * leaderboards of other apps. OWN_NAME_ORIGINS lists their origins, comma-separated.
 */
export function ownNameApp(env: Pick<Env, "OWN_NAME_ORIGINS">, returnTo: string | null): boolean {
  if (!returnTo) return false;
  const origins = (env.OWN_NAME_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  try {
    return origins.includes(new URL(returnTo).origin);
  } catch {
    return false;
  }
}
