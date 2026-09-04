import "server-only";

import type { CustomerContact, Customers } from "@/da/customers/customers";
import { getSql } from "@/da/postgres/client";
import { toIso } from "@/da/postgres/iso";
import type { Customer } from "@/types/domain";

type CustomerRow = {
  id: string;
  phone_e164: string;
  display_name: string;
  email: string;
  created_at: Date | string;
};

function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    phoneE164: row.phone_e164,
    displayName: row.display_name,
    email: row.email,
    createdAt: toIso(row.created_at),
  };
}

export function createPostgresCustomers(): Customers {
  const sql = getSql();

  return {
    async getByPhone(phoneE164) {
      const rows = await sql<CustomerRow[]>`
        select id, phone_e164, display_name, email, created_at
        from public.customers
        where phone_e164 = ${phoneE164}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapCustomer(row);
    },

    async getById(id) {
      const rows = await sql<CustomerRow[]>`
        select id, phone_e164, display_name, email, created_at
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
        returning id, phone_e164, display_name, email, created_at
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to upsert customer.");
      }
      return mapCustomer(row);
    },

    async updateContact(id, contact: CustomerContact) {
      const rows = await sql<CustomerRow[]>`
        update public.customers
        set
          display_name = ${contact.displayName},
          email = ${contact.email}
        where id = ${id}
        returning id, phone_e164, display_name, email, created_at
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to update customer.");
      }
      return mapCustomer(row);
    },
  };
}
