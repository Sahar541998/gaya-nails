import "server-only";

import { getDataAccess } from "@/da";
import { validationError } from "@/lib/errors";
import { parsePhoneE164 } from "@/lib/phone";
import type { Customer } from "@/types/domain";
import { ok, type Result } from "@/types/result";

export async function getCustomerByPhone(
  phone: string,
): Promise<Result<Customer | null>> {
  const parsedPhone = parsePhoneE164(phone);
  if (!parsedPhone.success) {
    return validationError("Enter a valid phone number.");
  }

  const customer = await getDataAccess().customers.getByPhone(parsedPhone.data);
  return ok(customer);
}

export async function getOrCreateCustomerByPhone(
  phone: string,
): Promise<Result<Customer>> {
  const parsedPhone = parsePhoneE164(phone);
  if (!parsedPhone.success) {
    return validationError("Enter a valid phone number.");
  }

  const customer = await getDataAccess().customers.getOrCreateByPhone(
    parsedPhone.data,
  );
  return ok(customer);
}
