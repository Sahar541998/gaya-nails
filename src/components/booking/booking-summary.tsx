import { eyebrowClass, labelTrackingClass, type Locale } from "@/i18n/locales";
import type { Messages } from "@/i18n/messages";
import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

type BookingSummaryProps = {
  locale: Locale;
  copy: Messages["book"];
  service: Service | null;
  dateLabel: string;
  timeLabel: string;
  displayName: string;
  email: string;
  phone: string;
  note: string;
};

export function BookingSummary({
  locale,
  copy,
  service,
  dateLabel,
  timeLabel,
  displayName,
  email,
  phone,
  note,
}: BookingSummaryProps) {
  const labelClass = `text-xs text-ink/50 ${labelTrackingClass(locale)}`;

  return (
    <aside className="border border-rose-line bg-white p-6">
      <h2 className={`text-xs text-ink/55 ${eyebrowClass(locale)}`}>
        {copy.summaryTitle}
      </h2>
      {service === null ? (
        <p className="mt-4 text-sm text-ink/60">{copy.summaryEmpty}</p>
      ) : (
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className={labelClass}>{copy.steps.service}</dt>
            <dd className="mt-1 text-ink">{service.name}</dd>
          </div>
          <div>
            <dt className={labelClass}>{copy.duration}</dt>
            <dd className="mt-1 text-ink">
              {formatDurationMinutes(service.durationMinutes, locale)}
            </dd>
          </div>
          <div>
            <dt className={labelClass}>{copy.price}</dt>
            <dd className="mt-1 text-ink">
              {formatIlsFromCents(service.priceCents)}
            </dd>
          </div>
          {dateLabel.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.date}</dt>
              <dd className="mt-1 text-ink">{dateLabel}</dd>
            </div>
          ) : null}
          {timeLabel.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.time}</dt>
              <dd className="mt-1 text-ink">{timeLabel}</dd>
            </div>
          ) : null}
          {displayName.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.name}</dt>
              <dd className="mt-1 text-ink">{displayName}</dd>
            </div>
          ) : null}
          {email.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.email}</dt>
              <dd className="mt-1 text-ink">{email}</dd>
            </div>
          ) : null}
          {phone.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.phone}</dt>
              <dd className="mt-1 text-ink">{phone}</dd>
            </div>
          ) : null}
          {note.length > 0 ? (
            <div>
              <dt className={labelClass}>{copy.note}</dt>
              <dd className="mt-1 text-ink">{note}</dd>
            </div>
          ) : null}
        </dl>
      )}
    </aside>
  );
}
