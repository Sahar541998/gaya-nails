import "server-only";

import { getDataAccess } from "@/da";
import type { BusinessSettings } from "@/types/domain";
import { ok, type Result } from "@/types/result";

export async function getStudioSettings(): Promise<
  Result<
    Pick<BusinessSettings, "studioName" | "locationLabel" | "instagramUrl">
  >
> {
  const settings = await getDataAccess().businessSettings.get();
  return ok({
    studioName: settings.studioName,
    locationLabel: settings.locationLabel,
    instagramUrl: settings.instagramUrl,
  });
}
