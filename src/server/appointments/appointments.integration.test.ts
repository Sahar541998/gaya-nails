import { randomUUID } from "node:crypto";

import { DateTime } from "luxon";
import { afterEach, describe, expect, it } from "vitest";

import { getDataAccess } from "@/da";
import { getSql } from "@/da/postgres/client";
import { BUSINESS_TIME_ZONE, toUtcIso } from "@/lib/business-time";
import { cancelAppointment } from "@/server/appointments/cancel-appointment";
import { createAppointment } from "@/server/appointments/create-appointment";
import { getAppointment } from "@/server/appointments/get-appointment";
import { rescheduleAppointment } from "@/server/appointments/reschedule-appointment";
import { getAvailableSlots } from "@/server/availability/get-available-slots";
import { submitCustomerBooking } from "@/server/booking/submit-customer-booking";

const sql = getSql();
const da = getDataAccess();

const createdServiceIds: string[] = [];
const createdCustomerIds: string[] = [];
const createdAppointmentIds: string[] = [];
const createdBlockIds: string[] = [];

const now = DateTime.fromObject(
  { year: 2099, month: 6, day: 16, hour: 8, minute: 0 },
  { zone: BUSINESS_TIME_ZONE },
).toUTC();

function localStart(hour: number, minute = 0): string {
  return toUtcIso(
    DateTime.fromObject(
      { year: 2099, month: 6, day: 16, hour, minute },
      { zone: BUSINESS_TIME_ZONE },
    ),
  );
}

async function insertService(input: {
  durationMinutes: number;
  isActive?: boolean;
  priceCents?: number;
}) {
  const rows = await sql<{ id: string }[]>`
    insert into public.services (name, duration_minutes, price_cents, is_active)
    values (
      ${`Test ${randomUUID()}`},
      ${input.durationMinutes},
      ${input.priceCents ?? 15000},
      ${input.isActive ?? true}
    )
    returning id
  `;
  const id = rows[0]?.id;
  if (id === undefined) {
    throw new Error("Failed to insert service.");
  }
  createdServiceIds.push(id);
  return id;
}

async function verifiedCustomer() {
  const phone = `+97250${String(Math.floor(1000000 + Math.random() * 8999999))}`;
  const customer = await da.customers.getOrCreateByPhone(phone);
  createdCustomerIds.push(customer.id);
  const session = await da.bookingSessions.create(
    customer.id,
    "2100-01-01T00:00:00.000Z",
  );
  return { customer, token: session.token };
}

afterEach(async () => {
  if (createdAppointmentIds.length > 0) {
    await sql`delete from public.appointments where id = any(${createdAppointmentIds})`;
    createdAppointmentIds.length = 0;
  }
  if (createdBlockIds.length > 0) {
    await sql`delete from public.blocked_times where id = any(${createdBlockIds})`;
    createdBlockIds.length = 0;
  }
  if (createdCustomerIds.length > 0) {
    await sql`delete from public.booking_sessions where customer_id = any(${createdCustomerIds})`;
    await sql`delete from public.customers where id = any(${createdCustomerIds})`;
    createdCustomerIds.length = 0;
  }
  if (createdServiceIds.length > 0) {
    await sql`delete from public.services where id = any(${createdServiceIds})`;
    createdServiceIds.length = 0;
  }
});

