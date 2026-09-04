import "server-only";

import type { BusinessSettingsStore } from "@/da/business-settings/business-settings";
import { getSql } from "@/da/postgres/client";
import type { BusinessSettings } from "@/types/domain";

type BusinessSettingsRow = {
  timezone: string;
};

function mapBusinessSettings(row: BusinessSettingsRow): BusinessSettings {
  return { timezone: row.timezone };
}

export function createPostgresBusinessSettings(): BusinessSettingsStore {
  const sql = getSql();

  return {
    async get() {
      const rows = await sql<BusinessSettingsRow[]>`
        select timezone
        from public.business_settings
        where id = true
        limit 1
      `;
      const row = rows[0];
      if (row === undefined) {
        return { timezone: "Asia/Jerusalem" };
      }
      return mapBusinessSettings(row);
    },
  };
}
