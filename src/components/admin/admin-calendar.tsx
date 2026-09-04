"use client";

import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AdminAppointmentForm,
  AdminBusyForm,
} from "@/components/admin/admin-create-forms";
import {
  AdminAppointmentEditor,
  AdminBusyEditor,
} from "@/components/admin/admin-editors";
import { formatTimeHm } from "@/lib/business-time";
import type { CalendarEvent, CalendarView } from "@/types/admin-calendar";
import type { Service } from "@/types/domain";

type AdminCalendarProps = {
  view: CalendarView;
  date: string;
  timezone: string;
  events: readonly CalendarEvent[];
  services: readonly Service[];
};

type Panel =
  | { kind: "appointment"; id: string }
  | { kind: "busy"; id: string }
  | {
      kind: "create";
      startsAt: string;
      endsAt: string;
      tab: "appointment" | "busy";
    };

function shiftDate(date: string, view: CalendarView, amount: number): string {
  const current = DateTime.fromISO(date);
  if (view === "month") {
    return current.plus({ months: amount }).toFormat("yyyy-MM-dd");
  }
  if (view === "week") {
    return current.plus({ weeks: amount }).toFormat("yyyy-MM-dd");
  }
  return current.plus({ days: amount }).toFormat("yyyy-MM-dd");
}

function eventLabel(event: CalendarEvent): string {
  if (event.kind === "appointment") {
    return `${event.customerName} · ${event.serviceName}`;
  }
  if (event.kind === "busy") {
    return event.note.length > 0 ? `Busy · ${event.note}` : "Busy";
  }
  return "Closed";
}

function eventClass(event: CalendarEvent): string {
  if (event.kind === "appointment") {
    if (event.status === "cancelled") {
      return "border border-rose-line bg-blush/40 text-ink/70 line-through";
    }
    return "bg-ink text-cream";
  }
  if (event.kind === "busy") {
    return "border border-ink/30 bg-white text-ink";
  }
  return "bg-blush/50 text-ink/50";
}

