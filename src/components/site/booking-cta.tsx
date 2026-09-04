import Link from "next/link";

export function BookingCta() {
  return (
    <section className="border-y border-rose-line bg-blush/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-5 py-16 md:px-8 md:py-20">
        <h2 className="font-display text-3xl text-ink md:text-5xl">
          Ready for your next set?
        </h2>
        <p className="text-base text-ink/70">Book your appointment.</p>
        <Link href="/book" className="btn-primary">
          Book now
        </Link>
      </div>
    </section>
  );
}
