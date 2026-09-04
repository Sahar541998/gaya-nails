export type AppErrorCode =
  | "not_implemented"
  | "unauthorized"
  | "validation"
  | "rate_limited"
  | "unavailable"
  | "conflict";

export type AppError = {
  code: AppErrorCode;
  message: string;
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err(error: AppError): Result<never> {
  return { ok: false, error };
}
