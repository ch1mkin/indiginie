import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: services }, { data: tickets }, { data: callbacks }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("user_services").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("tickets").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("callback_requests").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{profile.full_name ?? "User"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>User ID: {profile.id}</p>
          <p>Role: {profile.role}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(services ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.service_id}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(tickets ?? []).map((x) => (
              <div key={x.id} className="rounded-md border p-3 text-sm">
                <p>{x.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{x.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Callback requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(callbacks ?? []).map((x) => (
              <div key={x.id} className="rounded-md border p-3 text-sm">
                <p>{x.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{x.status}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
