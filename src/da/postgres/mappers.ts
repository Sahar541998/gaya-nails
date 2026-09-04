import "server-only";

import type {
  Appointment,
  AppointmentStatus,
  BusinessSettings,
  Customer,
  PortfolioImage,
  Service,
} from "@/types/domain";

export type CustomerRow = {
  id: string;
  phone_e164: string;
  created_at: Date | string;
};

export type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  is_active: boolean;
};

export type AppointmentRow = {
  id: string;
  customer_id: string;
  service_id: string;
  starts_at: Date | string;
  ends_at: Date | string;
  status: AppointmentStatus;
};

export type PortfolioRow = {
  id: string;
  storage_path: string;
  alt_text: string;
  sort_order: number;
};

export type SettingsRow = {
  timezone: string;
};

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function mapCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    phoneE164: row.phone_e164,
    createdAt: toIso(row.created_at),
  };
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    isActive: row.is_active,
  };
}

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    customerId: row.customer_id,
    serviceId: row.service_id,
    startsAt: toIso(row.starts_at),
    endsAt: toIso(row.ends_at),
    status: row.status,
  };
}

export function mapPortfolio(row: PortfolioRow): PortfolioImage {
  return {
    id: row.id,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
  };
}

export function mapSettings(row: SettingsRow): BusinessSettings {
  return { timezone: row.timezone };
}
