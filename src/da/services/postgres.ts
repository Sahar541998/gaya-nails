import "server-only";

import type { Services } from "@/da/services/services";
import { getSql } from "@/da/postgres/client";
import {
  DaConflictError,
  DaNotFoundError,
  isPostgresError,
  rethrowMappedPostgresError,
} from "@/da/postgres/errors";
import type { Service } from "@/types/domain";

type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  short_description: string;
  sort_order: number;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    isActive: row.is_active,
    shortDescription: row.short_description,
    sortOrder: row.sort_order,
  };
}

export function createPostgresServices(): Services {
  const sql = getSql();

  return {
    async listActive() {
      const rows = await sql<ServiceRow[]>`
        select
          id, name, duration_minutes, price_cents, is_active,
          short_description, sort_order
        from public.services
        where is_active = true
        order by sort_order, name
      `;
      return rows.map(mapService);
    },

    async listAll() {
      const rows = await sql<ServiceRow[]>`
        select
          id, name, duration_minutes, price_cents, is_active,
          short_description, sort_order
        from public.services
        order by sort_order, name
      `;
      return rows.map(mapService);
    },

    async getById(id) {
      const rows = await sql<ServiceRow[]>`
        select
          id, name, duration_minutes, price_cents, is_active,
          short_description, sort_order
        from public.services
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapService(row);
    },

    async create(input) {
      const rows = await sql<ServiceRow[]>`
        insert into public.services (
          name, duration_minutes, price_cents, short_description, is_active, sort_order
        )
        values (
          ${input.name},
          ${input.durationMinutes},
          ${input.priceCents},
          ${input.shortDescription},
          ${input.isActive},
          ${input.sortOrder}
        )
        returning
          id, name, duration_minutes, price_cents, is_active,
          short_description, sort_order
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to create service.");
      }
      return mapService(row);
    },

    async update(id, input) {
      const rows = await sql<ServiceRow[]>`
        update public.services
        set
          name = ${input.name},
          duration_minutes = ${input.durationMinutes},
          price_cents = ${input.priceCents},
          short_description = ${input.shortDescription},
          is_active = ${input.isActive},
          sort_order = ${input.sortOrder},
          updated_at = now()
        where id = ${id}
        returning
          id, name, duration_minutes, price_cents, is_active,
          short_description, sort_order
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new DaNotFoundError("Service not found.");
      }
      return mapService(row);
    },

    async countAppointments(id) {
      const rows = await sql<{ count: string }[]>`
        select count(*)::text as count
        from public.appointments
        where service_id = ${id}
      `;
      return Number.parseInt(rows[0]?.count ?? "0", 10);
    },

    async delete(id) {
      try {
        const rows = await sql<{ id: string }[]>`
          delete from public.services
          where id = ${id}
          returning id
        `;
        if (rows[0] === undefined) {
          throw new DaNotFoundError("Service not found.");
        }
        return;
      } catch (error) {
        if (error instanceof DaNotFoundError) {
          throw error;
        }
        if (isPostgresError(error) && error.code === "23503") {
          throw new DaConflictError();
        }
        rethrowMappedPostgresError(error);
      }
    },
  };
}
