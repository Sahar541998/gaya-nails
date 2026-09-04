import "server-only";

import type { PortfolioRepository } from "@/da/contracts";
import { getSql } from "@/da/postgres/client";
import { mapPortfolio, type PortfolioRow } from "@/da/postgres/mappers";

export function createPortfolioRepository(): PortfolioRepository {
  const sql = getSql();

  return {
    async list() {
      const rows = await sql<PortfolioRow[]>`
        select id, storage_path, alt_text, sort_order
        from public.portfolio_images
        order by sort_order, created_at
      `;
      return rows.map(mapPortfolio);
    },
  };
}
