import { z } from "zod";

export const phoneE164Schema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, "Enter a valid phone number.");

export const verificationCodeSchema = z
  .string()
  .regex(/^\d{4,10}$/, "Enter a valid verification code.");

export function parsePhoneE164(value: string) {
  return phoneE164Schema.safeParse(value.trim());
}
