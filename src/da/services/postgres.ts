import "server-only";

import { getSql } from "@/da/postgres/client";
import type { Services } from "@/da/services/services";
import type { Service } from "@/types/domain";

type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
  short_description: string;
};

function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    isActive: row.is_active,
    shortDescription: row.short_description,
  };
}

export function createPostgresServices(): Services {
  const sql = getSql();

  return {
    async listActive() {
      const rows = await sql<ServiceRow[]>`
        select id, name, duration_minutes, price_cents, is_active, short_description
        from public.services
        where is_active = true
        order by name
      `;
      return rows.map(mapService);
    },

    async getById(id) {
      const rows = await sql<ServiceRow[]>`
        select id, name, duration_minutes, price_cents, is_active, short_description
        from public.services
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapService(row);
    },
  };
}
