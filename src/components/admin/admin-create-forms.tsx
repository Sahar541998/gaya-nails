"use client";

import { useActionState } from "react";

import {
  createAppointmentAction,
  createBusyBlockAction,
  type AdminActionState,
} from "@/app/admin/actions";
import type { Service } from "@/types/domain";

const initial: AdminActionState = { error: "", success: "" };

type AppointmentFormProps = {
  services: readonly Service[];
  defaultStartsAt: string;
};

export function AdminAppointmentForm({
  services,
  defaultStartsAt,
}: AppointmentFormProps) {
  const [state, action, pending] = useActionState(
    createAppointmentAction,
    initial,
  );
  const active = services.filter((service) => service.isActive);

  return (
    <form action={action} className="grid gap-4">
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Service
        <select
          className="field-input mt-2"
          name="serviceId"
          required
          defaultValue={active[0]?.id ?? ""}
        >
          {active.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
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
          defaultValue={defaultStartsAt}
        />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Customer name
        <input className="field-input mt-2" name="displayName" required />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Email
        <input
          className="field-input mt-2"
          type="email"
          name="email"
          required
        />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Phone
        <input className="field-input mt-2" name="phone" required />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Notes
        <textarea className="field-input mt-2 min-h-24" name="note" />
      </label>
      {state.error.length > 0 ? (
        <p role="alert" className="text-sm text-ink">
          {state.error}
        </p>
      ) : null}
      {state.success.length > 0 ? (
        <p className="text-sm text-ink/70">{state.success}</p>
      ) : null}
      <button className="btn-primary min-h-11" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save appointment"}
      </button>
    </form>
  );
}

type BusyFormProps = {
  defaultStartsAt: string;
  defaultEndsAt: string;
};

export function AdminBusyForm({
  defaultStartsAt,
  defaultEndsAt,
}: BusyFormProps) {
  const [state, action, pending] = useActionState(
    createBusyBlockAction,
    initial,
  );

  return (
    <form action={action} className="grid gap-4">
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Start
        <input
          className="field-input mt-2"
          type="datetime-local"
          name="startsAt"
          required
          defaultValue={defaultStartsAt}
        />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        End
        <input
          className="field-input mt-2"
          type="datetime-local"
          name="endsAt"
          required
          defaultValue={defaultEndsAt}
        />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Private note
        <textarea className="field-input mt-2 min-h-24" name="note" />
      </label>
      {state.error.length > 0 ? (
        <p role="alert" className="text-sm text-ink">
          {state.error}
        </p>
      ) : null}
      {state.success.length > 0 ? (
        <p className="text-sm text-ink/70">{state.success}</p>
      ) : null}
      <button className="btn-primary min-h-11" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Block time"}
      </button>
    </form>
  );
}
