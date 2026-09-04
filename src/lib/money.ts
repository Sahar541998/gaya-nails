const MAX_PRICE_CENTS = 10_000_000;

export function formatIlsFromCents(priceCents: number): string {
  const negative = priceCents < 0;
  const absolute = negative ? -priceCents : priceCents;
  const whole = Math.trunc(absolute / 100);
  const fraction = absolute % 100;
  const sign = negative ? "-" : "";
  if (fraction === 0) {
    return `${sign}₪${whole}`;
  }
  return `${sign}₪${whole}.${String(fraction).padStart(2, "0")}`;
}

export function shekelsInputFromCents(priceCents: number): string {
  const whole = Math.trunc(priceCents / 100);
  const fraction = priceCents % 100;
  if (fraction === 0) {
    return String(whole);
  }
  return `${whole}.${String(fraction).padStart(2, "0")}`;
}

export function parseShekelsToCents(raw: string): number | null {
  const trimmed = raw.trim().replaceAll(/[₪,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return null;
  }
  const [wholePart, fractionPart] = trimmed.split(".");
  const whole = Number.parseInt(wholePart ?? "0", 10);
  const fraction = Number.parseInt((fractionPart ?? "").padEnd(2, "0"), 10);
  const cents = whole * 100 + fraction;
  if (!Number.isSafeInteger(cents) || cents < 1 || cents > MAX_PRICE_CENTS) {
    return null;
  }
  return cents;
}

export function formatDurationMinutes(minutes: number): string {
  return `${minutes} min`;
}
