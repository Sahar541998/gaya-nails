"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAdminAction } from "@/app/admin/logout-action";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminNav() {
  const currentPath = usePathname();
  return (
    <header className="border-b border-rose-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.22em] text-ink/50 uppercase">
            Gaya studio
          </p>
          <p className="font-display text-2xl text-ink">Admin</p>
        </div>
        <nav aria-label="Admin" className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? currentPath === "/admin"
                : currentPath === link.href ||
                  currentPath.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-11 items-center px-3 py-2 text-xs tracking-[0.16em] uppercase ${
                  active
                    ? "bg-ink text-cream"
                    : "border border-rose-line text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center border border-rose-line px-3 py-2 text-xs tracking-[0.16em] text-ink uppercase"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
