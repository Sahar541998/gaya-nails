import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
};

const DEFAULT_NAV: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "My Work" },
  { href: "/#services", label: "Services" },
  { href: "/#about", label: "About" },
];

type SiteHeaderProps = {
  studioName: string;
  navItems?: readonly NavItem[];
};

export function SiteHeader({
  studioName,
  navItems = DEFAULT_NAV,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-rose-line/80 bg-cream/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.28em] text-ink uppercase"
        >
          {studioName}
        </Link>
        <nav
          className="hidden items-center gap-8 text-sm tracking-wide text-ink/80 md:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/book" className="btn-primary">
            Book now
          </Link>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-sm px-2 py-1 text-sm tracking-wide text-ink ring-ink/40 focus-visible:ring-2">
              Menu
            </summary>
            <div className="absolute right-0 mt-3 w-44 border border-rose-line bg-cream p-3 shadow-sm">
              <nav className="flex flex-col gap-3 text-sm" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-ink/80"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
