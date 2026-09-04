import { DateTime } from "luxon";

import { AdminAppointmentEditor } from "@/components/admin/admin-editors";
import { AdminAppointmentForm } from "@/components/admin/admin-create-forms";
import {
  formatDateLong,
  formatTimeHm,
  toDateTimeLocalInput,
} from "@/lib/business-time";
import { getAdminCalendar } from "@/server/admin/get-calendar";
import type { CalendarAppointmentEvent } from "@/types/admin-calendar";

export default async function AdminAppointmentsPage() {
  const start = DateTime.now().minus({ days: 1 }).toFormat("yyyy-MM-dd");
  const calendar = await getAdminCalendar({ view: "month", date: start });

  if (!calendar.ok) {
    return <p>Could not load appointments.</p>;
  }

  const appointments = calendar.data.events.filter(
    (event): event is CalendarAppointmentEvent => event.kind === "appointment",
  );
  const timezone = calendar.data.range.timezone;

  return (
    <main id="main" className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl text-ink">Appointments</h1>
        <p className="mt-2 text-sm text-ink/65">
          Create, edit, reschedule, or cancel bookings. Availability still uses
          the same rules as /book.
        </p>
      </div>

      <section className="border border-rose-line bg-white p-5">
        <h2 className="font-display text-2xl text-ink">New appointment</h2>
        <div className="mt-4 max-w-xl">
          <AdminAppointmentForm
            services={calendar.data.services}
            defaultStartsAt={toDateTimeLocalInput(
              new Date().toISOString(),
              timezone,
            )}
          />
        </div>
      </section>

      <ul className="grid gap-6">
        {appointments.length === 0 ? (
          <li className="text-sm text-ink/65">
            No appointments in this range.
          </li>
        ) : (
          appointments.map((event) => (
            <li key={event.id} className="border border-rose-line bg-white p-5">
              <p className="text-sm text-ink/65">
                {formatDateLong(event.startsAt, timezone)} ·{" "}
                {formatTimeHm(event.startsAt, timezone)}–
                {formatTimeHm(event.endsAt, timezone)} · {event.status}
              </p>
              <div className="mt-4">
                <AdminAppointmentEditor
                  event={event}
                  services={calendar.data.services}
                  timezone={timezone}
                />
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
