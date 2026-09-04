export const LOCALES = ["he", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "he";

export const LOCALE_COOKIE = "gaya-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "he" || value === "en";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "he" ? "en" : "he";
}

export function localeDir(locale: Locale): "rtl" | "ltr" {
  return locale === "he" ? "rtl" : "ltr";
}

export function localeBcp47(locale: Locale): string {
  return locale === "he" ? "he-IL" : "en-GB";
}

export function localeFromPathname(pathname: string): Locale | null {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

export function preferredLocaleFromAcceptLanguage(
  header: string | null,
): Locale | null {
  if (header === null || header.length === 0) {
    return null;
  }
  const parts = header.split(",");
  for (const part of parts) {
    const tag = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (tag.startsWith("he")) {
      return "he";
    }
    if (tag.startsWith("en")) {
      return "en";
    }
  }
  return null;
}

export function eyebrowClass(locale: Locale): string {
  return locale === "en" ? "tracking-[0.28em] uppercase" : "";
}

export function labelTrackingClass(locale: Locale): string {
  return locale === "en" ? "tracking-wide uppercase" : "";
}
