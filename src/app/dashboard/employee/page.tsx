import { employeeUpdateUserServiceStatusAction } from "@/app/actions/user-services";
import { uploadDocumentAction } from "@/app/actions/documents";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assignments } = await supabase
    .from("user_services")
    .select("*")
    .eq("assigned_employee", user.id)
    .order("created_at", { ascending: false });

  const { data: services } = await supabase.from("services").select("id, title");
  const { data: profiles } = await supabase.from("profiles").select("id, full_name");

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Assigned matters</CardTitle>
          <CardDescription>Advance status and upload deliverables for your queue.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User details</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Deliverable</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(assignments ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No assignments yet — admins will route work here.
                  </TableCell>
                </TableRow>
              ) : (
                (assignments ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{profileMap.get(row.user_id) ?? row.user_id}</TableCell>
                    <TableCell>{serviceMap.get(row.service_id) ?? row.service_id}</TableCell>
                    <TableCell>
                      <StatusBadge value={row.status} />
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/employee/users/${row.user_id}`} className="text-sm font-semibold text-primary">
                        View
                      </Link>
                    </TableCell>
                    <TableCell>
                      <form action={employeeUpdateUserServiceStatusAction} className="flex flex-col gap-2">
                        <input type="hidden" name="id" value={row.id} />
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                        </select>
                        <Button size="sm" type="submit">
                          Save status
                        </Button>
                      </form>
                    </TableCell>
                    <TableCell>
                      <form action={uploadDocumentAction} className="space-y-2">
                        <input type="hidden" name="type" value="output" />
                        <input type="hidden" name="ownerUserId" value={row.user_id} />
                        <input type="hidden" name="serviceId" value={row.service_id} />
                        <Input name="file" type="file" required />
                        <Button size="sm" type="submit" variant="outline">
                          Upload output
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
