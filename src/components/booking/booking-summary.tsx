import { formatDurationMinutes, formatIlsFromCents } from "@/lib/money";
import type { Service } from "@/types/domain";

type BookingSummaryProps = {
  service: Service | null;
  dateLabel: string;
  timeLabel: string;
  displayName: string;
  email: string;
  phone: string;
  note: string;
};

export function BookingSummary({
  service,
  dateLabel,
  timeLabel,
  displayName,
  email,
  phone,
  note,
}: BookingSummaryProps) {
  return (
    <aside className="border border-rose-line bg-white p-6">
      <h2 className="text-xs tracking-[0.2em] text-ink/55 uppercase">
        Your booking
      </h2>
      {service === null ? (
        <p className="mt-4 text-sm text-ink/60">Choose a service to begin.</p>
      ) : (
        <dl className="mt-5 space-y-4 text-sm">
          <div>
            <dt className="text-xs tracking-wide text-ink/50 uppercase">
              Service
            </dt>
            <dd className="mt-1 text-ink">{service.name}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink/50 uppercase">
              Duration
            </dt>
            <dd className="mt-1 text-ink">
              {formatDurationMinutes(service.durationMinutes)}
            </dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink/50 uppercase">
              Price
            </dt>
            <dd className="mt-1 text-ink">
              {formatIlsFromCents(service.priceCents)}
            </dd>
          </div>
          {dateLabel.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Date
              </dt>
              <dd className="mt-1 text-ink">{dateLabel}</dd>
            </div>
          ) : null}
          {timeLabel.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Time
              </dt>
              <dd className="mt-1 text-ink">{timeLabel}</dd>
            </div>
          ) : null}
          {displayName.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Name
              </dt>
              <dd className="mt-1 text-ink">{displayName}</dd>
            </div>
          ) : null}
          {email.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Email
              </dt>
              <dd className="mt-1 text-ink">{email}</dd>
            </div>
          ) : null}
          {phone.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Phone
              </dt>
              <dd className="mt-1 text-ink">{phone}</dd>
            </div>
          ) : null}
          {note.length > 0 ? (
            <div>
              <dt className="text-xs tracking-wide text-ink/50 uppercase">
                Note
              </dt>
              <dd className="mt-1 text-ink">{note}</dd>
            </div>
          ) : null}
        </dl>
      )}
    </aside>
  );
}
