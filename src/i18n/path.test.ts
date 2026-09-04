import { describe, expect, it } from "vitest";

import {
  localeFromPathname,
  preferredLocaleFromAcceptLanguage,
} from "@/i18n/locales";
import { stripLocalePrefix, swapLocalePath, withLocale } from "@/i18n/path";

describe("i18n paths", () => {
  it("prefixes public paths with the locale", () => {
    expect(withLocale("he", "/")).toBe("/he");
    expect(withLocale("en", "/book")).toBe("/en/book");
  });

  it("swaps the locale segment and keeps the rest of the path", () => {
    expect(swapLocalePath("/he/book", "en")).toBe("/en/book");
    expect(stripLocalePrefix("/he")).toBe("/");
  });

  it("reads the locale from the first path segment only", () => {
    expect(localeFromPathname("/he/book")).toBe("he");
    expect(localeFromPathname("/hello")).toBe(null);
  });

  it("picks Hebrew or English from Accept-Language", () => {
    expect(preferredLocaleFromAcceptLanguage("he-IL,he;q=0.9,en;q=0.8")).toBe(
      "he",
    );
    expect(preferredLocaleFromAcceptLanguage("en-GB,en;q=0.9")).toBe("en");
  });
});
