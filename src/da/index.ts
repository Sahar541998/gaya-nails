import "server-only";

import type { DataAccess, SmsVerifier } from "@/da/contracts";
import { createAppointmentRepository } from "@/da/postgres/appointments";
import { createCustomerRepository } from "@/da/postgres/customers";
import { createPortfolioRepository } from "@/da/postgres/portfolio";
import { createServiceRepository } from "@/da/postgres/services";
import { createSettingsRepository } from "@/da/postgres/settings";
import { createConsoleSmsVerifier } from "@/da/sms/console";
import { createMockSmsVerifier } from "@/da/sms/mock";
import { createTwilioSmsVerifier } from "@/da/sms/twilio";
import { getServerEnv } from "@/lib/env";

function createSmsVerifier(): SmsVerifier {
  const driver = getServerEnv().SMS_DRIVER;
  if (driver === "twilio") {
    return createTwilioSmsVerifier();
  }
  if (driver === "mock") {
    return createMockSmsVerifier();
  }
  return createConsoleSmsVerifier();
}

export function createDataAccess(): DataAccess {
  return {
    customers: createCustomerRepository(),
    services: createServiceRepository(),
    appointments: createAppointmentRepository(),
    portfolio: createPortfolioRepository(),
    settings: createSettingsRepository(),
    sms: createSmsVerifier(),
  };
}

let dataAccess: DataAccess | undefined;

export function getDataAccess(): DataAccess {
  dataAccess ??= createDataAccess();
  return dataAccess;
}
