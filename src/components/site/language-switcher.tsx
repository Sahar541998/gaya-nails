"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { otherLocale, type Locale } from "@/i18n/locales";
import { swapLocalePath } from "@/i18n/path";

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const nextLocale = otherLocale(locale);
  const query = searchParams.toString();
  const href = `${swapLocalePath(pathname, nextLocale)}${query.length > 0 ? `?${query}` : ""}`;

  return (
    <a
      href={href}
      hrefLang={nextLocale}
      className="text-sm text-ink/70 hover:text-ink"
      lang={nextLocale}
    >
      {label}
    </a>
  );
}
