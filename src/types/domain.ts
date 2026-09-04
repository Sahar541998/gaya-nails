export type CustomerId = string;
export type AppointmentId = string;
export type ServiceId = string;
export type PortfolioImageId = string;
export type BlockedTimeId = string;

export type Customer = {
  id: CustomerId;
  phoneE164: string;
  displayName: string;
  email: string;
  createdAt: string;
};

export type Service = {
  id: ServiceId;
  name: string;
  durationMinutes: number;
  priceCents: number;
  isActive: boolean;
  shortDescription: string;
  sortOrder: number;
};

export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

export type Appointment = {
  id: AppointmentId;
  customerId: CustomerId;
  serviceId: ServiceId;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  serviceNameAtBooking: string;
  priceCentsAtBooking: number;
  note: string;
};

export type PortfolioImage = {
  id: PortfolioImageId;
  storagePath: string;
  altText: string;
  sortOrder: number;
};

export type DayHours = {
  open: string;
  close: string;
};

export type WeeklyHours = Partial<
  Record<"0" | "1" | "2" | "3" | "4" | "5" | "6", DayHours>
>;

export type BusinessSettings = {
  timezone: string;
  bookingEnabled: boolean;
  slotIntervalMinutes: number;
  weeklyHours: WeeklyHours;
  studioName: string;
  locationLabel: string;
  instagramUrl: string;
};

export type BlockedTime = {
  id: BlockedTimeId;
  startsAt: string;
  endsAt: string;
  note: string;
};

export type BookingSession = {
  customerId: CustomerId;
  expiresAt: string;
};
