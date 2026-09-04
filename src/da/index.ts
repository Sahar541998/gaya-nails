import "server-only";

import { createPostgresAppointments } from "@/da/appointments/postgres";
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
    sms: createSmsVerifier(),
  };
}

let dataAccess: DataAccess | undefined;

export function getDataAccess(): DataAccess {
  dataAccess ??= createDataAccess();
  return dataAccess;
}
