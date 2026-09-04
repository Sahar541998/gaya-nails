import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import {
  getAdminSession,
  isAdminAuthConfigured,
} from "@/server/auth/admin-auth";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session.ok) {
    redirect("/admin");
  }

  return (
    <main
      id="main"
      className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-16"
    >
      <AdminLoginForm configured={isAdminAuthConfigured()} />
    </main>
  );
}
