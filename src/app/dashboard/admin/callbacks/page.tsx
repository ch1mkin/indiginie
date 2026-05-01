import { updateCallbackStatusFormAction } from "@/app/actions/callbacks";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCallbacksPage() {
  const supabase = await createClient();
  const { data: callbacks } = await supabase
    .from("callback_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Callback requests</CardTitle>
        <CardDescription>Mark outreach once your team connects.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="text-right">Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(callbacks ?? []).map((cb) => (
              <TableRow key={cb.id}>
                <TableCell className="font-medium">{profileMap.get(cb.user_id) ?? cb.user_id}</TableCell>
                <TableCell className="max-w-md text-sm">{cb.message}</TableCell>
                <TableCell>
                  <StatusBadge value={cb.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(cb.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {cb.status === "pending" ? (
                    <form action={updateCallbackStatusFormAction} className="inline">
                      <input type="hidden" name="id" value={cb.id} />
                      <input type="hidden" name="status" value="contacted" />
                      <Button size="sm" variant="outline" type="submit">
                        Mark contacted
                      </Button>
                    </form>
                  ) : (
                    <span className="text-xs text-muted-foreground">Logged</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