describe("appointment domain", () => {
  it("returns an available slot inside business hours", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const slots = await getAvailableSlots({
      serviceId,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(9))).toBe(
      true,
    );
  });

  it("does not offer a slot outside business hours", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const slots = await getAvailableSlots({
      serviceId,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(20))).toBe(
      false,
    );
  });

  it("uses the service duration for the appointment end time", async () => {
    const serviceId = await insertService({
      durationMinutes: 120,
      priceCents: 18000,
    });
    const { token } = await verifiedCustomer();
    const created = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdAppointmentIds.push(created.data.id);
    expect(created.data.endsAt).toBe(localStart(11));
    expect(created.data.priceCentsAtBooking).toBe(18000);
    expect(created.data.serviceNameAtBooking.length).toBeGreaterThan(0);
  });

  it("rejects a slot outside business hours on create", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const { token } = await verifiedCustomer();
    const created = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(20),
      now: now.toJSDate(),
    });
    expect(created.ok).toBe(false);
    if (created.ok) {
      return;
    }
    expect(created.error.code).toBe("OUTSIDE_BUSINESS_HOURS");
  });

  it("rejects a slot overlapping a blocked time", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const block = await da.blockedTimes.create({
      startsAt: localStart(10),
      endsAt: localStart(12),
      note: "",
    });
    createdBlockIds.push(block.id);
    const { token } = await verifiedCustomer();
    const created = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(10),
      now: now.toJSDate(),
    });
    expect(created.ok).toBe(false);
    if (created.ok) {
      return;
    }
    expect(created.error.code).toBe("TIME_BLOCKED");
  });

  it("rejects a slot overlapping a confirmed appointment", async () => {
    const serviceId = await insertService({ durationMinutes: 120 });
    const first = await verifiedCustomer();
    const second = await verifiedCustomer();
    const booked = await createAppointment({
      actor: { kind: "customer", verificationToken: first.token },
      serviceId,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (booked.ok) {
      createdAppointmentIds.push(booked.data.id);
    }
    const conflict = await createAppointment({
      actor: { kind: "customer", verificationToken: second.token },
      serviceId,
      startsAt: localStart(10),
      now: now.toJSDate(),
    });
    expect(conflict.ok).toBe(false);
    if (conflict.ok) {
      return;
    }
    expect(conflict.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("lets a cancelled appointment free the slot", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const owner = await verifiedCustomer();
    const booked = await createAppointment({
      actor: { kind: "customer", verificationToken: owner.token },
      serviceId,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    createdAppointmentIds.push(booked.data.id);
    const cancelled = await cancelAppointment({
      actor: { kind: "customer", verificationToken: owner.token },
      appointmentId: booked.data.id,
      now: now.toJSDate(),
    });
    expect(cancelled.ok).toBe(true);
    const slots = await getAvailableSlots({
      serviceId,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(9))).toBe(
      true,
    );
  });

  it("does not book an inactive service", async () => {
    const serviceId = await insertService({
      durationMinutes: 60,
      isActive: false,
    });
    const { token } = await verifiedCustomer();
    const created = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    expect(created.ok).toBe(false);
    if (created.ok) {
      return;
    }
    expect(created.error.code).toBe("SERVICE_INACTIVE");
  });

  it("does not create an appointment in the past", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const { token } = await verifiedCustomer();
    const created = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(9),
      now: DateTime.fromObject(
        { year: 2099, month: 6, day: 16, hour: 12 },
        { zone: BUSINESS_TIME_ZONE },
      )
        .toUTC()
        .toJSDate(),
    });
    expect(created.ok).toBe(false);
    if (created.ok) {
      return;
    }
    expect(created.error.code).toBe("INVALID_TIME");
  });

  it("prevents double-booking when two creates race", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const first = await verifiedCustomer();
    const second = await verifiedCustomer();
    const results = await Promise.all([
      createAppointment({
        actor: { kind: "customer", verificationToken: first.token },
        serviceId,
        startsAt: localStart(13),
        now: now.toJSDate(),
      }),
      createAppointment({
        actor: { kind: "customer", verificationToken: second.token },
        serviceId,
        startsAt: localStart(13),
        now: now.toJSDate(),
      }),
    ]);
    const successes = results.filter((result) => result.ok);
    const failures = results.filter((result) => !result.ok);
    for (const result of successes) {
      if (result.ok) {
        createdAppointmentIds.push(result.data.id);
      }
    }
    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    if (failures[0] && !failures[0].ok) {
      expect(failures[0].error.code).toBe("SLOT_UNAVAILABLE");
    }
  });

  it("does not let a customer cancel someone else's appointment", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const owner = await verifiedCustomer();
    const other = await verifiedCustomer();
    const booked = await createAppointment({
      actor: { kind: "customer", verificationToken: owner.token },
      serviceId,
      startsAt: localStart(14),
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    createdAppointmentIds.push(booked.data.id);
    const cancelled = await cancelAppointment({
      actor: { kind: "customer", verificationToken: other.token },
      appointmentId: booked.data.id,
      now: now.toJSDate(),
    });
    expect(cancelled.ok).toBe(false);
    if (cancelled.ok) {
      return;
    }
    expect(cancelled.error.code).toBe("NOT_AUTHORIZED");
  });

  it("rejects rescheduling onto a taken slot", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const first = await verifiedCustomer();
    const second = await verifiedCustomer();
    const a = await createAppointment({
      actor: { kind: "customer", verificationToken: first.token },
      serviceId,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    const b = await createAppointment({
      actor: { kind: "customer", verificationToken: second.token },
      serviceId,
      startsAt: localStart(11),
      now: now.toJSDate(),
    });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) {
      return;
    }
    createdAppointmentIds.push(a.data.id, b.data.id);
    const moved = await rescheduleAppointment({
      actor: { kind: "customer", verificationToken: first.token },
      appointmentId: a.data.id,
      startsAt: localStart(11),
      now: now.toJSDate(),
    });
    expect(moved.ok).toBe(false);
    if (moved.ok) {
      return;
    }
    expect(moved.error.code).toBe("SLOT_UNAVAILABLE");
  });

  it("returns the customer's own appointment and hides others", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const owner = await verifiedCustomer();
    const other = await verifiedCustomer();
    const booked = await createAppointment({
      actor: { kind: "customer", verificationToken: owner.token },
      serviceId,
      startsAt: localStart(15),
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    createdAppointmentIds.push(booked.data.id);
    const own = await getAppointment({
      actor: { kind: "customer", verificationToken: owner.token },
      appointmentId: booked.data.id,
      now: now.toJSDate(),
    });
    const hidden = await getAppointment({
      actor: { kind: "customer", verificationToken: other.token },
      appointmentId: booked.data.id,
      now: now.toJSDate(),
    });
    expect(own.ok).toBe(true);
    expect(hidden.ok).toBe(false);
    if (hidden.ok) {
      return;
    }
    expect(hidden.error.code).toBe("NOT_AUTHORIZED");
  });

  it("persists customer details and a note from the public booking flow", async () => {
    const serviceId = await insertService({
      durationMinutes: 60,
      priceCents: 12000,
    });
    const { customer, token } = await verifiedCustomer();
    const booked = await submitCustomerBooking({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(9),
      displayName: "Maya Cohen",
      email: "maya@example.com",
      phone: customer.phoneE164,
      note: "Almond shape, dusty rose",
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    const overlapping = await da.appointments.listConfirmedOverlapping(
      localStart(9),
      localStart(10),
    );
    const appointmentId = overlapping[0]?.id;
    if (appointmentId !== undefined) {
      createdAppointmentIds.push(appointmentId);
    }
    expect(booked.data.serviceName.length).toBeGreaterThan(0);
    expect(booked.data.priceCents).toBe(12000);
    expect(booked.data.durationMinutes).toBe(60);
    expect(booked.data.note).toBe("Almond shape, dusty rose");
    const stored = await da.customers.getById(customer.id);
    expect(stored?.displayName).toBe("Maya Cohen");
    expect(stored?.email).toBe("maya@example.com");
  });

  it("does not book with an unverified session", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const booked = await submitCustomerBooking({
      actor: { kind: "customer", verificationToken: "not-a-real-token" },
      serviceId,
      startsAt: localStart(9),
      displayName: "Maya Cohen",
      email: "maya@example.com",
      phone: "+972501234567",
      note: "",
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(false);
  });

  it("does not book when the phone does not match the verified session", async () => {
    const serviceId = await insertService({ durationMinutes: 60 });
    const { token } = await verifiedCustomer();
    const booked = await submitCustomerBooking({
      actor: { kind: "customer", verificationToken: token },
      serviceId,
      startsAt: localStart(9),
      displayName: "Maya Cohen",
      email: "maya@example.com",
      phone: "+972509999999",
      note: "",
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(false);
  });
});
