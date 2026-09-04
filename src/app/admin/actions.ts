"use server";

import { revalidatePath } from "next/cache";

import { cancelAppointment } from "@/server/appointments/cancel-appointment";
import { createAdminAppointment } from "@/server/admin/create-appointment";
import { updateAdminAppointment } from "@/server/admin/update-appointment";
import {
  createBusyBlock,
  deleteBusyBlock,
  updateBusyBlock,
} from "@/server/admin/busy-blocks";
import {
  createService,
  deleteService,
  setServiceActive,
  updateService,
} from "@/server/admin/services";
import { updateAdminSettings } from "@/server/admin/settings";
import type { WeeklyHoursInput } from "@/server/admin/settings";
import { LOCALES } from "@/i18n/locales";
import { withLocale } from "@/i18n/path";

export type AdminActionState = {
  error: string;
  success: string;
};

function field(formData: FormData, name: string, fallback = ""): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : fallback;
}

function fieldNumber(formData: FormData, name: string): number {
  return Number(field(formData, name, "0"));
}

function dayHoursFromForm(
  formData: FormData,
  key: "0" | "1" | "2" | "3" | "4" | "5" | "6",
): WeeklyHoursInput["0"] {
  return {
    open: formData.get(`open-${key}`) === "on",
    openTime: field(formData, `openTime-${key}`, "09:00"),
    closeTime: field(formData, `closeTime-${key}`, "18:00"),
  };
}

function revalidateAdmin(): void {
  revalidatePath("/admin");
  for (const locale of LOCALES) {
    revalidatePath(withLocale(locale, "/"));
    revalidatePath(withLocale(locale, "/book"));
    revalidatePath(withLocale(locale, "/work"));
  }
}

export async function createAppointmentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await createAdminAppointment({
    serviceId: field(formData, "serviceId"),
    startsAt: field(formData, "startsAt"),
    displayName: field(formData, "displayName"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Appointment saved." };
}

export async function updateAppointmentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await updateAdminAppointment({
    appointmentId: field(formData, "appointmentId"),
    serviceId: field(formData, "serviceId"),
    startsAt: field(formData, "startsAt"),
    displayName: field(formData, "displayName"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Appointment updated." };
}

export async function cancelAppointmentAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await cancelAppointment({
    actor: { kind: "admin" },
    appointmentId: field(formData, "appointmentId"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Appointment cancelled." };
}

export async function createBusyBlockAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await createBusyBlock({
    startsAt: field(formData, "startsAt"),
    endsAt: field(formData, "endsAt"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Busy time saved." };
}

export async function updateBusyBlockAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await updateBusyBlock({
    id: field(formData, "id"),
    startsAt: field(formData, "startsAt"),
    endsAt: field(formData, "endsAt"),
    note: field(formData, "note"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Busy time updated." };
}

export async function deleteBusyBlockAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await deleteBusyBlock(field(formData, "id"));
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Busy time removed." };
}

export async function createServiceAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await createService({
    name: field(formData, "name"),
    durationMinutes: fieldNumber(formData, "durationMinutes"),
    priceShekels: field(formData, "priceShekels"),
    shortDescription: field(formData, "shortDescription"),
    isActive: formData.get("isActive") === "on",
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Service added." };
}

export async function updateServiceAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await updateService({
    id: field(formData, "id"),
    name: field(formData, "name"),
    durationMinutes: fieldNumber(formData, "durationMinutes"),
    priceShekels: field(formData, "priceShekels"),
    shortDescription: field(formData, "shortDescription"),
    isActive: formData.get("isActive") === "on",
    sortOrder: fieldNumber(formData, "sortOrder"),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Service updated." };
}

export async function setServiceActiveAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await setServiceActive({
    id: field(formData, "id"),
    isActive: formData.get("isActive") === "true",
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return {
    error: "",
    success: result.data.isActive
      ? "Service activated."
      : "Service deactivated.",
  };
}

export async function deleteServiceAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await deleteService(field(formData, "id"));
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Service deleted." };
}

function weeklyHoursFromForm(formData: FormData): WeeklyHoursInput {
  return {
    "0": dayHoursFromForm(formData, "0"),
    "1": dayHoursFromForm(formData, "1"),
    "2": dayHoursFromForm(formData, "2"),
    "3": dayHoursFromForm(formData, "3"),
    "4": dayHoursFromForm(formData, "4"),
    "5": dayHoursFromForm(formData, "5"),
    "6": dayHoursFromForm(formData, "6"),
  };
}

export async function updateSettingsAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const result = await updateAdminSettings({
    studioName: field(formData, "studioName"),
    locationLabel: field(formData, "locationLabel"),
    instagramUrl: field(formData, "instagramUrl"),
    timezone: field(formData, "timezone"),
    bookingEnabled: formData.get("bookingEnabled") === "on",
    weeklyHours: weeklyHoursFromForm(formData),
  });
  if (!result.ok) {
    return { error: result.error.message, success: "" };
  }
  revalidateAdmin();
  return { error: "", success: "Settings saved." };
}
