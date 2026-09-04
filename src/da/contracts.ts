import type {
  Appointment,
  AppointmentId,
  AppointmentStatus,
  BusinessSettings,
  Customer,
  CustomerId,
  PortfolioImage,
  Service,
  ServiceId,
} from "@/types/domain";

export type CustomerRepository = {
  getByPhone(phoneE164: string): Promise<Customer | null>;
  getById(id: CustomerId): Promise<Customer | null>;
  getOrCreateByPhone(phoneE164: string): Promise<Customer>;
};

export type ServiceRepository = {
  listActive(): Promise<readonly Service[]>;
  getById(id: ServiceId): Promise<Service | null>;
};

export type CreateAppointmentInput = {
  customerId: CustomerId;
  serviceId: ServiceId;
  startsAt: string;
  endsAt: string;
};

export type AppointmentRepository = {
  getById(id: AppointmentId): Promise<Appointment | null>;
  listInRange(
    startsAt: string,
    endsAt: string,
  ): Promise<readonly Appointment[]>;
  create(input: CreateAppointmentInput): Promise<Appointment>;
  updateStatus(
    id: AppointmentId,
    status: AppointmentStatus,
  ): Promise<Appointment>;
};

export type PortfolioRepository = {
  list(): Promise<readonly PortfolioImage[]>;
};

export type SettingsRepository = {
  get(): Promise<BusinessSettings>;
};

export type SmsVerifier = {
  send(phoneE164: string): Promise<void>;
  check(phoneE164: string, code: string): Promise<boolean>;
};

export type DataAccess = {
  customers: CustomerRepository;
  services: ServiceRepository;
  appointments: AppointmentRepository;
  portfolio: PortfolioRepository;
  settings: SettingsRepository;
  sms: SmsVerifier;
};
