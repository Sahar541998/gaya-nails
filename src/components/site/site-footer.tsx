import Link from "next/link";

type SiteFooterProps = {
  studioName: string;
  locationLabel: string;
  instagramUrl: string;
  year: number;
};

export function SiteFooter({
  studioName,
  locationLabel,
  instagramUrl,
  year,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-rose-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="space-y-2">
          <p className="font-display text-lg tracking-[0.24em] text-ink uppercase">
            {studioName}
          </p>
          {locationLabel.length > 0 ? (
            <p className="text-sm text-ink/65">{locationLabel}</p>
          ) : (
            <p className="text-sm text-ink/45">Location coming soon</p>
          )}
          {instagramUrl.length > 0 ? (
            <a
              href={instagramUrl}
              className="text-sm text-ink/70"
              rel="noopener noreferrer"
              target="_blank"
            >
              Instagram
            </a>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Link href="/book" className="btn-primary">
            Book now
          </Link>
          <p className="text-xs text-ink/45">
            © {year} {studioName}
          </p>
        </div>
      </div>
    </footer>
  );
}
