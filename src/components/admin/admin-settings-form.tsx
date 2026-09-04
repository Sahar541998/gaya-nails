"use client";

import { useActionState } from "react";

import {
  updateSettingsAction,
  type AdminActionState,
} from "@/app/admin/actions";
import type { BusinessSettings } from "@/types/domain";

const initial: AdminActionState = { error: "", success: "" };

const days = [
  { key: "0", label: "Sunday" },
  { key: "1", label: "Monday" },
  { key: "2", label: "Tuesday" },
  { key: "3", label: "Wednesday" },
  { key: "4", label: "Thursday" },
  { key: "5", label: "Friday" },
  { key: "6", label: "Saturday" },
] as const;

type AdminSettingsFormProps = {
  settings: BusinessSettings;
};

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    initial,
  );

  return (
    <form action={action} className="grid gap-8">
      <section className="grid gap-4 border border-rose-line bg-white p-5">
        <h2 className="font-display text-2xl text-ink">Studio</h2>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Studio name
          <input
            className="field-input mt-2"
            name="studioName"
            required
            defaultValue={settings.studioName}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Location label
          <input
            className="field-input mt-2"
            name="locationLabel"
            defaultValue={settings.locationLabel}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Instagram URL
          <input
            className="field-input mt-2"
            name="instagramUrl"
            defaultValue={settings.instagramUrl}
          />
        </label>
        <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
          Timezone
          <input
            className="field-input mt-2"
            name="timezone"
            required
            defaultValue={settings.timezone}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            name="bookingEnabled"
            defaultChecked={settings.bookingEnabled}
          />
          Public booking enabled
        </label>
      </section>

      <section className="grid gap-4 border border-rose-line bg-white p-5">
        <h2 className="font-display text-2xl text-ink">Weekly hours</h2>
        <p className="text-sm text-ink/65">
          Uncheck a day to close it. These hours control public availability on
          /book.
        </p>
        <ul className="grid gap-4">
          {days.map((day) => {
            const hours = settings.weeklyHours[day.key];
            const open = hours !== undefined;
            return (
              <li
                key={day.key}
                className="grid gap-3 border-t border-rose-line pt-4 md:grid-cols-[8rem_auto_1fr_1fr] md:items-end"
              >
                <p className="text-sm text-ink">{day.label}</p>
                <label className="flex min-h-11 items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    name={`open-${day.key}`}
                    defaultChecked={open}
                  />
                  Open
                </label>
                <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
                  Opens
                  <input
                    className="field-input mt-2"
                    type="time"
                    name={`openTime-${day.key}`}
                    defaultValue={hours?.open ?? "09:00"}
                  />
                </label>
                <label className="text-xs tracking-[0.16em] text-ink/55 uppercase">
                  Closes
                  <input
                    className="field-input mt-2"
                    type="time"
                    name={`closeTime-${day.key}`}
                    defaultValue={hours?.close ?? "18:00"}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {state.error.length > 0 ? (
        <p role="alert" className="text-sm text-ink">
          {state.error}
        </p>
      ) : null}
      {state.success.length > 0 ? (
        <p className="text-sm text-ink/70">{state.success}</p>
      ) : null}
      <button
        className="btn-primary min-h-11 w-fit"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
