import "server-only";

import { formatTimeHm } from "@/lib/business-time";
import { getDataAccess } from "@/da";
import { getAvailableSlots } from "@/server/availability/get-available-slots";
import type { ServiceId } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export type BookingSlot = {
  startsAt: string;
  endsAt: string;
  timeLabel: string;
};

export async function getBookingSlots(input: {
  serviceId: ServiceId;
  date: string;
  now?: Date;
}): Promise<Result<readonly BookingSlot[]>> {
  const settings = await getDataAccess().businessSettings.get();
  const slots = await getAvailableSlots(input);
  if (!slots.ok) {
    return slots;
  }

  return ok(
    slots.data.map((slot) => ({
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      timeLabel: formatTimeHm(slot.startsAt, settings.timezone),
    })),
  );
}
