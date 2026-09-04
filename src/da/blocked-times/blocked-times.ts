import "server-only";

import type { BlockedTime, BlockedTimeId } from "@/types/domain";

export type BlockedTimes = {
  listOverlapping(
    startsAt: string,
    endsAt: string,
  ): Promise<readonly BlockedTime[]>;
  getById(id: BlockedTimeId): Promise<BlockedTime | null>;
  create(startsAt: string, endsAt: string): Promise<BlockedTime>;
};
