import { Suspense } from "react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/site/language-switcher";
import { eyebrowClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  studioName: string;
  locale: Locale;
  copy: Messages["header"];
  navItems: readonly NavItem[];
  bookHref: string;
  homeHref: string;
};

export function SiteHeader({
  studioName,
  locale,
  copy,
  navItems,
  bookHref,
  homeHref,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-rose-line/80 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href={homeHref}
          className={`font-display text-lg text-ink ${eyebrowClass(locale)}`}
        >
          {studioName}
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm tracking-wide text-ink/80 md:flex"
          aria-label={copy.primaryNav}
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Suspense>
            <LanguageSwitcher locale={locale} label={copy.languageSwitch} />
          </Suspense>
          <Link href={bookHref} className="btn-primary">
            {copy.bookNow}
          </Link>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-sm px-2 py-1 text-sm tracking-wide text-ink ring-ink/40 focus-visible:ring-2">
              {copy.menu}
            </summary>
            <div className="absolute end-0 mt-3 w-44 border border-rose-line bg-cream p-3 shadow-sm">
              <nav
                className="flex flex-col gap-3 text-sm"
                aria-label={copy.mobileNav}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-ink/80"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
