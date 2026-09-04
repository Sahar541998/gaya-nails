"use client";

import { useActionState } from "react";

import {
  cancelAppointmentAction,
  deleteBusyBlockAction,
  updateAppointmentAction,
  updateBusyBlockAction,
  type AdminActionState,
} from "@/app/admin/actions";
import { toDateTimeLocalInput } from "@/lib/business-time";
import type { Service } from "@/types/domain";
import type {
  CalendarAppointmentEvent,
  CalendarBusyEvent,
} from "@/types/admin-calendar";

const initial: AdminActionState = { error: "", success: "" };

type AppointmentEditorProps = {
  event: CalendarAppointmentEvent;
  services: readonly Service[];
  timezone: string;
};

export function AdminAppointmentEditor({
  event,
  services,
  timezone,
}: AppointmentEditorProps) {
  const [state, action, pending] = useActionState(
    updateAppointmentAction,
    initial,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelAppointmentAction,
    initial,
  );
  const options = services.filter(
    (service) => service.isActive || service.id === event.serviceId,
  );

  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="appointmentId" value={event.id} />
        <p className="text-sm text-ink/65">
          {event.status === "cancelled" ? "Cancelled" : "Confirmed"} ·{" "}
          {event.serviceName}
        </p>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Service
          <select
            className="field-input mt-2"
            name="serviceId"
            required
            defaultValue={event.serviceId}
            disabled={event.status !== "confirmed"}
          >
            {options.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
                {service.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Start
          <input
            className="field-input mt-2"
            type="datetime-local"
            name="startsAt"
            required
            defaultValue={toDateTimeLocalInput(event.startsAt, timezone)}
            disabled={event.status !== "confirmed"}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Customer name
          <input
            className="field-input mt-2"
            name="displayName"
            required
            defaultValue={event.customerName}
            disabled={event.status !== "confirmed"}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Email
          <input
            className="field-input mt-2"
            type="email"
            name="email"
            required
            defaultValue={event.customerEmail}
            disabled={event.status !== "confirmed"}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Phone
          <input
            className="field-input mt-2"
            name="phone"
            required
            defaultValue={event.customerPhone}
            disabled={event.status !== "confirmed"}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Notes
          <textarea
            className="field-input mt-2 min-h-24"
            name="note"
            defaultValue={event.note}
            disabled={event.status !== "confirmed"}
          />
        </label>
        {state.error.length > 0 ? (
          <p role="alert" className="text-sm text-ink">
            {state.error}
          </p>
        ) : null}
        {state.success.length > 0 ? (
          <p className="text-sm text-ink/70">{state.success}</p>
        ) : null}
        {event.status === "confirmed" ? (
          <button
            className="btn-primary min-h-11"
            type="submit"
            disabled={pending}
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        ) : null}
      </form>
      {event.status === "confirmed" ? (
        <form action={cancelAction}>
          <input type="hidden" name="appointmentId" value={event.id} />
          {cancelState.error.length > 0 ? (
            <p role="alert" className="mb-3 text-sm text-ink">
              {cancelState.error}
            </p>
          ) : null}
          <button
            className="btn-secondary min-h-11 w-full"
            type="submit"
            disabled={cancelPending}
          >
            Cancel appointment
          </button>
        </form>
      ) : null}
    </div>
  );
}

type BusyEditorProps = {
  event: CalendarBusyEvent;
  timezone: string;
};

export function AdminBusyEditor({ event, timezone }: BusyEditorProps) {
  const [state, action, pending] = useActionState(
    updateBusyBlockAction,
    initial,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBusyBlockAction,
    initial,
  );

  return (
    <div className="grid gap-6">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="id" value={event.id} />
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Start
          <input
            className="field-input mt-2"
            type="datetime-local"
            name="startsAt"
            required
            defaultValue={toDateTimeLocalInput(event.startsAt, timezone)}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          End
          <input
            className="field-input mt-2"
            type="datetime-local"
            name="endsAt"
            required
            defaultValue={toDateTimeLocalInput(event.endsAt, timezone)}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Private note
          <textarea
            className="field-input mt-2 min-h-24"
            name="note"
            defaultValue={event.note}
          />
        </label>
        {state.error.length > 0 ? (
          <p role="alert" className="text-sm text-ink">
            {state.error}
          </p>
        ) : null}
        {state.success.length > 0 ? (
          <p className="text-sm text-ink/70">{state.success}</p>
        ) : null}
        <button
          className="btn-primary min-h-11"
          type="submit"
          disabled={pending}
        >
          {pending ? "Saving…" : "Save busy time"}
        </button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={event.id} />
        {deleteState.error.length > 0 ? (
          <p role="alert" className="mb-3 text-sm text-ink">
            {deleteState.error}
          </p>
        ) : null}
        <button
          className="btn-secondary min-h-11 w-full"
          type="submit"
          disabled={deletePending}
        >
          Delete busy time
        </button>
      </form>
    </div>
  );
}
