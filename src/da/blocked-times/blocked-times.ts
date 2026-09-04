import "server-only";

import type { BlockedTime, BlockedTimeId } from "@/types/domain";

export type CreateBlockedTimeRecord = {
  startsAt: string;
  endsAt: string;
  note: string;
};

export type BlockedTimes = {
  listOverlapping(
    startsAt: string,
    endsAt: string,
  ): Promise<readonly BlockedTime[]>;
  getById(id: BlockedTimeId): Promise<BlockedTime | null>;
  create(input: CreateBlockedTimeRecord): Promise<BlockedTime>;
  update(
    id: BlockedTimeId,
    input: CreateBlockedTimeRecord,
  ): Promise<BlockedTime>;
  delete(id: BlockedTimeId): Promise<void>;
};
