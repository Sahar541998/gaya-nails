type BookingStepIndicatorProps = {
  steps: readonly string[];
  current: number;
  onSelect?: (index: number) => void;
};

export function BookingStepIndicator({
  steps,
  current,
  onSelect,
}: BookingStepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink/45">
      {steps.map((label, index) => {
        const isCurrent = index === current;
        const isDone = index < current;
        const canSelect = isDone && onSelect !== undefined;
        return (
          <li
            key={label}
            className={
              isCurrent ? "text-ink" : isDone ? "text-ink/70" : undefined
            }
            aria-current={isCurrent ? "step" : undefined}
          >
            {canSelect ? (
              <button
                type="button"
                className="uppercase tracking-[0.16em] rtl:tracking-normal rtl:normal-case"
                onClick={() => onSelect(index)}
              >
                {String(index + 1).padStart(2, "0")} {label}
              </button>
            ) : (
              `${String(index + 1).padStart(2, "0")} ${label}`
            )}
          </li>
        );
      })}
    </ol>
  );
}
