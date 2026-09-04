import { randomUUID } from "node:crypto";

import { DateTime } from "luxon";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { getDataAccess } from "@/da";
import { getSql } from "@/da/postgres/client";
import { BUSINESS_TIME_ZONE, toUtcIso } from "@/lib/business-time";
import { shekelsInputFromCents } from "@/lib/money";
import { createBusyBlock, deleteBusyBlock } from "@/server/admin/busy-blocks";
import { createAdminAppointment } from "@/server/admin/create-appointment";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/server/admin/services";
import { updateAdminSettings } from "@/server/admin/settings";
import { updateAdminAppointment } from "@/server/admin/update-appointment";
import { cancelAppointment } from "@/server/appointments/cancel-appointment";
import { createAppointment } from "@/server/appointments/create-appointment";
import { getAppointment } from "@/server/appointments/get-appointment";
import { rescheduleAppointment } from "@/server/appointments/reschedule-appointment";
import { getAvailableSlots } from "@/server/availability/get-available-slots";
import type { BusinessSettings } from "@/types/domain";

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

let settingsSnapshot: BusinessSettings;

beforeEach(async () => {
  settingsSnapshot = await da.businessSettings.get();
});

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
  await da.businessSettings.update(settingsSnapshot);
});

async function insertTrackedService() {
  const created = await createService({
    name: `Admin ${randomUUID()}`,
    durationMinutes: 60,
    priceShekels: "120",
    shortDescription: "Test service",
    isActive: true,
  });
  expect(created.ok).toBe(true);
  if (!created.ok) {
    throw new Error("Failed to create service.");
  }
  createdServiceIds.push(created.data.id);
  return created.data;
}

function uniquePhone(): string {
  return `+97250${String(Math.floor(1000000 + Math.random() * 8999999))}`;
}

async function verifiedCustomer() {
  const phone = uniquePhone();
  const customer = await da.customers.getOrCreateByPhone(phone);
  createdCustomerIds.push(customer.id);
  const session = await da.bookingSessions.create(
    customer.id,
    "2100-01-01T00:00:00.000Z",
  );
  return { customer, token: session.token, phone };
}

