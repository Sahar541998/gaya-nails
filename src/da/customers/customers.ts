import "server-only";

import type { Customer, CustomerId } from "@/types/domain";

export type CustomerContact = {
  displayName: string;
  email: string;
};

export type Customers = {
  getByPhone(phoneE164: string): Promise<Customer | null>;
  getById(id: CustomerId): Promise<Customer | null>;
  getOrCreateByPhone(phoneE164: string): Promise<Customer>;
  updateContact(id: CustomerId, contact: CustomerContact): Promise<Customer>;
};
