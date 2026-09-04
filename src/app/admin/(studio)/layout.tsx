import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSession } from "@/server/auth/admin-auth";

export default async function AdminStudioLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await getAdminSession();
  if (!session.ok) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-full flex-col bg-cream">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <AdminNav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </div>
    </div>
  );
}
