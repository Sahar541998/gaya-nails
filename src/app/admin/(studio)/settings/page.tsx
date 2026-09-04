import { AdminSettingsForm } from "@/components/admin/admin-settings-form";
import { getAdminSettings } from "@/server/admin/settings";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings();
  if (!settings.ok) {
    return <p>Could not load settings.</p>;
  }

  return (
    <main id="main" className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl text-ink">Settings</h1>
        <p className="mt-2 text-sm text-ink/65">
          Weekly hours and booking enabled change what customers can book.
        </p>
      </div>
      <AdminSettingsForm settings={settings.data} />
    </main>
  );
}
