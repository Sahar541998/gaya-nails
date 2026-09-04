import "server-only";

import { createPostgresAppointments } from "@/da/appointments/postgres";
import { createPostgresBlockedTimes } from "@/da/blocked-times/postgres";
import { createPostgresBookingSessions } from "@/da/booking-sessions/postgres";
import { createPostgresBusinessSettings } from "@/da/business-settings/postgres";
import { createPostgresCustomers } from "@/da/customers/postgres";
import type { DataAccess } from "@/da/data-access";
import { createPostgresPortfolioImages } from "@/da/portfolio-images/postgres";
import { createPostgresServices } from "@/da/services/postgres";
import { createDockerSmsVerifier } from "@/da/sms/docker";
import type { SmsVerifier } from "@/da/sms/sms-verifier";
import { createTwilioSmsVerifier } from "@/da/sms/twilio";
import { getServerEnv } from "@/lib/env";

function createSmsVerifier(): SmsVerifier {
  if (getServerEnv().SMS_DRIVER === "twilio") {
    return createTwilioSmsVerifier();
  }

  return createDockerSmsVerifier();
}

export function createDataAccess(): DataAccess {
  return {
    customers: createPostgresCustomers(),
    services: createPostgresServices(),
    appointments: createPostgresAppointments(),
    portfolioImages: createPostgresPortfolioImages(),
    businessSettings: createPostgresBusinessSettings(),
    blockedTimes: createPostgresBlockedTimes(),
    bookingSessions: createPostgresBookingSessions(),
    sms: createSmsVerifier(),
  };
}

let dataAccess: DataAccess | undefined;

export function getDataAccess(): DataAccess {
  dataAccess ??= createDataAccess();
  return dataAccess;
}

export { DaConflictError, DaNotFoundError } from "@/da/postgres/errors";
