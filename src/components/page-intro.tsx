type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-4 px-6 py-24">
      {eyebrow === undefined ? null : (
        <p className="text-sm tracking-[0.2em] text-ink/50 uppercase">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl tracking-tight text-ink">{title}</h1>
      <p className="text-lg leading-8 text-ink/70">{description}</p>
    </div>
  );
}
