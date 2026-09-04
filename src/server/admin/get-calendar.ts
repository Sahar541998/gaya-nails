import "server-only";

import { DateTime } from "luxon";

import { getDataAccess } from "@/da";
import {
  dayHoursFor,
  parseHm,
  parseLocalDate,
  toUtcIso,
  zonedDateTime,
} from "@/lib/business-time";
import { requireAdmin } from "@/server/auth/require-admin";
import type {
  CalendarAppointmentEvent,
  CalendarClosedEvent,
  CalendarEvent,
  CalendarView,
} from "@/types/admin-calendar";
import type { Service } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export type CalendarRange = {
  view: CalendarView;
  date: string;
  rangeStart: string;
  rangeEnd: string;
  timezone: string;
};

export function resolveCalendarRange(
  view: CalendarView,
  date: string,
  timeZone: string,
  now = new Date(),
): CalendarRange {
  const requested = parseLocalDate(date, timeZone);
  const focus =
    requested ?? DateTime.fromJSDate(now, { zone: timeZone }).startOf("day");
  const focusDate = focus.toFormat("yyyy-MM-dd");

  if (view === "day") {
    return {
      view,
      date: focusDate,
      rangeStart: toUtcIso(focus),
      rangeEnd: toUtcIso(focus.plus({ days: 1 })),
      timezone: timeZone,
    };
  }

  if (view === "week") {
    const start = focus.startOf("week");
    return {
      view,
      date: focusDate,
      rangeStart: toUtcIso(start),
      rangeEnd: toUtcIso(start.plus({ days: 7 })),
      timezone: timeZone,
    };
  }

  const monthStart = focus.startOf("month");
  const gridStart = monthStart.startOf("week");
  const gridEnd = focus
    .endOf("month")
    .endOf("week")
    .plus({ days: 1 })
    .startOf("day");
  return {
    view,
    date: focusDate,
    rangeStart: toUtcIso(gridStart),
    rangeEnd: toUtcIso(gridEnd),
    timezone: timeZone,
  };
}

function closedEventsForRange(
  rangeStartIso: string,
  rangeEndIso: string,
  timeZone: string,
  weeklyHours: Parameters<typeof dayHoursFor>[2],
): CalendarClosedEvent[] {
  const events: CalendarClosedEvent[] = [];
  let cursor = DateTime.fromISO(rangeStartIso, { setZone: true })
    .setZone(timeZone)
    .startOf("day");
  const limit = DateTime.fromISO(rangeEndIso, { setZone: true }).setZone(
    timeZone,
  );

  while (cursor < limit) {
    const hours = dayHoursFor(cursor, timeZone, weeklyHours);
    const dayStart = cursor;
    const dayEnd = cursor.plus({ days: 1 });
    const dateKey = cursor.toFormat("yyyy-MM-dd");

    if (hours === undefined) {
      events.push({
        kind: "closed",
        id: `closed-${dateKey}`,
        startsAt: toUtcIso(dayStart),
        endsAt: toUtcIso(dayEnd),
      });
    } else {
      const openHm = parseHm(hours.open);
      const closeHm = parseHm(hours.close);
      if (openHm !== null && closeHm !== null) {
        const open = zonedDateTime(
          {
            year: cursor.year,
            month: cursor.month,
            day: cursor.day,
            hour: openHm.hour,
            minute: openHm.minute,
          },
          timeZone,
        );
        const close = zonedDateTime(
          {
            year: cursor.year,
            month: cursor.month,
            day: cursor.day,
            hour: closeHm.hour,
            minute: closeHm.minute,
          },
          timeZone,
        );
        if (open !== null && close !== null) {
          if (toUtcIso(dayStart) < toUtcIso(open)) {
            events.push({
              kind: "closed",
              id: `closed-${dateKey}-am`,
              startsAt: toUtcIso(dayStart),
              endsAt: toUtcIso(open),
            });
          }
          if (toUtcIso(close) < toUtcIso(dayEnd)) {
            events.push({
              kind: "closed",
              id: `closed-${dateKey}-pm`,
              startsAt: toUtcIso(close),
              endsAt: toUtcIso(dayEnd),
            });
          }
        }
      }
    }

    cursor = dayEnd;
  }

  return events;
}

export type AdminCalendarData = {
  range: CalendarRange;
  events: readonly CalendarEvent[];
  services: readonly Service[];
};

export async function getAdminCalendar(input: {
  view: CalendarView;
  date: string;
  now?: Date;
}): Promise<Result<AdminCalendarData>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const settings = await getDataAccess().businessSettings.get();
  const range = resolveCalendarRange(
    input.view,
    input.date,
    settings.timezone,
    input.now,
  );

  const [appointments, blocks, services] = await Promise.all([
    getDataAccess().appointments.listInRange(range.rangeStart, range.rangeEnd),
    getDataAccess().blockedTimes.listOverlapping(
      range.rangeStart,
      range.rangeEnd,
    ),
    getDataAccess().services.listAll(),
  ]);

  const appointmentEvents = await Promise.all(
    appointments.map(async (appointment) => {
      const customer = await getDataAccess().customers.getById(
        appointment.customerId,
      );
      const event: CalendarAppointmentEvent = {
        kind: "appointment",
        id: appointment.id,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        status: appointment.status,
        serviceName: appointment.serviceNameAtBooking,
        customerName:
          customer !== null && customer.displayName.length > 0
            ? customer.displayName
            : "Customer",
        customerPhone: customer?.phoneE164 ?? "",
        customerEmail: customer?.email ?? "",
        note: appointment.note,
        serviceId: appointment.serviceId,
      };
      return event;
    }),
  );

  const closed = closedEventsForRange(
    range.rangeStart,
    range.rangeEnd,
    settings.timezone,
    settings.weeklyHours,
  );

  return ok({
    range,
    events: [
      ...closed,
      ...blocks.map((block) => ({
        kind: "busy" as const,
        id: block.id,
        startsAt: block.startsAt,
        endsAt: block.endsAt,
        note: block.note,
      })),
      ...appointmentEvents,
    ],
    services,
  });
}
