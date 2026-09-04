import "server-only";

import type { Appointments } from "@/da/appointments/appointments";
import { getSql } from "@/da/postgres/client";
import {
  DaNotFoundError,
  rethrowMappedPostgresError,
} from "@/da/postgres/errors";
import { toIso } from "@/da/postgres/iso";
import type { Appointment, AppointmentStatus } from "@/types/domain";

type AppointmentRow = {
  id: string;
  customer_id: string;
  service_id: string;
  starts_at: Date | string;
  ends_at: Date | string;
  status: AppointmentStatus;
  service_name_at_booking: string;
  price_cents_at_booking: number;
};

function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceId: row.service_id,
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
    status: row.status,
    serviceNameAtBooking: row.service_name_at_booking,
    priceCentsAtBooking: row.price_cents_at_booking,
  };
}

export function createPostgresAppointments(): Appointments {
  const sql = getSql();

  return {
    async getById(id) {
      const rows = await sql<AppointmentRow[]>`
        select
          id, customer_id, service_id, starts_at, ends_at, status,
          service_name_at_booking, price_cents_at_booking
        from public.appointments
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapAppointment(row);
    },

    async listInRange(startsAt, endsAt) {
      const rows = await sql<AppointmentRow[]>`
        select
          id, customer_id, service_id, starts_at, ends_at, status,
          service_name_at_booking, price_cents_at_booking
        from public.appointments
        where starts_at < ${endsAt}
          and ends_at > ${startsAt}
        order by starts_at
      `;
      return rows.map(mapAppointment);
    },

    async listConfirmedOverlapping(startsAt, endsAt) {
      const rows = await sql<AppointmentRow[]>`
        select
          id, customer_id, service_id, starts_at, ends_at, status,
          service_name_at_booking, price_cents_at_booking
        from public.appointments
        where status = 'confirmed'
          and starts_at < ${endsAt}
          and ends_at > ${startsAt}
        order by starts_at
      `;
      return rows.map(mapAppointment);
    },

    async create(input) {
      try {
        const rows = await sql<AppointmentRow[]>`
          insert into public.appointments (
            customer_id, service_id, starts_at, ends_at, status,
            service_name_at_booking, price_cents_at_booking
          )
          values (
            ${input.customerId},
            ${input.serviceId},
            ${input.startsAt},
            ${input.endsAt},
            'confirmed',
            ${input.serviceNameAtBooking},
            ${input.priceCentsAtBooking}
          )
          returning
            id, customer_id, service_id, starts_at, ends_at, status,
            service_name_at_booking, price_cents_at_booking
        `;
        const row = rows[0];
        if (row === undefined) {
          throw new Error("Failed to create appointment.");
        }
        return mapAppointment(row);
      } catch (error) {
        return rethrowMappedPostgresError(error);
      }
    },

    async updateStatus(id, status) {
      const rows = await sql<AppointmentRow[]>`
        update public.appointments
        set status = ${status}
        where id = ${id}
        returning
          id, customer_id, service_id, starts_at, ends_at, status,
          service_name_at_booking, price_cents_at_booking
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new DaNotFoundError("Appointment not found.");
      }
      return mapAppointment(row);
    },

    async updateSchedule(id, startsAt, endsAt) {
      try {
        const rows = await sql<AppointmentRow[]>`
          update public.appointments
          set starts_at = ${startsAt}, ends_at = ${endsAt}
          where id = ${id}
            and status = 'confirmed'
          returning
            id, customer_id, service_id, starts_at, ends_at, status,
            service_name_at_booking, price_cents_at_booking
        `;
        const row = rows[0];
        if (row === undefined) {
          throw new DaNotFoundError("Appointment not found.");
        }
        return mapAppointment(row);
      } catch (error) {
        if (error instanceof DaNotFoundError) {
          throw error;
        }
        return rethrowMappedPostgresError(error);
      }
    },
  };
}
