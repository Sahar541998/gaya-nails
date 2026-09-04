import "server-only";

import type { CustomerRepository } from "@/da/contracts";
import { getSql } from "@/da/postgres/client";
import { mapCustomer, type CustomerRow } from "@/da/postgres/mappers";

export function createCustomerRepository(): CustomerRepository {
  const sql = getSql();

  return {
    async getByPhone(phoneE164) {
      const rows = await sql<CustomerRow[]>`
        select id, phone_e164, created_at
        from public.customers
        where phone_e164 = ${phoneE164}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapCustomer(row);
    },

    async getById(id) {
      const rows = await sql<CustomerRow[]>`
        select id, phone_e164, created_at
        from public.customers
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapCustomer(row);
    },

    async getOrCreateByPhone(phoneE164) {
      const rows = await sql<CustomerRow[]>`
        insert into public.customers (phone_e164)
        values (${phoneE164})
        on conflict (phone_e164) do update
          set phone_e164 = excluded.phone_e164
        returning id, phone_e164, created_at
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to upsert customer.");
      }
      return mapCustomer(row);
    },
  };
}
