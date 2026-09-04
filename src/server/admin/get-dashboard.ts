import "server-only";

import { DateTime } from "luxon";

import { getDataAccess } from "@/da";
import { toUtcIso } from "@/lib/business-time";
import { requireAdmin } from "@/server/auth/require-admin";
import type { Appointment, Customer, Service } from "@/types/domain";
import type { Result } from "@/types/result";
import { ok } from "@/types/result";

export type DashboardAppointment = {
  appointment: Appointment;
  customer: Customer;
  serviceName: string;
};

export type AdminDashboardData = {
  timezone: string;
  todayCount: number;
  next: DashboardAppointment | null;
  today: readonly DashboardAppointment[];
  upcoming: readonly DashboardAppointment[];
  services: readonly Service[];
};

async function hydrate(
  appointment: Appointment,
): Promise<DashboardAppointment | null> {
  const customer = await getDataAccess().customers.getById(
    appointment.customerId,
  );
  if (customer === null) {
    return null;
  }
  return {
    appointment,
    customer,
    serviceName: appointment.serviceNameAtBooking,
  };
}

export async function getAdminDashboard(
  now = new Date(),
): Promise<Result<AdminDashboardData>> {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return admin;
  }

  const settings = await getDataAccess().businessSettings.get();
  const localNow = DateTime.fromJSDate(now, { zone: settings.timezone });
  const todayStart = localNow.startOf("day");
  const todayEnd = todayStart.plus({ days: 1 });
  const upcomingEnd = todayStart.plus({ days: 14 });

  const [todayAppointments, upcomingAppointments, services] = await Promise.all(
    [
      getDataAccess().appointments.listInRange(
        toUtcIso(todayStart),
        toUtcIso(todayEnd),
      ),
      getDataAccess().appointments.listInRange(
        toUtcIso(todayStart),
        toUtcIso(upcomingEnd),
      ),
      getDataAccess().services.listAll(),
    ],
  );

  const todayHydrated = (
    await Promise.all(todayAppointments.map((item) => hydrate(item)))
  ).filter((item): item is DashboardAppointment => item !== null);

  const confirmedToday = todayHydrated.filter(
    (item) => item.appointment.status === "confirmed",
  );
  const upcomingHydrated = (
    await Promise.all(upcomingAppointments.map((item) => hydrate(item)))
  ).filter((item): item is DashboardAppointment => item !== null);

  const upcomingConfirmed = upcomingHydrated
    .filter((item) => item.appointment.status === "confirmed")
    .filter((item) => item.appointment.startsAt >= now.toISOString())
    .toSorted((a, b) =>
      a.appointment.startsAt.localeCompare(b.appointment.startsAt),
    );

  return ok({
    timezone: settings.timezone,
    todayCount: confirmedToday.length,
    next: upcomingConfirmed[0] ?? null,
    today: confirmedToday,
    upcoming: upcomingConfirmed.slice(0, 12),
    services,
  });
}
