export type AppErrorCode =
  | "not_implemented"
  | "unauthorized"
  | "validation"
  | "rate_limited"
  | "unavailable"
  | "conflict"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_INACTIVE"
  | "BOOKING_DISABLED"
  | "INVALID_TIME"
  | "OUTSIDE_BUSINESS_HOURS"
  | "TIME_BLOCKED"
  | "SLOT_UNAVAILABLE"
  | "APPOINTMENT_NOT_FOUND"
  | "NOT_AUTHORIZED"
  | "APPOINTMENT_ALREADY_CANCELLED"
  | "APPOINTMENT_NOT_ACTIVE"
  | "SERVICE_IN_USE";

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
