export function interpolate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replaceAll(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value === undefined ? match : value;
  });
}
