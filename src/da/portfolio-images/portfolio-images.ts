import "server-only";

import type { PortfolioImage } from "@/types/domain";

export type PortfolioImages = {
  list(): Promise<readonly PortfolioImage[]>;
};
