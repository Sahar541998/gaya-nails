export type CustomerId = string;
export type AppointmentId = string;
export type ServiceId = string;
export type PortfolioImageId = string;

export type Customer = {
  id: CustomerId;
  phoneE164: string;
  createdAt: string;
};

export type Service = {
  id: ServiceId;
  name: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
};

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export type Appointment = {
  id: AppointmentId;
  customerId: CustomerId;
  serviceId: ServiceId;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
};

export type PortfolioImage = {
  id: PortfolioImageId;
  storagePath: string;
  altText: string;
  sortOrder: number;
};

export type BusinessSettings = {
  timezone: string;
};
