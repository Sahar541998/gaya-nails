import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("schema files", () => {
  const dbDir = path.resolve("db");
  const names = readdirSync(dbDir)
    .filter((name) => name.endsWith(".sql"))
    .toSorted((a, b) => a.localeCompare(b));

  it("applies numbered files in order", () => {
    expect(names[0]).toBe("001_extensions.sql");
    expect(names).toContain("006_business_settings.sql");
    expect(names.at(-1)).toBe("010_admin_ops.sql");
  });

  it("can add the overlap constraint more than once", () => {
    const sql = readFileSync(path.join(dbDir, "004_appointments.sql"), "utf8");
    expect(sql).toContain("appointments_no_overlap");
    expect(sql).toContain("if not exists");
  });
});
