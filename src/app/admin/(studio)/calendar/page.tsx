import { DateTime } from "luxon";

import { AdminCalendar } from "@/components/admin/admin-calendar";
import { getAdminCalendar } from "@/server/admin/get-calendar";
import type { CalendarView } from "@/types/admin-calendar";

function parseView(value: string | undefined): CalendarView {
  if (value === "week" || value === "day" || value === "month") {
    return value;
  }
  return "week";
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string }>;
}) {
  const query = await searchParams;
  const view = parseView(query.view);
  const date =
    query.date !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(query.date)
      ? query.date
      : DateTime.now().toFormat("yyyy-MM-dd");

  const calendar = await getAdminCalendar({ view, date });
  if (!calendar.ok) {
    return <p>Could not load the calendar.</p>;
  }

  return (
    <main id="main">
      <AdminCalendar
        view={calendar.data.range.view}
        date={calendar.data.range.date}
        timezone={calendar.data.range.timezone}
        events={calendar.data.events}
        services={calendar.data.services}
      />
    </main>
  );
}
