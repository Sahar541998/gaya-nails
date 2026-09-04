"use server";

import { getBookingSlots } from "@/server/booking/get-booking-slots";
import {
  readBookingSessionToken,
  setBookingSessionCookie,
} from "@/server/booking/booking-session-cookie";
import { submitCustomerBooking } from "@/server/booking/submit-customer-booking";
import { sendPhoneVerification } from "@/server/verification/send-phone-verification";
import { verifyPhone } from "@/server/verification/verify-phone";

export type BookingActionResult<T> =
  { ok: true; data: T } | { ok: false; message: string; code?: string };

export async function loadBookingSlotsAction(
  serviceId: string,
  date: string,
): Promise<
  BookingActionResult<
    readonly { startsAt: string; endsAt: string; timeLabel: string }[]
  >
> {
  const result = await getBookingSlots({ serviceId, date });
  if (!result.ok) {
    return {
      ok: false,
      message: result.error.message,
      code: result.error.code,
    };
  }
  return { ok: true, data: result.data };
}

export async function sendBookingCodeAction(
  phone: string,
): Promise<BookingActionResult<{ sent: true }>> {
  const result = await sendPhoneVerification(phone);
  if (!result.ok) {
    return {
      ok: false,
      message: result.error.message,
      code: result.error.code,
    };
  }
  return { ok: true, data: result.data };
}

export async function verifyBookingPhoneAction(
  phone: string,
  code: string,
): Promise<BookingActionResult<{ verified: true }>> {
  const result = await verifyPhone(phone, code);
  if (!result.ok) {
    return {
      ok: false,
      message: result.error.message,
      code: result.error.code,
    };
  }
  await setBookingSessionCookie(
    result.data.verificationToken,
    result.data.expiresAt,
  );
  return { ok: true, data: { verified: true } };
}

export async function submitBookingAction(input: {
  serviceId: string;
  startsAt: string;
  displayName: string;
  email: string;
  phone: string;
  note: string;
}): Promise<
  BookingActionResult<{
    serviceName: string;
    priceCents: number;
    durationMinutes: number;
    startsAt: string;
    endsAt: string;
    displayName: string;
    email: string;
    note: string;
  }>
> {
  const token = await readBookingSessionToken();
  if (token === undefined) {
    return {
      ok: false,
      message: "Verify your phone number to continue.",
      code: "unauthorized",
    };
  }

  const result = await submitCustomerBooking({
    actor: { kind: "customer", verificationToken: token },
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    displayName: input.displayName,
    email: input.email,
    phone: input.phone,
    note: input.note,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: result.error.message,
      code: result.error.code,
    };
  }

  return {
    ok: true,
    data: {
      serviceName: result.data.serviceName,
      priceCents: result.data.priceCents,
      durationMinutes: result.data.durationMinutes,
      startsAt: result.data.startsAt,
      endsAt: result.data.endsAt,
      displayName: result.data.displayName,
      email: result.data.email,
      note: result.data.note,
    },
  };
}
