type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-4 px-6 py-24">
      {eyebrow === undefined ? null : (
        <p className="text-sm tracking-[0.2em] uppercase text-zinc-500">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </main>
  );
}
