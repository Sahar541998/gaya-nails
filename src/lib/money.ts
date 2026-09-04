export function formatIlsFromCents(priceCents: number): string {
  const shekels = priceCents / 100;
  if (Number.isInteger(shekels)) {
    return `₪${shekels}`;
  }
  return `₪${shekels.toFixed(2)}`;
}

export function formatDurationMinutes(minutes: number): string {
  return `${minutes} min`;
}
