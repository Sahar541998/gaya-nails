"use client";

import { useState, useTransition } from "react";

import {
  loadBookingSlotsAction,
  sendBookingCodeAction,
  submitBookingAction,
  verifyBookingPhoneAction,
} from "@/app/(public)/book/actions";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingStepIndicator } from "@/components/booking/booking-step-indicator";
import { BookingSummary } from "@/components/booking/booking-summary";
import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

const STEPS = ["Service", "Time", "Details", "Review"] as const;

type OpenDate = {
  date: string;
  label: string;
};

type SlotOption = {
  startsAt: string;
  endsAt: string;
  timeLabel: string;
};

type BookingFlowProps = {
  services: readonly Service[];
  openDates: readonly OpenDate[];
  timezone: string;
};

type FieldErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
  note?: string;
  code?: string;
};

export function BookingFlow({
  services,
  openDates,
  timezone,
}: BookingFlowProps) {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [slots, setSlots] = useState<readonly SlotOption[]>([]);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState<{
    serviceName: string;
    dateLabel: string;
    timeLabel: string;
    durationMinutes: number;
    priceCents: number;
  } | null>(null);

  const service = services.find((item) => item.id === serviceId) ?? null;
  const dateLabel = openDates.find((item) => item.date === date)?.label ?? "";
  const timeLabel = slot?.timeLabel ?? "";

  function resetSchedule() {
    setDate(null);
    setSlot(null);
    setSlots([]);
    setSlotsMessage("");
  }

  function selectService(id: string) {
    setServiceId(id);
    resetSchedule();
    setFormError("");
  }

  function selectDate(nextDate: string) {
    if (serviceId === null) {
      return;
    }
    setDate(nextDate);
    setSlot(null);
    setSlotsMessage("");
    startTransition(async () => {
      const result = await loadBookingSlotsAction(serviceId, nextDate);
      if (!result.ok) {
        setSlots([]);
        setSlotsMessage(result.message);
        return;
      }
      setSlots(result.data);
      setSlotsMessage(
        result.data.length === 0
          ? "No times are open on this day. Try another date."
          : "",
      );
    });
  }

  function validateDetails(): boolean {
    const next: FieldErrors = {};
    if (displayName.trim().length < 2) {
      next.displayName = "Enter your name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (phone.trim().length < 8) {
      next.phone = "Enter a valid phone number.";
    }
    if (note.length > 500) {
      next.note = "Keep the note under 500 characters.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  function sendCode() {
    if (!validateDetails()) {
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await sendBookingCodeAction(phone);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setCodeSent(true);
      setPhoneVerified(false);
    });
  }

  function verifyCode() {
    if (code.trim().length < 4) {
      setFieldErrors((current) => ({
        ...current,
        code: "Enter the code from your message.",
      }));
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await verifyBookingPhoneAction(phone, code);
      if (!result.ok) {
        setFieldErrors((current) => ({ ...current, code: result.message }));
        return;
      }
      setFieldErrors((current) => {
        const { code: _code, ...rest } = current;
        void _code;
        return rest;
      });
      setPhoneVerified(true);
    });
  }

  function submitBooking() {
    if (serviceId === null || slot === null) {
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await submitBookingAction({
        serviceId,
        startsAt: slot.startsAt,
        displayName,
        email,
        phone,
        note,
      });
      if (!result.ok) {
        setFormError(result.message);
        if (
          result.code === "SLOT_UNAVAILABLE" ||
          result.code === "TIME_BLOCKED" ||
          result.code === "INVALID_TIME"
        ) {
          setStep(1);
          setSlot(null);
        }
        return;
      }
      setConfirmation({
        serviceName: result.data.serviceName,
        dateLabel,
        timeLabel,
        durationMinutes: result.data.durationMinutes,
        priceCents: result.data.priceCents,
      });
    });
  }

  if (confirmation !== null) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <BookingConfirmation {...confirmation} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <p className="text-xs tracking-[0.28em] text-ink/60 uppercase">Book</p>
      <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
        Your next set
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
        Choose a service, pick an open time, and we’ll confirm your appointment.
      </p>
      <div className="mt-8">
        <BookingStepIndicator steps={STEPS} current={step} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div>
          {formError.length > 0 ? (
            <p className="mb-6 text-sm text-ink" role="alert">
              {formError}
            </p>
          ) : null}

          {step === 0 ? (
            <fieldset>
              <legend className="font-display text-2xl text-ink">
                Choose a service
              </legend>
              <div className="mt-6 divide-y divide-rose-line">
                {services.map((item) => {
                  const selected = item.id === serviceId;
                  return (
                    <label
                      key={item.id}
                      className={`flex w-full cursor-pointer flex-col gap-1 py-5 text-left ${
                        selected ? "bg-blush/50 px-4" : "px-0"
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        className="sr-only"
                        checked={selected}
                        onChange={() => selectService(item.id)}
                        value={item.id}
                      />
                      <span className="flex items-baseline justify-between gap-4">
                        <span className="text-lg text-ink">{item.name}</span>
                        <span className="text-lg text-ink">
                          {formatIlsFromCents(item.priceCents)}
                        </span>
                      </span>
                      {item.shortDescription.length > 0 ? (
                        <span className="text-sm text-ink/65">
                          {item.shortDescription}
                        </span>
                      ) : null}
                      <span className="text-xs tracking-wide text-ink/50 uppercase">
                        {formatDurationMinutes(item.durationMinutes)}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-8">
                <button
                  type="button"
                  className="btn-primary"
                  disabled={serviceId === null}
                  onClick={() => setStep(1)}
                >
                  Continue
                </button>
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">
                Choose a date and time
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                Times are shown in the studio timezone.
                <span className="sr-only"> {timezone}</span>
              </p>
              {openDates.length === 0 ? (
                <p className="mt-6 text-sm text-ink/65">
                  No booking dates are open right now.
                </p>
              ) : (
                <fieldset className="mt-6 flex gap-2 overflow-x-auto pb-2">
                  <legend className="sr-only">Date</legend>
                  {openDates.map((item) => {
                    const selected = item.date === date;
                    return (
                      <label
                        key={item.date}
                        className={`min-w-28 shrink-0 cursor-pointer border px-3 py-3 text-left text-sm ${
                          selected
                            ? "border-ink bg-blush/60"
                            : "border-rose-line bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="booking-date"
                          className="sr-only"
                          checked={selected}
                          value={item.date}
                          onChange={() => selectDate(item.date)}
                        />
                        {item.label}
                      </label>
                    );
                  })}
                </fieldset>
              )}
              <div className="mt-8" aria-live="polite">
                {pending && date !== null ? (
                  <p className="text-sm text-ink/60">Loading times…</p>
                ) : null}
                {slotsMessage.length > 0 ? (
                  <p className="text-sm text-ink/65">{slotsMessage}</p>
                ) : null}
                {slots.length > 0 ? (
                  <fieldset className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    <legend className="sr-only">Time</legend>
                    {slots.map((item) => {
                      const selected = item.startsAt === slot?.startsAt;
                      return (
                        <label
                          key={item.startsAt}
                          className={`cursor-pointer px-3 py-3 text-center text-sm ${
                            selected
                              ? "bg-ink text-cream"
                              : "border border-rose-line bg-white text-ink"
                          }`}
                        >
                          <input
                            type="radio"
                            name="booking-time"
                            className="sr-only"
                            checked={selected}
                            value={item.startsAt}
                            onChange={() => setSlot(item)}
                          />
                          {item.timeLabel}
                        </label>
                      );
                    })}
                  </fieldset>
                ) : null}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(0)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={slot === null}
                  onClick={() => setStep(2)}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <form
              className="flex max-w-md flex-col gap-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (!phoneVerified) {
                  if (!codeSent) {
                    sendCode();
                    return;
                  }
                  verifyCode();
                  return;
                }
                setStep(3);
              }}
            >
              <h2 className="font-display text-2xl text-ink">Your details</h2>
              <div>
                <label htmlFor="booking-name" className="text-sm text-ink">
                  Name
                </label>
                <input
                  id="booking-name"
                  className="field-input mt-2"
                  name="name"
                  autoComplete="name"
                  value={displayName}
                  aria-invalid={fieldErrors.displayName !== undefined}
                  aria-describedby={
                    fieldErrors.displayName !== undefined
                      ? "booking-name-error"
                      : undefined
                  }
                  onChange={(event) => setDisplayName(event.target.value)}
                />
                {fieldErrors.displayName !== undefined ? (
                  <p
                    id="booking-name-error"
                    className="mt-1 text-sm text-ink"
                    role="alert"
                  >
                    {fieldErrors.displayName}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="booking-email" className="text-sm text-ink">
                  Email
                </label>
                <input
                  id="booking-email"
                  className="field-input mt-2"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  aria-invalid={fieldErrors.email !== undefined}
                  aria-describedby={
                    fieldErrors.email !== undefined
                      ? "booking-email-error"
                      : undefined
                  }
                  onChange={(event) => setEmail(event.target.value)}
                />
                {fieldErrors.email !== undefined ? (
                  <p
                    id="booking-email-error"
                    className="mt-1 text-sm text-ink"
                    role="alert"
                  >
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="booking-phone" className="text-sm text-ink">
                  Phone
                </label>
                <input
                  id="booking-phone"
                  className="field-input mt-2"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  aria-invalid={fieldErrors.phone !== undefined}
                  aria-describedby={
                    fieldErrors.phone !== undefined
                      ? "booking-phone-error"
                      : undefined
                  }
                  onChange={(event) => {
                    setPhone(event.target.value);
                    setPhoneVerified(false);
                    setCodeSent(false);
                    setCode("");
                  }}
                />
                {fieldErrors.phone !== undefined ? (
                  <p
                    id="booking-phone-error"
                    className="mt-1 text-sm text-ink"
                    role="alert"
                  >
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="booking-note" className="text-sm text-ink">
                  Note <span className="text-ink/50">(optional)</span>
                </label>
                <textarea
                  id="booking-note"
                  className="field-input mt-2 min-h-24"
                  name="note"
                  value={note}
                  aria-invalid={fieldErrors.note !== undefined}
                  aria-describedby={
                    fieldErrors.note !== undefined
                      ? "booking-note-error"
                      : undefined
                  }
                  onChange={(event) => setNote(event.target.value)}
                />
                {fieldErrors.note !== undefined ? (
                  <p
                    id="booking-note-error"
                    className="mt-1 text-sm text-ink"
                    role="alert"
                  >
                    {fieldErrors.note}
                  </p>
                ) : null}
              </div>
              {codeSent && !phoneVerified ? (
                <div>
                  <label htmlFor="booking-code" className="text-sm text-ink">
                    Verification code
                  </label>
                  <input
                    id="booking-code"
                    className="field-input mt-2"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    aria-invalid={fieldErrors.code !== undefined}
                    aria-describedby={
                      fieldErrors.code !== undefined
                        ? "booking-code-error"
                        : undefined
                    }
                    onChange={(event) => setCode(event.target.value)}
                  />
                  {fieldErrors.code !== undefined ? (
                    <p
                      id="booking-code-error"
                      className="mt-1 text-sm text-ink"
                      role="alert"
                    >
                      {fieldErrors.code}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {phoneVerified ? (
                <p className="text-sm text-ink/70">Phone number confirmed.</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={pending}
                >
                  {phoneVerified
                    ? "Continue"
                    : codeSent
                      ? "Verify"
                      : "Send code"}
                </button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">Review</h2>
              <p className="mt-2 text-sm text-ink/65">
                Confirm the service, time, and your details before booking.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={pending}
                  onClick={submitBooking}
                >
                  {pending ? "Booking…" : "Confirm booking"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="lg:sticky lg:top-24">
          <BookingSummary
            service={service}
            dateLabel={dateLabel}
            timeLabel={timeLabel}
            displayName={displayName}
            email={email}
            phone={phone}
            note={note}
          />
        </div>
      </div>
    </div>
  );
}
