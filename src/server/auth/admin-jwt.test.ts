import { describe, expect, it } from "vitest";

import {
  secretsEqual,
  signAdminJwt,
  verifyAdminJwt,
} from "@/server/auth/admin-jwt";
import { adminCredentialsMatch } from "@/server/auth/admin-credentials";

const secret = "local-dev-only-change-me";

describe("admin JWT", () => {
  it("signs and verifies a token", () => {
    const token = signAdminJwt(
      { sub: "studio-admin", username: "gaya" },
      secret,
    );
    const claims = verifyAdminJwt(token, secret);
    expect(claims?.sub).toBe("studio-admin");
    expect(claims?.username).toBe("gaya");
  });

  it("rejects a tampered token", () => {
    const token = signAdminJwt(
      { sub: "studio-admin", username: "gaya" },
      secret,
    );
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}x.${parts[2]}`;
    expect(verifyAdminJwt(tampered, secret)).toBeNull();
  });

  it("rejects an expired token", () => {
    const token = signAdminJwt(
      { sub: "studio-admin", username: "gaya" },
      secret,
      new Date("2020-01-01T00:00:00.000Z"),
    );
    expect(
      verifyAdminJwt(token, secret, new Date("2026-09-04T00:00:00.000Z")),
    ).toBeNull();
  });

  it("rejects the none algorithm", () => {
    const payload = Buffer.from(
      JSON.stringify({
        sub: "studio-admin",
        username: "gaya",
        iat: 1,
        exp: 4102444800,
      }),
    ).toString("base64url");
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    expect(verifyAdminJwt(`${header}.${payload}.`, secret)).toBeNull();
  });
});

describe("admin credentials", () => {
  it("accepts the configured username and password", () => {
    process.env.ADMIN_USERNAME = "gaya";
    process.env.ADMIN_PASSWORD = "gaya-local";
    process.env.ADMIN_JWT_SECRET = secret;
    expect(adminCredentialsMatch("Gaya", "gaya-local")).toBe(true);
    expect(adminCredentialsMatch("gaya", "wrong")).toBe(false);
    expect(adminCredentialsMatch("other", "gaya-local")).toBe(false);
  });

  it("compares secrets without leaking length via equality", () => {
    expect(secretsEqual("abc", "abc")).toBe(true);
    expect(secretsEqual("abc", "abd")).toBe(false);
  });
});
