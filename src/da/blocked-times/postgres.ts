import "server-only";

import type { BlockedTimes } from "@/da/blocked-times/blocked-times";
import { getSql } from "@/da/postgres/client";
import { DaNotFoundError } from "@/da/postgres/errors";
import { toIso } from "@/da/postgres/iso";
import type { BlockedTime } from "@/types/domain";

type BlockedTimeRow = {
  id: string;
  starts_at: Date | string;
  ends_at: Date | string;
  note: string;
};

function mapBlockedTime(row: BlockedTimeRow): BlockedTime {
  return {
    id: row.id,
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
    note: row.note,
  };
}

export function createPostgresBlockedTimes(): BlockedTimes {
  const sql = getSql();

  return {
    async listOverlapping(startsAt, endsAt) {
      const rows = await sql<BlockedTimeRow[]>`
        select id, starts_at, ends_at, note
        from public.blocked_times
        where starts_at < ${endsAt}
          and ends_at > ${startsAt}
        order by starts_at
      `;
      return rows.map(mapBlockedTime);
    },

    async getById(id) {
      const rows = await sql<BlockedTimeRow[]>`
        select id, starts_at, ends_at, note
        from public.blocked_times
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapBlockedTime(row);
    },

    async create(input) {
      const rows = await sql<BlockedTimeRow[]>`
        insert into public.blocked_times (starts_at, ends_at, note)
        values (${input.startsAt}, ${input.endsAt}, ${input.note})
        returning id, starts_at, ends_at, note
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to create blocked time.");
      }
      return mapBlockedTime(row);
    },

    async update(id, input) {
      const rows = await sql<BlockedTimeRow[]>`
        update public.blocked_times
        set
          starts_at = ${input.startsAt},
          ends_at = ${input.endsAt},
          note = ${input.note},
          updated_at = now()
        where id = ${id}
        returning id, starts_at, ends_at, note
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new DaNotFoundError("Blocked time not found.");
      }
      return mapBlockedTime(row);
    },

    async delete(id) {
      const rows = await sql<{ id: string }[]>`
        delete from public.blocked_times
        where id = ${id}
        returning id
      `;
      if (rows[0] === undefined) {
        throw new DaNotFoundError("Blocked time not found.");
      }
    },
  };
}
