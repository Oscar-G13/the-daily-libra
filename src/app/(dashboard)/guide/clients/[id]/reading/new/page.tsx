import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ReadingEditor } from "@/components/guide/reading-editor";

export const metadata = { title: "New Reading" };

export default async function NewReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connection } = await (supabase as any)
    .from("guide_client_connections")
    .select("id, client_name, client_email")
    .eq("id", id)
    .eq("guide_id", user!.id)
    .single();

  if (!connection) notFound();

  const clientName = connection.client_name ?? connection.client_email.split("@")[0];

  return (
    <div className="py-4">
      <ReadingEditor clientId={id} clientName={clientName} />
    </div>
  );
}
