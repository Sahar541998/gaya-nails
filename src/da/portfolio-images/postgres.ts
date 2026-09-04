import "server-only";

import { getSql } from "@/da/postgres/client";
import type { PortfolioImages } from "@/da/portfolio-images/portfolio-images";
import type { PortfolioImage } from "@/types/domain";

type PortfolioImageRow = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

function mapPortfolioImage(row: PortfolioImageRow): PortfolioImage {
  return {
    id: row.id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export function createPostgresPortfolioImages(): PortfolioImages {
  const sql = getSql();

  return {
    async list() {
      const rows = await sql<PortfolioImageRow[]>`
        select id, storage_path, alt_text, sort_order
        from public.portfolio_images
        order by sort_order, created_at
      `;
      return rows.map(mapPortfolioImage);
    },
  };
}
