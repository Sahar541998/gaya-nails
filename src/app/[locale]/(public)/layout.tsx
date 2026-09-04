import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getStudioSettings } from "@/server/site/get-studio";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const studioResult = await getStudioSettings();
  const studio = studioResult.ok
    ? studioResult.data
    : { studioName: "Gaya", locationLabel: "", instagramUrl: "" };

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader studioName={studio.studioName} />
      {children}
      <SiteFooter
        studioName={studio.studioName}
        locationLabel={studio.locationLabel}
        instagramUrl={studio.instagramUrl}
        year={new Date().getFullYear()}
      />
    </>
  );
}
