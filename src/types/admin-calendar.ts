import type { AppointmentStatus } from "@/types/domain";

export type CalendarView = "month" | "week" | "day";

export type CalendarAppointmentEvent = {
  kind: "appointment";
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  note: string;
  serviceId: string;
};

export type CalendarBusyEvent = {
  kind: "busy";
  id: string;
  startsAt: string;
  endsAt: string;
  note: string;
};

export type CalendarClosedEvent = {
  kind: "closed";
  id: string;
  startsAt: string;
  endsAt: string;
};

export type CalendarEvent =
  CalendarAppointmentEvent | CalendarBusyEvent | CalendarClosedEvent;
