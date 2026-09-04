import "server-only";

import type { ServiceRepository } from "@/da/contracts";
import { getSql } from "@/da/postgres/client";
import { mapService, type ServiceRow } from "@/da/postgres/mappers";

export function createServiceRepository(): ServiceRepository {
  const sql = getSql();

  return {
    async listActive() {
      const rows = await sql<ServiceRow[]>`
        select id, name, duration_minutes, price_cents, is_active
        from public.services
        where is_active = true
        order by name
      `;
      return rows.map(mapService);
    },

    async getById(id) {
      const rows = await sql<ServiceRow[]>`
        select id, name, duration_minutes, price_cents, is_active
        from public.services
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapService(row);
    },
  };
}
