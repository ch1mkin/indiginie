import Link from "next/link";

import { adminUpdateUserRoleAction } from "@/app/actions/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>Directory of every profile. Promote roles directly in Supabase SQL for now.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Search key</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>User id</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(profiles ?? []).map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.full_name ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{(profile.full_name ?? "").toLowerCase()}</TableCell>
                <TableCell>
                  <form action={adminUpdateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={profile.id} />
                    <select
                      name="role"
                      defaultValue={profile.role}
                      className="border-input bg-background h-8 rounded-md border px-2 text-xs"
                    >
                      <option value="user">User</option>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button size="sm" type="submit">
                      Save
                    </Button>
                  </form>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(profile.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{profile.id}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/dashboard/admin/users/${profile.id}`} className="text-sm font-semibold text-primary">
                    View details
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
