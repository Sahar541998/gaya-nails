"use server";

import { redirect } from "next/navigation";

import { clearAdminJwtSession } from "@/server/auth/admin-session";

export async function logoutAdminAction(): Promise<void> {
  await clearAdminJwtSession();
  redirect("/admin/login");
}
