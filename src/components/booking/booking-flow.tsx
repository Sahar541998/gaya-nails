"use client";

import { useRef, useState, useTransition } from "react";

import {
  loadBookingSlotsAction,
  sendBookingCodeAction,
  submitBookingAction,
  verifyBookingPhoneAction,
} from "@/server/booking/customer-actions";
import { BookingConfirmation } from "@/components/booking/booking-confirmation";
import { BookingDatePager } from "@/components/booking/booking-date-pager";
import { BookingStepIndicator } from "@/components/booking/booking-step-indicator";
import { BookingSummary } from "@/components/booking/booking-summary";
import { eyebrowClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";
import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

type OpenDate = {
  date: string;
  label: string;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  bookable: boolean;
};

type SlotOption = {
  startsAt: string;
  endsAt: string;
  timeLabel: string;
};

type BookingCopy = Messages["book"];

type BookingFlowProps = {
  locale: Locale;
  copy: BookingCopy;
  homeHref: string;
  services: readonly Service[];
  openDates: readonly OpenDate[];
  timezone: string;
  initialServiceId?: string;
  initialDate?: string;
  initialSlots?: readonly SlotOption[];
  initialSlotsMessage?: string;
};

type FieldErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
  note?: string;
  code?: string;
};

const EMPTY_SLOTS: readonly SlotOption[] = [];

function actionMessage(copy: BookingCopy, code: string | undefined): string {
  switch (code) {
    case "unauthorized":
    case "validation":
    case "rate_limited":
    case "unavailable":
    case "conflict":
    case "SLOT_UNAVAILABLE":
    case "TIME_BLOCKED":
    case "INVALID_TIME":
    case "BOOKING_DISABLED":
    case "SERVICE_NOT_FOUND":
    case "SERVICE_INACTIVE":
    case "OUTSIDE_BUSINESS_HOURS":
      return copy.errors[code];
    default:
      return copy.errors.generic;
  }
}

