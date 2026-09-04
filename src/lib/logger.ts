import "server-only";

const SENSITIVE_KEY =
  /phone|token|secret|password|otp|code|sid|authorization|cookie/i;

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    next[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : value;
  }

  return next;
}

function write(
  level: "info" | "error",
  message: string,
  meta?: Record<string, unknown>,
): void {
  const payload = meta ? { message, ...redact(meta) } : { message };

  if (level === "error") {
    console.error(payload);
    return;
  }

  console.info(payload);
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    write("info", message, meta);
  },
  error(message: string, meta?: Record<string, unknown>): void {
    write("error", message, meta);
  },
};