describe("admin busy blocks", () => {
  it("creates a valid busy block and removes public availability", async () => {
    const service = await insertTrackedService();
    const created = await createBusyBlock({
      startsAt: localStart(9),
      endsAt: localStart(11),
      note: "Private dentist",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdBlockIds.push(created.data.id);
    expect(created.data.note).toBe("Private dentist");

    const slots = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(9))).toBe(
      false,
    );
    expect(slots.data.some((slot) => slot.startsAt === localStart(10))).toBe(
      false,
    );
    expect(slots.data.some((slot) => slot.startsAt === localStart(11))).toBe(
      true,
    );
  });

  it("rejects an invalid range", async () => {
    const equal = await createBusyBlock({
      startsAt: localStart(9),
      endsAt: localStart(9),
    });
    expect(equal.ok).toBe(false);

    const backwards = await createBusyBlock({
      startsAt: localStart(11),
      endsAt: localStart(9),
    });
    expect(backwards.ok).toBe(false);
  });

  it("deletes a busy block and restores availability", async () => {
    const service = await insertTrackedService();
    const created = await createBusyBlock({
      startsAt: localStart(9),
      endsAt: localStart(12),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdBlockIds.push(created.data.id);

    const removed = await deleteBusyBlock(created.data.id);
    expect(removed.ok).toBe(true);
    createdBlockIds.length = 0;

    const slots = await getAvailableSlots({
      serviceId: service.id,
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

  it("covers multiple slots", async () => {
    const service = await insertTrackedService();
    const created = await createBusyBlock({
      startsAt: localStart(9),
      endsAt: localStart(12, 30),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdBlockIds.push(created.data.id);

    const slots = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(9))).toBe(
      false,
    );
    expect(
      slots.data.some((slot) => slot.startsAt === localStart(11, 30)),
    ).toBe(false);
  });

  it("does not remove in-hours slots when the block is outside business hours", async () => {
    const service = await insertTrackedService();
    const created = await createBusyBlock({
      startsAt: localStart(6),
      endsAt: localStart(8),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdBlockIds.push(created.data.id);

    const slots = await getAvailableSlots({
      serviceId: service.id,
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

  it("can overlap an appointment; both remain blocked for the public", async () => {
    const service = await insertTrackedService();
    const booked = await createAdminAppointment({
      serviceId: service.id,
      startsAt: localStart(9),
      displayName: "Dana",
      email: "dana@example.com",
      phone: uniquePhone(),
      note: "",
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    createdAppointmentIds.push(booked.data.id);
    createdCustomerIds.push(booked.data.customerId);

    const block = await createBusyBlock({
      startsAt: localStart(9, 30),
      endsAt: localStart(11),
      note: "Buffer",
    });
    expect(block.ok).toBe(true);
    if (!block.ok) {
      return;
    }
    createdBlockIds.push(block.data.id);

    const slots = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(true);
    if (!slots.ok) {
      return;
    }
    expect(slots.data.some((slot) => slot.startsAt === localStart(9))).toBe(
      false,
    );
    expect(slots.data.some((slot) => slot.startsAt === localStart(10))).toBe(
      false,
    );
  });
});

describe("admin services", () => {
  it("creates, updates price, duration, and description", async () => {
    const service = await insertTrackedService();
    const updated = await updateService({
      id: service.id,
      name: service.name,
      durationMinutes: 90,
      priceShekels: "130",
      shortDescription: "Updated copy",
      isActive: true,
      sortOrder: service.sortOrder,
    });
    expect(updated.ok).toBe(true);
    if (!updated.ok) {
      return;
    }
    expect(updated.data.priceCents).toBe(13000);
    expect(updated.data.durationMinutes).toBe(90);
    expect(updated.data.shortDescription).toBe("Updated copy");
    expect(shekelsInputFromCents(updated.data.priceCents)).toBe("130");
  });

  it("deactivates a service so it cannot be newly booked", async () => {
    const service = await insertTrackedService();
    const { token } = await verifiedCustomer();
    const existing = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId: service.id,
      startsAt: localStart(9),
      now: now.toJSDate(),
    });
    expect(existing.ok).toBe(true);
    if (!existing.ok) {
      return;
    }
    createdAppointmentIds.push(existing.data.id);

    const deactivated = await setServiceActive({
      id: service.id,
      isActive: false,
    });
    expect(deactivated.ok).toBe(true);

    const slots = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slots.ok).toBe(false);

    const fresh = await createAppointment({
      actor: { kind: "customer", verificationToken: token },
      serviceId: service.id,
      startsAt: localStart(14),
      now: now.toJSDate(),
    });
    expect(fresh.ok).toBe(false);

    const loaded = await getAppointment({
      actor: { kind: "admin" },
      appointmentId: existing.data.id,
      now: now.toJSDate(),
    });
    expect(loaded.ok).toBe(true);
  });

  it("refuses to delete a service that has appointments", async () => {
    const service = await insertTrackedService();
    const booked = await createAdminAppointment({
      serviceId: service.id,
      startsAt: localStart(9),
      displayName: "Maya",
      email: "maya@example.com",
      phone: uniquePhone(),
      note: "",
      now: now.toJSDate(),
    });
    expect(booked.ok).toBe(true);
    if (!booked.ok) {
      return;
    }
    createdAppointmentIds.push(booked.data.id);
    createdCustomerIds.push(booked.data.customerId);

    const removed = await deleteService(service.id);
    expect(removed.ok).toBe(false);
  });
});

describe("admin appointments", () => {
  it("creates, edits, reschedules, and cancels", async () => {
    const service = await insertTrackedService();
    const other = await createService({
      name: `Other ${randomUUID()}`,
      durationMinutes: 90,
      priceShekels: "170",
      shortDescription: "",
      isActive: true,
    });
    expect(other.ok).toBe(true);
    if (!other.ok) {
      return;
    }
    createdServiceIds.push(other.data.id);

    const noaPhone = uniquePhone();
    const created = await createAdminAppointment({
      serviceId: service.id,
      startsAt: localStart(11),
      displayName: "Noa",
      email: "noa@example.com",
      phone: noaPhone,
      note: "First visit",
      now: now.toJSDate(),
    });
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    createdAppointmentIds.push(created.data.id);
    createdCustomerIds.push(created.data.customerId);
    expect(created.data.priceCentsAtBooking).toBe(12000);
    expect(created.data.endsAt).toBe(localStart(12));

    const edited = await updateAdminAppointment({
      appointmentId: created.data.id,
      serviceId: other.data.id,
      startsAt: localStart(13),
      displayName: "Noa Cohen",
      email: "noa@example.com",
      phone: noaPhone,
      note: "Prefers quiet",
      now: now.toJSDate(),
    });
    expect(edited.ok).toBe(true);
    if (!edited.ok) {
      return;
    }
    expect(edited.data.serviceId).toBe(other.data.id);
    expect(edited.data.priceCentsAtBooking).toBe(17000);
    expect(edited.data.endsAt).toBe(localStart(14, 30));
    expect(edited.data.startsAt).toBe(localStart(13));

    const slotsAfterMove = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(slotsAfterMove.ok).toBe(true);
    if (slotsAfterMove.ok) {
      expect(
        slotsAfterMove.data.some((slot) => slot.startsAt === localStart(11)),
      ).toBe(true);
      expect(
        slotsAfterMove.data.some((slot) => slot.startsAt === localStart(13)),
      ).toBe(false);
    }

    const movedAgain = await rescheduleAppointment({
      actor: { kind: "admin" },
      appointmentId: created.data.id,
      startsAt: localStart(15),
      now: now.toJSDate(),
    });
    expect(movedAgain.ok).toBe(true);

    const cancelled = await cancelAppointment({
      actor: { kind: "admin" },
      appointmentId: created.data.id,
      now: now.toJSDate(),
    });
    expect(cancelled.ok).toBe(true);
  });

  it("rejects a conflicting appointment", async () => {
    const service = await insertTrackedService();
    const first = await createAdminAppointment({
      serviceId: service.id,
      startsAt: localStart(11),
      displayName: "Ada",
      email: "ada@example.com",
      phone: uniquePhone(),
      note: "",
      now: now.toJSDate(),
    });
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    createdAppointmentIds.push(first.data.id);
    createdCustomerIds.push(first.data.customerId);

    const second = await createAdminAppointment({
      serviceId: service.id,
      startsAt: localStart(11),
      displayName: "Ben",
      email: "ben@example.com",
      phone: uniquePhone(),
      note: "",
      now: now.toJSDate(),
    });
    expect(second.ok).toBe(false);
  });
});

describe("admin settings", () => {
  it("updates weekly hours, booking enabled, and timezone", async () => {
    const closedMonday = await updateAdminSettings({
      studioName: "Gaya",
      locationLabel: "Studio",
      instagramUrl: "",
      timezone: BUSINESS_TIME_ZONE,
      bookingEnabled: true,
      weeklyHours: {
        "0": { open: true, openTime: "09:00", closeTime: "18:00" },
        "1": { open: false, openTime: "09:00", closeTime: "18:00" },
        "2": { open: true, openTime: "09:00", closeTime: "18:00" },
        "3": { open: true, openTime: "09:00", closeTime: "18:00" },
        "4": { open: true, openTime: "09:00", closeTime: "18:00" },
        "5": { open: true, openTime: "09:00", closeTime: "14:00" },
        "6": { open: false, openTime: "09:00", closeTime: "18:00" },
      },
    });
    expect(closedMonday.ok).toBe(true);
    if (!closedMonday.ok) {
      return;
    }
    expect(closedMonday.data.weeklyHours["1"]).toBeUndefined();

    const service = await insertTrackedService();
    const monday = DateTime.fromObject(
      { year: 2099, month: 6, day: 15 },
      { zone: BUSINESS_TIME_ZONE },
    );
    const mondaySlots = await getAvailableSlots({
      serviceId: service.id,
      date: monday.toFormat("yyyy-MM-dd"),
      now: now.toJSDate(),
    });
    expect(mondaySlots.ok).toBe(true);
    if (mondaySlots.ok) {
      expect(mondaySlots.data.length).toBe(0);
    }

    const disabled = await updateAdminSettings({
      studioName: "Gaya",
      locationLabel: "",
      instagramUrl: "",
      timezone: BUSINESS_TIME_ZONE,
      bookingEnabled: false,
      weeklyHours: {
        "0": { open: true, openTime: "09:00", closeTime: "18:00" },
        "1": { open: true, openTime: "09:00", closeTime: "18:00" },
        "2": { open: true, openTime: "09:00", closeTime: "18:00" },
        "3": { open: true, openTime: "09:00", closeTime: "18:00" },
        "4": { open: true, openTime: "09:00", closeTime: "18:00" },
        "5": { open: true, openTime: "09:00", closeTime: "14:00" },
        "6": { open: false, openTime: "09:00", closeTime: "18:00" },
      },
    });
    expect(disabled.ok).toBe(true);
    const publicSlots = await getAvailableSlots({
      serviceId: service.id,
      date: "2099-06-16",
      now: now.toJSDate(),
    });
    expect(publicSlots.ok).toBe(false);
  });
});
