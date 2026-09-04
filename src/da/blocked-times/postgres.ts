import "server-only";

import type { BlockedTimes } from "@/da/blocked-times/blocked-times";
import { getSql } from "@/da/postgres/client";
import { toIso } from "@/da/postgres/iso";
import type { BlockedTime } from "@/types/domain";

type BlockedTimeRow = {
  id: string;
  starts_at: Date | string;
  ends_at: Date | string;
};

function mapBlockedTime(row: BlockedTimeRow): BlockedTime {
  return {
    id: row.id,
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
  };
}

export function createPostgresBlockedTimes(): BlockedTimes {
  const sql = getSql();

  return {
    async listOverlapping(startsAt, endsAt) {
      const rows = await sql<BlockedTimeRow[]>`
        select id, starts_at, ends_at
        from public.blocked_times
        where starts_at < ${endsAt}
          and ends_at > ${startsAt}
        order by starts_at
      `;
      return rows.map(mapBlockedTime);
    },

    async getById(id) {
      const rows = await sql<BlockedTimeRow[]>`
        select id, starts_at, ends_at
        from public.blocked_times
        where id = ${id}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapBlockedTime(row);
    },

    async create(startsAt, endsAt) {
      const rows = await sql<BlockedTimeRow[]>`
        insert into public.blocked_times (starts_at, ends_at)
        values (${startsAt}, ${endsAt})
        returning id, starts_at, ends_at
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to create blocked time.");
      }
      return mapBlockedTime(row);
    },
  };
}
