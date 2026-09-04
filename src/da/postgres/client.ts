import "server-only";

import postgres from "postgres";

import { getServerEnv } from "@/lib/env";

let sql: ReturnType<typeof postgres> | undefined;

export function getSql() {
  sql ??= postgres(getServerEnv().DATABASE_URL, {
    max: 10,
    prepare: false,
  });

  return sql;
}

export async function pingDatabase(): Promise<boolean> {
  const rows = await getSql()`select 1 as ok`;
  return rows[0]?.ok === 1;
}
