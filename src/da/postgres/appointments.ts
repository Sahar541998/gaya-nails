import "server-only";

import type { AppointmentRepository } from "@/da/contracts";
import { getSql } from "@/da/postgres/client";
import {
  DaNotFoundError,
  rethrowMappedPostgresError,
} from "@/da/postgres/errors";
import { mapAppointment, type AppointmentRow } from "@/da/postgres/mappers";

export function createAppointmentRepository(): AppointmentRepository {
  const sql = getSql();

  return {
    async getById(id) {
      const rows = await sql<AppointmentRow[]>`
        select id, customer_id, service_id, starts_at, ends_at, status
        from public.appointments
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapAppointment(row);
    },

    async listInRange(startsAt, endsAt) {
      const rows = await sql<AppointmentRow[]>`
        select id, customer_id, service_id, starts_at, ends_at, status
        from public.appointments
        where starts_at < ${endsAt}
          and ends_at > ${startsAt}
        order by starts_at
      `;
      return rows.map(mapAppointment);
    },

    async create(input) {
      try {
        const rows = await sql<AppointmentRow[]>`
          insert into public.appointments (
            customer_id, service_id, starts_at, ends_at, status
          )
          values (
            ${input.customerId},
            ${input.serviceId},
            ${input.startsAt},
            ${input.endsAt},
            'confirmed'
          )
          returning id, customer_id, service_id, starts_at, ends_at, status
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
        returning id, customer_id, service_id, starts_at, ends_at, status
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new DaNotFoundError("Appointment not found.");
      }
      return mapAppointment(row);
    },
  };
}
