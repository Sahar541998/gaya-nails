import "server-only";

import { z } from "zod";

import { parsePhoneE164 } from "@/lib/phone";
import { validationError } from "@/lib/errors";
import { ok, type Result } from "@/types/result";

const contactSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Enter a shorter name."),
  email: z
    .string()
    .trim()
    .max(120)
    .pipe(z.email("Enter a valid email address.")),
  note: z.string().trim().max(500, "Keep the note under 500 characters."),
});

export type BookingContact = {
  displayName: string;
  email: string;
  phoneE164: string;
  note: string;
};

export function parseBookingContact(input: {
  displayName: string;
  email: string;
  phone: string;
  note: string;
}): Result<BookingContact> {
  const phone = parsePhoneE164(input.phone);
  if (!phone.success) {
    return validationError("Enter a valid phone number.");
  }

  const parsed = contactSchema.safeParse({
    displayName: input.displayName,
    email: input.email,
    note: input.note,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return validationError(first ?? "Check your details and try again.");
  }

  return ok({
    displayName: parsed.data.displayName,
    email: parsed.data.email,
    phoneE164: phone.data,
    note: parsed.data.note,
  });
}
