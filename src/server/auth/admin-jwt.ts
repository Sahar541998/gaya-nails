import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_JWT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const ADMIN_COOKIE_NAME = "gaya_admin";

export type AdminJwtClaims = {
  sub: string;
  username: string;
  iat: number;
  exp: number;
};

function utf8(value: string): Buffer {
  return Buffer.from(value, "utf8");
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJson(value: string): unknown {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}

export function secretsEqual(left: string, right: string): boolean {
  const digestLeft = createHmac("sha256", "gaya-admin-compare")
    .update(utf8(left))
    .digest();
  const digestRight = createHmac("sha256", "gaya-admin-compare")
    .update(utf8(right))
    .digest();
  return timingSafeEqual(digestLeft, digestRight);
}

export function signAdminJwt(
  input: { sub: string; username: string },
  secret: string,
  now = new Date(),
): string {
  const iat = Math.floor(now.getTime() / 1000);
  const header = encodeJson({ alg: "HS256", typ: "JWT" });
  const payload = encodeJson({
    sub: input.sub,
    username: input.username,
    iat,
    exp: iat + ADMIN_JWT_MAX_AGE_SECONDS,
  });
  const signingInput = `${header}.${payload}`;
  const signature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  return `${signingInput}.${signature}`;
}

export function verifyAdminJwt(
  token: string,
  secret: string,
  now = new Date(),
): AdminJwtClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [headerPart, payloadPart, signature] = parts;
  if (
    headerPart === undefined ||
    payloadPart === undefined ||
    signature === undefined
  ) {
    return null;
  }

  let header: unknown;
  try {
    header = decodeJson(headerPart);
  } catch {
    return null;
  }
  if (
    typeof header !== "object" ||
    header === null ||
    !("alg" in header) ||
    header.alg !== "HS256"
  ) {
    return null;
  }

  const signingInput = `${headerPart}.${payloadPart}`;
  const expected = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  const left = utf8(signature);
  const right = utf8(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = decodeJson(payloadPart);
  } catch {
    return null;
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("sub" in payload) ||
    !("username" in payload) ||
    !("exp" in payload) ||
    !("iat" in payload) ||
    typeof payload.sub !== "string" ||
    typeof payload.username !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number"
  ) {
    return null;
  }

  if (payload.exp * 1000 <= now.getTime()) {
    return null;
  }

  return {
    sub: payload.sub,
    username: payload.username,
    iat: payload.iat,
    exp: payload.exp,
  };
}
