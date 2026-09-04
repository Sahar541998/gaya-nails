type BookingStepIndicatorProps = {
  steps: readonly string[];
  current: number;
};

export function BookingStepIndicator({
  steps,
  current,
}: BookingStepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-x-4 gap-y-2 text-xs tracking-[0.16em] text-ink/45 uppercase">
      {steps.map((label, index) => {
        const isCurrent = index === current;
        const isDone = index < current;
        return (
          <li
            key={label}
            className={
              isCurrent ? "text-ink" : isDone ? "text-ink/70" : undefined
            }
            aria-current={isCurrent ? "step" : undefined}
          >
            {String(index + 1).padStart(2, "0")} {label}
          </li>
        );
      })}
    </ol>
  );
}
