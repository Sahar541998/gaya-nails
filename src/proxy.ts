import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeFromPathname,
  preferredLocaleFromAcceptLanguage,
  type Locale,
} from "@/i18n/locales";

function preferredLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) {
    return cookie;
  }
  return (
    preferredLocaleFromAcceptLanguage(request.headers.get("accept-language")) ??
    DEFAULT_LOCALE
  );
}

function withLocaleCookie(
  response: NextResponse,
  locale: Locale,
): NextResponse {
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPathname(pathname);

  if (locale !== null) {
    const headers = new Headers(request.headers);
    headers.set("x-locale", locale);
    return withLocaleCookie(
      NextResponse.next({ request: { headers } }),
      locale,
    );
  }

  const nextLocale = preferredLocale(request);
  request.nextUrl.pathname = `/${nextLocale}${pathname === "/" ? "" : pathname}`;
  return withLocaleCookie(NextResponse.redirect(request.nextUrl), nextLocale);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|admin|favicon.ico|.*\\..*).*)",
  ],
};
