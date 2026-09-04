import "server-only";

export class DaConflictError extends Error {
  override readonly name = "DaConflictError";

  constructor(message = "The requested change conflicts with existing data.") {
    super(message);
  }
}

export class DaNotFoundError extends Error {
  override readonly name = "DaNotFoundError";

  constructor(message = "The requested record was not found.") {
    super(message);
  }
}

export function isPostgresError(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  );
}

export function rethrowMappedPostgresError(error: unknown): never {
  if (
    isPostgresError(error) &&
    (error.code === "23P01" || error.code === "23505")
  ) {
    throw new DaConflictError();
  }

  throw error;
}
