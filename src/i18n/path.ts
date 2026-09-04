import { isLocale, type Locale } from "@/i18n/locales";

export function withLocale(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized === "/") {
    return `/${locale}`;
  }
  return `/${locale}${normalized}`;
}

export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (!isLocale(maybeLocale)) {
    return pathname.length === 0 ? "/" : pathname;
  }
  const rest = `/${segments.slice(2).join("/")}`;
  if (rest === "/") {
    return "/";
  }
  return rest.endsWith("/") && rest.length > 1 ? rest.slice(0, -1) : rest;
}

export function swapLocalePath(pathname: string, nextLocale: Locale): string {
  return withLocale(nextLocale, stripLocalePrefix(pathname));
}
