import "server-only";

import type { Appointments } from "@/da/appointments/appointments";
import type { BusinessSettingsStore } from "@/da/business-settings/business-settings";
import type { Customers } from "@/da/customers/customers";
import type { PortfolioImages } from "@/da/portfolio-images/portfolio-images";
import type { Services } from "@/da/services/services";
import type { SmsVerifier } from "@/da/sms/sms-verifier";

export type DataAccess = {
  customers: Customers;
  services: Services;
  appointments: Appointments;
  portfolioImages: PortfolioImages;
  businessSettings: BusinessSettingsStore;
  sms: SmsVerifier;
};
