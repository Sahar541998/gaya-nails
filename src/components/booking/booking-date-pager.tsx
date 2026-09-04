const DAYS_PER_PAGE = 7;

type DateOption = {
  date: string;
  label: string;
  weekdayLabel: string;
  dayLabel: string;
  monthLabel: string;
  bookable: boolean;
};

type BookingDatePagerProps = {
  dates: readonly DateOption[];
  selectedDate: string | null;
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (date: string) => void;
};

export function weekPageCount(dateCount: number): number {
  if (dateCount === 0) {
    return 0;
  }
  return Math.ceil(dateCount / DAYS_PER_PAGE);
}

export function datesForWeekPage(
  dates: readonly DateOption[],
  page: number,
): readonly DateOption[] {
  const start = page * DAYS_PER_PAGE;
  return dates.slice(start, start + DAYS_PER_PAGE);
}

function weekCaption(days: readonly DateOption[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (first === undefined || last === undefined) {
    return "";
  }
  if (first.monthLabel === last.monthLabel) {
    return `${first.dayLabel}–${last.dayLabel} ${first.monthLabel}`;
  }
  return `${first.dayLabel} ${first.monthLabel} – ${last.dayLabel} ${last.monthLabel}`;
}

export function BookingDatePager({
  dates,
  selectedDate,
  page,
  onPageChange,
  onSelect,
}: BookingDatePagerProps) {
  const visible = datesForWeekPage(dates, page);
  const lastPage = Math.max(weekPageCount(dates.length) - 1, 0);
  const canPrev = page > 0;
  const canNext = page < lastPage;

  return (
    <div className="mt-6">
      <p className="mb-2 text-center text-xs tracking-wide text-ink/50">
        {weekCaption(visible)}
      </p>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-lg leading-none text-ink/70 disabled:text-ink/20"
          aria-label="Previous week"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        <div className="grid min-w-0 flex-1 grid-cols-7 gap-1">
          {Array.from({ length: DAYS_PER_PAGE }, (_, index) => {
            const item = visible[index];
            if (item === undefined) {
              return <span key={`empty-${String(index)}`} />;
            }
            const selected = item.date === selectedDate;
            return (
              <button
                key={item.date}
                type="button"
                aria-pressed={selected}
                aria-label={item.label}
                disabled={!item.bookable}
                className={`min-h-11 min-w-0 px-0.5 py-1 text-center ${
                  !item.bookable
                    ? "border border-transparent text-ink/30"
                    : selected
                      ? "border border-ink bg-blush/60"
                      : "border border-rose-line bg-white"
                }`}
                onClick={() => onSelect(item.date)}
              >
                <span className="block text-[0.58rem] tracking-[0.12em] uppercase opacity-60">
                  {item.weekdayLabel}
                </span>
                <span className="mt-0.5 block text-sm">{item.dayLabel}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-lg leading-none text-ink/70 disabled:text-ink/20"
          aria-label="Next week"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
