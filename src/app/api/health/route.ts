import { pingDatabase } from "@/da/postgres/client";

export async function GET() {
  try {
    const database = await pingDatabase();
    return Response.json({ ok: true, database });
  } catch {
    return Response.json({ ok: true, database: false }, { status: 503 });
  }
}
