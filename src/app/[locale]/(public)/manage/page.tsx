import { notFound } from "next/navigation";

import { PageIntro } from "@/components/page-intro";
import { isLocale } from "@/i18n/locales";
import { getMessages } from "@/i18n/messages";

export default async function ManagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const copy = getMessages(localeParam);

  return (
    <main id="main">
      <PageIntro
        title={copy.manage.title}
        description={copy.manage.description}
      />
    </main>
  );
}
