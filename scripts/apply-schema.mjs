import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import postgres from "postgres";

const originalEnvKeys = new Set(Object.keys(process.env));

loadEnvFile(path.resolve(".env"));
loadEnvFile(path.resolve(".env.local"));

const databaseUrl = firstNonEmpty(
  process.env.DATABASE_URL,
  process.env.POSTGRES_URL,
);

if (databaseUrl === undefined) {
  if (process.env.VERCEL === "1") {
    console.error("DATABASE_URL is required on Vercel to apply schema.");
    process.exit(1);
  }
  console.warn("Skipping schema apply (DATABASE_URL is not set).");
  process.exit(0);
}

const sql = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  onnotice: () => {},
});

try {
  const dbFiles = await listSqlFiles(path.resolve("db"));
  // Files must run in numeric order; later SQL depends on earlier tables.
  for (const filePath of dbFiles) {
    // eslint-disable-next-line no-await-in-loop -- schema files are ordered
    await applySqlFile(sql, filePath);
  }

  const storageReady = await schemaExists(sql, "storage");
  if (storageReady) {
    await applySqlFile(
      sql,
      path.resolve("supabase/migrations/0002_storage.sql"),
    );
  } else {
    console.info("Skipping storage schema (storage schema is not present).");
  }

  console.info("Schema apply complete.");
} finally {
  await sql.end({ timeout: 5 });
}

/**
 * @param {string} filePath
 */
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) {
      continue;
    }
    const trimmed = line.startsWith("export ")
      ? line.slice("export ".length).trim()
      : line;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (originalEnvKeys.has(key)) {
      continue;
    }
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/**
 * @param {...(string | undefined)} values
 * @returns {string | undefined}
 */
function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
}

/**
 * @param {string} directory
 * @returns {Promise<string[]>}
 */
async function listSqlFiles(directory) {
  const names = await readdir(directory);
  return names
    .filter((name) => name.endsWith(".sql"))
    .toSorted((a, b) => a.localeCompare(b))
    .map((name) => path.join(directory, name));
}

/**
 * @param {ReturnType<typeof postgres>} client
 * @param {string} schemaName
 */
async function schemaExists(client, schemaName) {
  const rows = await client`
    select 1 as ok
    from information_schema.schemata
    where schema_name = ${schemaName}
    limit 1
  `;
  return rows.length > 0;
}

/**
 * @param {ReturnType<typeof postgres>} client
 * @param {string} filePath
 */
async function applySqlFile(client, filePath) {
  const contents = await readFile(filePath, "utf8");
  console.info(`Applying ${path.relative(process.cwd(), filePath)}`);
  await client.unsafe(contents);
}
