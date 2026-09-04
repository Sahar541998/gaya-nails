"use server";

import { redirect } from "next/navigation";

import { consumeRateLimit } from "@/lib/rate-limit";
import {
  adminCredentialsMatch,
  createAdminJwtSession,
  isAdminPasswordAuthConfigured,
} from "@/server/auth/admin-session";

export type AdminLoginState = {
  error: string;
};

export async function loginAdminAction(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  if (!isAdminPasswordAuthConfigured()) {
    return { error: "Admin sign-in is not configured." };
  }

  if (!consumeRateLimit("admin-login", 10, 15 * 60 * 1000)) {
    return { error: "Too many sign-in attempts. Try again later." };
  }

  const usernameValue = formData.get("username");
  const passwordValue = formData.get("password");
  const username = typeof usernameValue === "string" ? usernameValue : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!adminCredentialsMatch(username, password)) {
    return { error: "That username or password is not correct." };
  }

  const created = await createAdminJwtSession(username);
  if (!created) {
    return { error: "Admin sign-in is not configured." };
  }

  redirect("/admin");
  return { error: "" };
}
