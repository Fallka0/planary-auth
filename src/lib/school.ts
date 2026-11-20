import type { Env } from "../env";

/**
 * School accounts: addresses of a school domain (SCHOOL_DOMAINS, e.g. "bwdbern.ch=bwd") follow
 * vorname.nachname@domain. Their name comes from the address and can't be changed, and the account
 * carries the school's key in `org`, so school apps get real names instead of nicknames.
 */

export function schoolDomains(env: Pick<Env, "SCHOOL_DOMAINS">): Map<string, string> {
  return new Map(
    (env.SCHOOL_DOMAINS ?? "")
      .split(",")
      .map((p) => p.trim().toLowerCase().split("="))
      .filter((p): p is [string, string] => p.length === 2 && !!p[0] && !!p[1]),
  );
}

const word = (w: string) =>
  w
    .split("-")
    .map((p) => (p ? p[0]!.toUpperCase() + p.slice(1) : p))
    .join("-");

/** "anna-lena.de.la.cruz" → "Anna-Lena De La Cruz". Null if the address doesn't follow vorname.nachname. */
export function nameFromAddress(email: string): string | null {
  const local = (email.split("@")[0] ?? "").toLowerCase();
  const parts = local.split(".").filter(Boolean);
  if (parts.length < 2 || parts.some((p) => !/^[\p{L}-]+$/u.test(p))) return null;
  return parts.map(word).join(" ");
}

/** The school (org key) and the name from the address, or null for a normal account. */
export function schoolAccount(env: Pick<Env, "SCHOOL_DOMAINS">, email: string): { org: string; name: string } | null {
  const domain = (email.split("@")[1] ?? "").toLowerCase();
  const org = schoolDomains(env).get(domain);
  const name = org ? nameFromAddress(email) : null;
  return org && name ? { org, name } : null;
}
