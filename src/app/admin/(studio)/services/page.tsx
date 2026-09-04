import {
  AdminCreateServiceForm,
  AdminServiceRow,
} from "@/components/admin/admin-services";
import { listAdminServices } from "@/server/admin/services";

export default async function AdminServicesPage() {
  const services = await listAdminServices();
  if (!services.ok) {
    return <p>Could not load services.</p>;
  }

  return (
    <main id="main" className="grid gap-8">
      <div>
        <h1 className="font-display text-4xl text-ink">Services</h1>
        <p className="mt-2 text-sm text-ink/65">
          Prices, durations, and descriptions come from the database and appear
          immediately on the public site and /book.
        </p>
      </div>
      <AdminCreateServiceForm />
      <div className="grid gap-6">
        {services.data.map((service) => (
          <AdminServiceRow key={service.id} service={service} />
        ))}
      </div>
    </main>
  );
}
