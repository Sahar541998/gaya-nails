import "server-only";

import type {
  Appointment,
  AppointmentId,
  AppointmentStatus,
  CustomerId,
  ServiceId,
} from "@/types/domain";

export type CreateAppointmentRecord = {
  customerId: CustomerId;
  serviceId: ServiceId;
  startsAt: string;
  endsAt: string;
};

export type Appointments = {
  getById(id: AppointmentId): Promise<Appointment | null>;
  listInRange(
    startsAt: string,
    endsAt: string,
  ): Promise<readonly Appointment[]>;
  create(input: CreateAppointmentRecord): Promise<Appointment>;
  updateStatus(
    id: AppointmentId,
    status: AppointmentStatus,
  ): Promise<Appointment>;
};
