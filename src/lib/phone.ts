import { z } from "zod";

export const phoneE164Schema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Enter a valid phone number.");

export const verificationCodeSchema = z
  .string()
  .regex(/^\d{4,10}$/, "Enter a valid verification code.");

export function normalizePhoneInput(value: string): string {
  const trimmed = value.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("+")) {
    return trimmed;
  }
  if (trimmed.startsWith("00")) {
    return `+${trimmed.slice(2)}`;
  }
  if (trimmed.startsWith("0") && trimmed.length >= 9) {
    return `+972${trimmed.slice(1)}`;
  }
  if (trimmed.startsWith("972")) {
    return `+${trimmed}`;
  }
  return trimmed;
}

export function parsePhoneE164(value: string) {
  return phoneE164Schema.safeParse(normalizePhoneInput(value));
}
