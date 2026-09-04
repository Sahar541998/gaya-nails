import Link from "next/link";

import {
  AdminAppointmentForm,
  AdminBusyForm,
} from "@/components/admin/admin-create-forms";
import {
  formatDateLong,
  formatTimeHm,
  toDateTimeLocalInput,
} from "@/lib/business-time";
import { getAdminDashboard } from "@/server/admin/get-dashboard";

export default async function AdminHomePage() {
  const dashboard = await getAdminDashboard();
  if (!dashboard.ok) {
    return <p>Could not load the dashboard.</p>;
  }

  const { timezone, todayCount, next, today, upcoming, services } =
    dashboard.data;
  const nowIso = new Date().toISOString();
  const defaultStart = toDateTimeLocalInput(nowIso, timezone);

  return (
    <main id="main" className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl text-ink">Today</h1>
        <p className="mt-2 text-sm text-ink/65">
          {todayCount} confirmed booking{todayCount === 1 ? "" : "s"} today.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-rose-line bg-white p-5">
          <p className="text-xs tracking-[0.16em] text-ink/50 uppercase">
            Next
          </p>
          {next ? (
            <p className="mt-3 text-lg text-ink">
              {next.customer.displayName} ·{" "}
              {formatTimeHm(next.appointment.startsAt, timezone)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-ink/65">No upcoming booking.</p>
          )}
        </article>
        <Link
          className="border border-rose-line bg-white p-5"
          href="/admin/calendar"
        >
          Open calendar
        </Link>
        <Link
          className="border border-rose-line bg-white p-5"
          href="/admin/services"
        >
          Manage services
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-rose-line bg-white p-5">
          <h2 className="font-display text-2xl text-ink">
            Quick add appointment
          </h2>
          <div className="mt-4">
            <AdminAppointmentForm
              services={services}
              defaultStartsAt={defaultStart}
            />
          </div>
        </div>
        <div className="border border-rose-line bg-white p-5">
          <h2 className="font-display text-2xl text-ink">Quick block time</h2>
          <div className="mt-4">
            <AdminBusyForm
              defaultStartsAt={defaultStart}
              defaultEndsAt={defaultStart}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Today’s appointments</h2>
        {today.length === 0 ? (
          <p className="mt-3 text-sm text-ink/65">
            Nothing on the books today.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-rose-line border border-rose-line bg-white">
            {today.map((item) => (
              <li key={item.appointment.id} className="px-4 py-3 text-sm">
                {formatTimeHm(item.appointment.startsAt, timezone)} ·{" "}
                {item.customer.displayName} · {item.serviceName}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl text-ink">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-ink/65">
            No upcoming confirmed bookings.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-rose-line border border-rose-line bg-white">
            {upcoming.map((item) => (
              <li key={item.appointment.id} className="px-4 py-3 text-sm">
                {formatDateLong(item.appointment.startsAt, timezone)} ·{" "}
                {formatTimeHm(item.appointment.startsAt, timezone)} ·{" "}
                {item.customer.displayName} · {item.serviceName}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
