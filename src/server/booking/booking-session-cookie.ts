import "server-only";

import { cookies } from "next/headers";

const COOKIE_NAME = "gaya_booking_session";

export async function setBookingSessionCookie(
  token: string,
  expiresAt: string,
): Promise<void> {
  const store = await cookies();
  store.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function readBookingSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}
