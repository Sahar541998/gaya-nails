import "server-only";

import type { BusinessSettings } from "@/types/domain";

export type BusinessSettingsStore = {
  get(): Promise<BusinessSettings>;
};
