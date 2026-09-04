import "server-only";

import { err, type Result } from "@/types/result";
import type { AppErrorCode } from "@/types/result";

export function notImplemented(operation: string): Result<never> {
  return err({
    code: "not_implemented",
    message: `${operation} is not available yet.`,
  });
}

export function validationError(message: string): Result<never> {
  return err({
    code: "validation",
    message,
  });
}

export function unauthorizedError(
  message = "You are not allowed to do that.",
): Result<never> {
  return err({
    code: "unauthorized",
    message,
  });
}

export function domainError(
  code: AppErrorCode,
  message: string,
): Result<never> {
  return err({ code, message });
}
