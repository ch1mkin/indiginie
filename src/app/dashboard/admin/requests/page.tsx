import { adminUpdateUserServiceAction } from "@/app/actions/user-services";
import { deleteUserServiceAction } from "@/app/actions/user-services";
import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatLabel } from "@/lib/format";

export default async function AdminRequestsPage() {
  const supabase = await createClient();

  const [{ data: requests }, { data: services }, { data: profiles }] = await Promise.all([
    supabase.from("user_services").select("*").order("created_at", { ascending: false }),
    supabase.from("services").select("id, title"),
    supabase.from("profiles").select("id, full_name, role"),
  ]);

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const employees = (profiles ?? []).filter((p) => p.role === "employee");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service requests</CardTitle>
        <CardDescription>Assign operators and advance client engagements.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Call</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead className="text-right">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(requests ?? []).map((row) => {
              const client = profileMap.get(row.user_id);
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{client?.full_name ?? row.user_id}</TableCell>
                  <TableCell>{serviceMap.get(row.service_id) ?? row.service_id}</TableCell>
                  <TableCell>
                    <StatusBadge value={row.status} />
                  </TableCell>
                  <TableCell className="text-sm">{row.call_completed ? "Call done" : "Pending"}</TableCell>
                  <TableCell className="text-sm">{formatLabel(row.payment_status ?? "not_paid")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.whatsapp_country_code && row.whatsapp_number
                      ? `${row.whatsapp_country_code} ${row.whatsapp_number}`
                      : "N/A"}
                    <br />
                    {row.preferred_call_time && row.preferred_call_timezone
                      ? `${row.preferred_call_time} · ${row.preferred_call_timezone}`
                      : "No time shared"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.assigned_employee
                      ? profileMap.get(row.assigned_employee)?.full_name ?? row.assigned_employee
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Link href="/dashboard/admin/documents" className="text-sm font-semibold text-primary">
                      View files
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={adminUpdateUserServiceAction} className="inline-flex flex-col items-end gap-2">
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
                      <select
                        name="assignedEmployeeId"
                        defaultValue={row.assigned_employee ?? ""}
                        className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.full_name ?? emp.id}
                          </option>
                        ))}
                      </select>
                      <select
                        name="paymentStatus"
                        defaultValue={row.payment_status ?? "not_paid"}
                        className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="not_paid">Not paid</option>
                        <option value="paid">Paid</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input type="checkbox" name="callCompleted" defaultChecked={Boolean(row.call_completed)} />
                        Call has been done
                      </label>
                      <Button size="sm" type="submit">
                        Save
                      </Button>
                    </form>
                    <form action={deleteUserServiceAction} className="mt-2 inline-flex">
                      <input type="hidden" name="id" value={row.id} />
                      <Button size="sm" type="submit" variant="destructive">
                        Delete request
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
