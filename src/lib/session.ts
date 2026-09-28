/**
 * Sesi login admin: cookie httpOnly berisi token yang ditandatangani dengan
 * HMAC-SHA256 memakai Web Crypto API (bukan modul `crypto` Node), supaya
 * bisa diverifikasi baik di route handler maupun di middleware (Edge runtime).
 * Pendekatan ini sederhana dan cukup untuk MVP satu akun admin (lihat
 * PRD.md bagian 8) - bukan pengganti NextAuth untuk kebutuhan multi-user.
 */

export const SESSION_COOKIE = "gasgalon_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET belum diset di environment variable");
  }
  return secret;
}

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(signature);
}

export async function createSessionToken(username: string): Promise<string> {
  const payload = JSON.stringify({ u: username, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const encodedPayload = btoa(payload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const signature = await hmacSign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<{ username: string } | null> {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await hmacSign(encodedPayload);
  if (expectedSignature !== signature) return null;

  try {
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.u !== "string") return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