export function AdminCalendar({
  view,
  date,
  timezone,
  events,
  services,
}: AdminCalendarProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel | null>(null);
  const focus = DateTime.fromISO(date, { zone: timezone }).startOf("day");
  const today = DateTime.now().setZone(timezone).toFormat("yyyy-MM-dd");

  const go = (nextView: CalendarView, nextDate: string) => {
    router.push(`/admin/calendar?view=${nextView}&date=${nextDate}`);
  };

  const weekStart = focus.startOf("week");
  const monthStart = focus.startOf("month").startOf("week");
  const monthDays = Array.from({ length: 42 }, (_, index) =>
    monthStart.plus({ days: index }),
  );
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    weekStart.plus({ days: index }),
  );
  const hours = Array.from({ length: 13 }, (_, index) => 8 + index);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const start = DateTime.fromISO(event.startsAt, { setZone: true }).setZone(
        timezone,
      );
      const key = start.toFormat("yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events, timezone]);

  const appointmentEvent = events.find(
    (event): event is Extract<CalendarEvent, { kind: "appointment" }> =>
      panel?.kind === "appointment" &&
      event.kind === "appointment" &&
      event.id === panel.id,
  );
  const busyEvent = events.find(
    (event): event is Extract<CalendarEvent, { kind: "busy" }> =>
      panel?.kind === "busy" && event.kind === "busy" && event.id === panel.id,
  );

  const renderEventButton = (event: CalendarEvent) => {
    const interactive = event.kind !== "closed";
    const className = `block w-full truncate px-2 py-1 text-left text-xs ${eventClass(event)}`;
    if (!interactive) {
      return (
        <div key={event.id} className={className}>
          <span className="sr-only">Closed · </span>
          {formatTimeHm(event.startsAt, timezone)} {eventLabel(event)}
        </div>
      );
    }
    return (
      <button
        key={event.id}
        type="button"
        className={`${className} min-h-11 md:min-h-0`}
        onClick={() =>
          setPanel({
            kind: event.kind,
            id: event.id,
          })
        }
      >
        {formatTimeHm(event.startsAt, timezone)} {eventLabel(event)}
      </button>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="border border-rose-line bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink">Calendar</h1>
            <p className="mt-1 text-sm text-ink/65">
              {focus.toFormat("cccc d LLLL yyyy")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={() => go(view, shiftDate(date, view, -1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={() => go(view, today)}
            >
              Today
            </button>
            <button
              type="button"
              className="btn-secondary min-h-11"
              onClick={() => go(view, shiftDate(date, view, 1))}
            >
              Next
            </button>
            <label className="sr-only" htmlFor="admin-date">
              Jump to date
            </label>
            <input
              id="admin-date"
              className="field-input min-h-11 max-w-44"
              type="date"
              value={date}
              onChange={(event) => go(view, event.target.value)}
            />
            {(["month", "week", "day"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={`min-h-11 px-3 text-xs tracking-[0.16em] uppercase ${
                  view === item ? "bg-ink text-cream" : "btn-secondary"
                }`}
                onClick={() => go(item, date)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {view === "month" ? (
          <div className="mt-6 overflow-x-auto">
            <div className="grid min-w-[640px] grid-cols-7 gap-px bg-rose-line">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                (label) => (
                  <div
                    key={label}
                    className="bg-white px-2 py-2 text-xs tracking-[0.16em] text-ink/50 uppercase"
                  >
                    {label}
                  </div>
                ),
              )}
              {monthDays.map((day) => {
                const key = day.toFormat("yyyy-MM-dd");
                const isToday = key === today;
                const inMonth = day.month === focus.month;
                const dayEvents = eventsByDay.get(key) ?? [];
                return (
                  <div
                    key={key}
                    className={`min-h-32 bg-white p-2 ${inMonth ? "" : "opacity-50"} ${
                      isToday ? "outline outline-2 outline-ink" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{day.day}</span>
                      <button
                        type="button"
                        className="text-xs tracking-wide text-ink/50 uppercase"
                        onClick={() =>
                          setPanel({
                            kind: "create",
                            startsAt: `${key}T09:00`,
                            endsAt: `${key}T10:00`,
                            tab: "appointment",
                          })
                        }
                      >
                        Add
                      </button>
                    </div>
                    <div className="mt-2 grid gap-1">
                      {dayEvents.slice(0, 4).map(renderEventButton)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {view === "week" || view === "day" ? (
          <div className="mt-6 overflow-x-auto">
            <div
              className="grid min-w-[720px] gap-px bg-rose-line"
              style={{
                gridTemplateColumns:
                  view === "day" ? "4rem 1fr" : "4rem repeat(7, minmax(0,1fr))",
              }}
            >
              <div className="bg-white" />
              {(view === "day" ? [focus] : weekDays).map((day) => {
                const key = day.toFormat("yyyy-MM-dd");
                return (
                  <div
                    key={key}
                    className={`bg-white px-2 py-2 text-xs ${
                      key === today ? "font-medium" : "text-ink/60"
                    }`}
                  >
                    {day.toFormat("ccc d")}
                  </div>
                );
              })}
              {hours.flatMap((hour) => {
                const label = (
                  <div
                    key={`h-${hour}`}
                    className="bg-white px-2 py-3 text-xs text-ink/50"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                );
                const cells = (view === "day" ? [focus] : weekDays).map(
                  (day) => {
                    const key = day.toFormat("yyyy-MM-dd");
                    const slotStart = `${key}T${String(hour).padStart(2, "0")}:00`;
                    const slotEnd = `${key}T${String(hour + 1).padStart(2, "0")}:00`;
                    const slotEvents = (eventsByDay.get(key) ?? []).filter(
                      (event) => {
                        const start = DateTime.fromISO(event.startsAt, {
                          setZone: true,
                        }).setZone(timezone);
                        return start.hour === hour;
                      },
                    );
                    return (
                      <div
                        key={`${key}-${hour}`}
                        className="min-h-16 bg-white p-1"
                      >
                        <button
                          type="button"
                          className="mb-1 w-full min-h-11 text-left text-[10px] tracking-wide text-ink/35 uppercase md:min-h-6"
                          onClick={() =>
                            setPanel({
                              kind: "create",
                              startsAt: slotStart,
                              endsAt: slotEnd,
                              tab: "appointment",
                            })
                          }
                        >
                          Add
                        </button>
                        <div className="grid gap-1">
                          {slotEvents.map(renderEventButton)}
                        </div>
                      </div>
                    );
                  },
                );
                return [label, ...cells];
              })}
            </div>
          </div>
        ) : null}
      </section>

      <aside className="border border-rose-line bg-white p-4">
        {panel === null ? (
          <p className="text-sm text-ink/65">
            Select an appointment, or click Add on an empty time to book or mark
            busy.
          </p>
        ) : null}
        {panel?.kind === "create" ? (
          <div>
            <div className="flex gap-2">
              <button
                type="button"
                className={`min-h-11 flex-1 text-xs tracking-[0.16em] uppercase ${
                  panel.tab === "appointment"
                    ? "bg-ink text-cream"
                    : "btn-secondary"
                }`}
                onClick={() => setPanel({ ...panel, tab: "appointment" })}
              >
                Appointment
              </button>
              <button
                type="button"
                className={`min-h-11 flex-1 text-xs tracking-[0.16em] uppercase ${
                  panel.tab === "busy" ? "bg-ink text-cream" : "btn-secondary"
                }`}
                onClick={() => setPanel({ ...panel, tab: "busy" })}
              >
                Busy
              </button>
            </div>
            <div className="mt-4">
              {panel.tab === "appointment" ? (
                <AdminAppointmentForm
                  services={services}
                  defaultStartsAt={panel.startsAt}
                />
              ) : (
                <AdminBusyForm
                  defaultStartsAt={panel.startsAt}
                  defaultEndsAt={panel.endsAt}
                />
              )}
            </div>
          </div>
        ) : null}
        {appointmentEvent ? (
          <AdminAppointmentEditor
            event={appointmentEvent}
            services={services}
            timezone={timezone}
          />
        ) : null}
        {busyEvent ? (
          <AdminBusyEditor event={busyEvent} timezone={timezone} />
        ) : null}
      </aside>
    </div>
  );
}
