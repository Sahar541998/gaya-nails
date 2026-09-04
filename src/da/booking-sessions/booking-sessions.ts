import "server-only";

import type { BookingSession, CustomerId } from "@/types/domain";

export type CreatedBookingSession = BookingSession & {
  token: string;
};

export type BookingSessions = {
  create(
    customerId: CustomerId,
    expiresAt: string,
  ): Promise<CreatedBookingSession>;
  getByToken(token: string): Promise<BookingSession | null>;
};
