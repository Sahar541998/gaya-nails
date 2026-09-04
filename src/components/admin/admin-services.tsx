"use client";

import { useActionState } from "react";

import {
  createServiceAction,
  deleteServiceAction,
  setServiceActiveAction,
  updateServiceAction,
  type AdminActionState,
} from "@/app/admin/actions";
import { shekelsInputFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

const initial: AdminActionState = { error: "", success: "" };

export function AdminCreateServiceForm() {
  const [state, action, pending] = useActionState(createServiceAction, initial);

  return (
    <form
      action={action}
      className="grid gap-4 border border-rose-line bg-white p-5"
    >
      <h2 className="font-display text-2xl text-ink">Add service</h2>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Name
        <input className="field-input mt-2" name="name" required />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Price (₪)
        <input className="field-input mt-2" name="priceShekels" required />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Duration (minutes)
        <input
          className="field-input mt-2"
          type="number"
          name="durationMinutes"
          min={5}
          max={480}
          required
          defaultValue={60}
        />
      </label>
      <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
        Short description
        <textarea
          className="field-input mt-2 min-h-24"
          name="shortDescription"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="isActive" defaultChecked />
        Active and bookable
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
        {pending ? "Saving…" : "Add service"}
      </button>
    </form>
  );
}

type ServiceRowProps = {
  service: Service;
};

export function AdminServiceRow({ service }: ServiceRowProps) {
  const [state, action, pending] = useActionState(updateServiceAction, initial);
  const [activeState, activeAction] = useActionState(
    setServiceActiveAction,
    initial,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteServiceAction,
    initial,
  );

  return (
    <article className="border border-rose-line bg-white p-5">
      <form action={action} className="grid gap-4">
        <input type="hidden" name="id" value={service.id} />
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Name
          <input
            className="field-input mt-2"
            name="name"
            required
            defaultValue={service.name}
          />
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
            Price (₪)
            <input
              className="field-input mt-2"
              name="priceShekels"
              required
              defaultValue={shekelsInputFromCents(service.priceCents)}
            />
          </label>
          <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
            Duration
            <input
              className="field-input mt-2"
              type="number"
              name="durationMinutes"
              min={5}
              max={480}
              required
              defaultValue={service.durationMinutes}
            />
          </label>
          <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
            Order
            <input
              className="field-input mt-2"
              type="number"
              name="sortOrder"
              min={0}
              required
              defaultValue={service.sortOrder}
            />
          </label>
        </div>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Short description
          <textarea
            className="field-input mt-2 min-h-24"
            name="shortDescription"
            defaultValue={service.shortDescription}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={service.isActive}
          />
          Active and bookable
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
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={activeAction}>
          <input type="hidden" name="id" value={service.id} />
          <input
            type="hidden"
            name="isActive"
            value={service.isActive ? "false" : "true"}
          />
          <button className="btn-secondary min-h-11" type="submit">
            {service.isActive ? "Deactivate" : "Activate"}
          </button>
        </form>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={service.id} />
          <button className="btn-secondary min-h-11" type="submit">
            Delete
          </button>
        </form>
      </div>
      {activeState.error.length > 0 || deleteState.error.length > 0 ? (
        <p role="alert" className="mt-3 text-sm text-ink">
          {activeState.error || deleteState.error}
        </p>
      ) : null}
    </article>
  );
}
