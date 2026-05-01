import { UserProfileForm } from "@/components/dashboard/user-profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function UserProfilePage({
  searchParams,
}: {
  searchParams?: { required?: string } | Promise<{ required?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: history }, { data: services }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_services").select("id, service_id, status, created_at").eq("user_id", user.id),
    supabase.from("services").select("id, title"),
  ]);
  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const formKey = `${profile?.id ?? "new"}-${profile?.profile_completed_at ?? "none"}-${profile?.created_at ?? "na"}`;

  const params = (searchParams instanceof Promise ? await searchParams : searchParams) ?? {};

  return (
    <div className="space-y-6">
      {params.required === "1" ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Complete your profile to continue accessing dashboard features.
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
          <CardDescription>Complete your full profile to continue using all services.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserProfileForm key={formKey} profile={profile as Profile | null} email={user.email ?? ""} />
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
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(history ?? []).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{serviceMap.get(row.service_id) ?? row.service_id}</TableCell>
                  <TableCell className="capitalize">{row.status}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
