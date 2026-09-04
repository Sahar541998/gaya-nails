import "server-only";

import type { SettingsRepository } from "@/da/contracts";
import { getSql } from "@/da/postgres/client";
import { mapSettings, type SettingsRow } from "@/da/postgres/mappers";

export function createSettingsRepository(): SettingsRepository {
  const sql = getSql();

  return {
    async get() {
      const rows = await sql<SettingsRow[]>`
        select timezone
        from public.business_settings
        where id = true
        limit 1
      `;
      const row = rows[0];
      if (row === undefined) {
        return { timezone: "Asia/Jerusalem" };
      }
      return mapSettings(row);
    },
  };
}
