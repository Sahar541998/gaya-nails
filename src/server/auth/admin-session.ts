import "server-only";

import { cookies } from "next/headers";

import {
  getAdminJwtSecret,
  normalizeAdminUsername,
} from "@/server/auth/admin-credentials";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_JWT_MAX_AGE_SECONDS,
  signAdminJwt,
  verifyAdminJwt,
  type AdminJwtClaims,
} from "@/server/auth/admin-jwt";

export {
  adminCredentialsMatch,
  isAdminPasswordAuthConfigured,
} from "@/server/auth/admin-credentials";

export async function createAdminJwtSession(
  username: string,
): Promise<boolean> {
  const secret = getAdminJwtSecret();
  if (secret === undefined || secret.length < 16) {
    return false;
  }
  const token = signAdminJwt(
    { sub: "studio-admin", username: normalizeAdminUsername(username) },
    secret,
  );
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_JWT_MAX_AGE_SECONDS,
  });
  return true;
}

export async function clearAdminJwtSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function readAdminJwtSession(): Promise<AdminJwtClaims | null> {
  const secret = getAdminJwtSecret();
  if (secret === undefined) {
    return null;
  }
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE_NAME)?.value;
  if (token === undefined) {
    return null;
  }
  return verifyAdminJwt(token, secret);
}
