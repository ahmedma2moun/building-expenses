export const SESSION_COOKIE = "bb_session";

export async function sessionToken(password: string) {
  const data = new TextEncoder().encode(`bb-session:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword) && password === adminPassword;
}

export async function expectedSessionToken() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  return sessionToken(adminPassword);
}
