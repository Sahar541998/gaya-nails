import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { BookingSessions } from "@/da/booking-sessions/booking-sessions";
import { getSql } from "@/da/postgres/client";
import { toIso } from "@/da/postgres/iso";
import type { BookingSession } from "@/types/domain";

type SessionRow = {
  customer_id: string;
  expires_at: Date | string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function mapSession(row: SessionRow): BookingSession {
  return {
    customerId: row.customer_id,
    expiresAt: toIso(row.expires_at),
  };
}

export function createPostgresBookingSessions(): BookingSessions {
  const sql = getSql();

  return {
    async create(customerId, expiresAt) {
      const token = randomBytes(32).toString("base64url");
      const rows = await sql<SessionRow[]>`
        insert into public.booking_sessions (customer_id, token_hash, expires_at)
        values (${customerId}, ${hashToken(token)}, ${expiresAt})
        returning customer_id, expires_at
      `;
      const row = rows[0];
      if (row === undefined) {
        throw new Error("Failed to create booking session.");
      }
      return { ...mapSession(row), token };
    },

    async getByToken(token) {
      const rows = await sql<SessionRow[]>`
        select customer_id, expires_at
        from public.booking_sessions
        where token_hash = ${hashToken(token)}
        limit 1
      `;
      const row = rows[0];
      return row === undefined ? null : mapSession(row);
    },
  };
}
