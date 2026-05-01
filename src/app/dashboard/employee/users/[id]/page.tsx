import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: profile }, { data: docs }, { data: tickets }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("documents").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("tickets").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
  ]);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{profile.full_name ?? "Client profile"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">User ID: {profile.id}</CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(docs ?? []).map((d) => (
            <div key={d.id} className="rounded border p-2 text-sm">
              {d.file_url}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent tickets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(tickets ?? []).map((t) => (
            <div key={t.id} className="rounded border p-2 text-sm">
              {t.message}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