export function BookingFlow({
  locale,
  copy,
  homeHref,
  services,
  openDates,
  timezone,
  initialServiceId,
  initialDate,
  initialSlots = EMPTY_SLOTS,
  initialSlotsMessage = "",
}: BookingFlowProps) {
  const steps = [
    copy.steps.service,
    copy.steps.time,
    copy.steps.details,
    copy.steps.review,
  ];
  const presetService =
    initialServiceId !== undefined &&
    services.some((item) => item.id === initialServiceId)
      ? initialServiceId
      : null;
  const [step, setStep] = useState(presetService === null ? 0 : 1);
  const [serviceId, setServiceId] = useState<string | null>(presetService);
  const [date, setDate] = useState<string | null>(initialDate ?? null);
  const [datePage, setDatePage] = useState(0);
  const [slot, setSlot] = useState<SlotOption | null>(null);
  const [slots, setSlots] = useState<readonly SlotOption[]>(initialSlots);
  const [slotsMessage, setSlotsMessage] = useState(initialSlotsMessage);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const slotsRequestRef = useRef(0);
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

  function loadSlotsFor(nextServiceId: string, nextDate: string) {
    const requestId = slotsRequestRef.current + 1;
    slotsRequestRef.current = requestId;
    setDate(nextDate);
    setSlot(null);
    setSlots([]);
    setSlotsMessage("");
    setSlotsLoading(true);
    void loadBookingSlotsAction(nextServiceId, nextDate)
      .then((result) => {
        if (requestId !== slotsRequestRef.current) {
          return;
        }
        setSlotsLoading(false);
        if (!result.ok) {
          setSlots([]);
          setSlotsMessage(actionMessage(copy, result.code));
          return;
        }
        setSlots(result.data);
        setSlotsMessage(result.data.length === 0 ? copy.noTimes : "");
      })
      .catch(() => {
        if (requestId !== slotsRequestRef.current) {
          return;
        }
        setSlotsLoading(false);
        setSlots([]);
        setSlotsMessage(copy.loadTimesFailed);
      });
  }

  function selectService(id: string) {
    setServiceId(id);
    setFormError("");
    const firstDate = openDates.find((item) => item.bookable);
    if (firstDate === undefined) {
      resetSchedule();
      setDatePage(0);
      setStep(1);
      return;
    }
    setDatePage(0);
    loadSlotsFor(id, firstDate.date);
    setStep(1);
  }

  function selectDate(nextDate: string) {
    if (serviceId === null) {
      return;
    }
    const option = openDates.find((item) => item.date === nextDate);
    if (option === undefined || !option.bookable) {
      return;
    }
    loadSlotsFor(serviceId, nextDate);
  }

  function validateDetails(): boolean {
    const next: FieldErrors = {};
    if (displayName.trim().length < 2) {
      next.displayName = copy.nameInvalid;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = copy.emailInvalid;
    }
    if (phone.trim().length < 8) {
      next.phone = copy.phoneInvalid;
    }
    if (note.length > 500) {
      next.note = copy.noteInvalid;
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
        setFormError(actionMessage(copy, result.code));
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
        code: copy.codeInvalid,
      }));
      return;
    }
    setFormError("");
    startTransition(async () => {
      const result = await verifyBookingPhoneAction(phone, code);
      if (!result.ok) {
        setFieldErrors((current) => ({
          ...current,
          code: actionMessage(copy, result.code),
        }));
        return;
      }
      setFieldErrors((current) => {
        const { code: _code, ...rest } = current;
        void _code;
        return rest;
      });
      setPhoneVerified(true);
      setStep(3);
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
        setFormError(actionMessage(copy, result.code));
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
        <BookingConfirmation
          locale={locale}
          copy={copy}
          homeHref={homeHref}
          {...confirmation}
        />
      </div>
    );
  }

  const timeHint =
    date === null
      ? copy.pickDateHint
      : slot === null && slots.length > 0
        ? copy.pickTimeHint
        : "";

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <p className={`text-xs text-ink/60 ${eyebrowClass(locale)}`}>
        {copy.eyebrow}
      </p>
      <h1 className="font-display mt-3 text-4xl text-ink md:text-5xl">
        {copy.heading}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-ink/70">
        {copy.intro}
      </p>
      <div className="mt-8">
        <BookingStepIndicator steps={steps} current={step} onSelect={setStep} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div>
          {formError.length > 0 ? (
            <p className="mb-6 text-sm text-ink" role="alert">
              {formError}
            </p>
          ) : null}

          {step === 0 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">
                {copy.chooseServiceTitle}
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                {copy.chooseServiceHint}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {services.map((item) => {
                  const selected = item.id === serviceId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      className={`flex w-full flex-col gap-1 border px-4 py-5 text-start touch-manipulation ${
                        selected
                          ? "border-ink bg-blush/70"
                          : "border-rose-line bg-white"
                      }`}
                      onClick={() => selectService(item.id)}
                    >
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
                      <span className="mt-2 flex items-center justify-between gap-3 text-xs text-ink/50">
                        <span>
                          {formatDurationMinutes(item.durationMinutes, locale)}
                        </span>
                        <span className="text-ink">{copy.select}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">
                {copy.chooseTimeTitle}
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                {copy.chooseTimeHint}
                <span className="sr-only"> {timezone}</span>
              </p>
              {openDates.every((item) => !item.bookable) ? (
                <p className="mt-6 text-sm text-ink/65">{copy.noDates}</p>
              ) : (
                <BookingDatePager
                  dates={openDates}
                  selectedDate={date}
                  page={datePage}
                  onPageChange={setDatePage}
                  onSelect={selectDate}
                  previousLabel={copy.previousWeek}
                  nextLabel={copy.nextWeek}
                />
              )}
              <div className="mt-8" aria-live="polite">
                {slotsLoading ? (
                  <p className="text-sm text-ink/60">{copy.loadingTimes}</p>
                ) : null}
                {slotsMessage.length > 0 ? (
                  <p className="text-sm text-ink/65">{slotsMessage}</p>
                ) : null}
                {timeHint.length > 0 && slotsMessage.length === 0 ? (
                  <p className="mb-3 text-sm text-ink/60">{timeHint}</p>
                ) : null}
                {slots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slots.map((item) => {
                      const selected = item.startsAt === slot?.startsAt;
                      return (
                        <button
                          key={item.startsAt}
                          type="button"
                          aria-pressed={selected}
                          className={`px-3 py-3 text-sm ${
                            selected
                              ? "bg-ink text-cream"
                              : "border border-rose-line bg-white text-ink"
                          }`}
                          onClick={() => setSlot(item)}
                        >
                          {item.timeLabel}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(0)}
                >
                  {copy.back}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={slot === null}
                  onClick={() => setStep(2)}
                >
                  {copy.continue}
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
              <h2 className="font-display text-2xl text-ink">
                {copy.detailsTitle}
              </h2>
              <p className="text-sm text-ink/60">{copy.detailsHint}</p>
              <div>
                <label htmlFor="booking-name" className="text-sm text-ink">
                  {copy.name}
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
                  {copy.email}
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
                  {copy.phone}
                </label>
                <input
                  id="booking-phone"
                  className="field-input mt-2"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0501234567"
                  value={phone}
                  aria-invalid={fieldErrors.phone !== undefined}
                  aria-describedby={
                    fieldErrors.phone !== undefined
                      ? "booking-phone-error"
                      : "booking-phone-hint"
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
                ) : (
                  <p
                    id="booking-phone-hint"
                    className="mt-1 text-sm text-ink/50"
                  >
                    {copy.phoneHint}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="booking-note" className="text-sm text-ink">
                  {copy.note}{" "}
                  <span className="text-ink/50">{copy.optional}</span>
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
                    {copy.verificationCode}
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
                        : "booking-code-hint"
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
                  ) : (
                    <p
                      id="booking-code-hint"
                      className="mt-1 text-sm text-ink/50"
                    >
                      {copy.codeHint}
                    </p>
                  )}
                </div>
              ) : null}
              {phoneVerified ? (
                <p className="text-sm text-ink/70">{copy.phoneConfirmed}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                >
                  {copy.back}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={pending}
                >
                  {phoneVerified
                    ? copy.continue
                    : codeSent
                      ? pending
                        ? copy.verifying
                        : copy.verify
                      : pending
                        ? copy.sending
                        : copy.sendCode}
                </button>
                {codeSent && !phoneVerified ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={pending}
                    onClick={sendCode}
                  >
                    {copy.resendCode}
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="font-display text-2xl text-ink">
                {copy.reviewTitle}
              </h2>
              <p className="mt-2 text-sm text-ink/65">{copy.reviewHint}</p>
              <div className="mt-6 max-w-md lg:hidden">
                <BookingSummary
                  locale={locale}
                  copy={copy}
                  service={service}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                  displayName={displayName}
                  email={email}
                  phone={phone}
                  note={note}
                />
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep(2)}
                >
                  {copy.back}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={pending || slot === null || !phoneVerified}
                  onClick={submitBooking}
                >
                  {pending ? copy.booking : copy.confirm}
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div
          className={
            step === 3
              ? "hidden lg:sticky lg:top-24 lg:block"
              : "lg:sticky lg:top-24"
          }
        >
          <BookingSummary
            locale={locale}
            copy={copy}
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
