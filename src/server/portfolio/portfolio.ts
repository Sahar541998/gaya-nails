import "server-only";

import { getDataAccess } from "@/da";
import { ok, type Result } from "@/types/result";
import type { PortfolioImage } from "@/types/domain";

export async function listPortfolioImages(): Promise<
  Result<readonly PortfolioImage[]>
> {
  const images = await getDataAccess().portfolio.list();
  return ok(images);
}
