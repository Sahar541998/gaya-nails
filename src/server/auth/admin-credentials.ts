import { secretsEqual } from "@/server/auth/admin-jwt";

function envValue(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    return undefined;
  }
  return value;
}

export function normalizeAdminUsername(value: string): string {
  return value.trim().toLowerCase();
}

export function getAdminUsername(): string | undefined {
  const username = envValue("ADMIN_USERNAME");
  if (username === undefined) {
    return undefined;
  }
  return normalizeAdminUsername(username);
}

export function getAdminPassword(): string | undefined {
  return envValue("ADMIN_PASSWORD");
}

export function getAdminJwtSecret(): string | undefined {
  return envValue("ADMIN_JWT_SECRET") ?? envValue("ADMIN_SESSION_SECRET");
}

export function isAdminPasswordAuthConfigured(): boolean {
  const username = getAdminUsername();
  const password = getAdminPassword();
  const secret = getAdminJwtSecret();
  return (
    username !== undefined &&
    password !== undefined &&
    secret !== undefined &&
    secret.length >= 16
  );
}

export function adminCredentialsMatch(
  username: string,
  password: string,
): boolean {
  const expectedUsername = getAdminUsername();
  const expectedPassword = getAdminPassword();
  if (expectedUsername === undefined || expectedPassword === undefined) {
    return false;
  }
  return (
    secretsEqual(normalizeAdminUsername(username), expectedUsername) &&
    secretsEqual(password, expectedPassword)
  );
}
