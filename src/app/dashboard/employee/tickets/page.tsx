import { replyToTicketAction, updateTicketStatusFormAction } from "@/app/actions/tickets";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeTicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: assignments } = await supabase
    .from("user_services")
    .select("user_id")
    .eq("assigned_employee", user.id);

  const clientIds = Array.from(new Set((assignments ?? []).map((a) => a.user_id)));

  const { data: tickets } =
    clientIds.length === 0
      ? { data: [] }
      : await supabase.from("tickets").select("*").in("user_id", clientIds).order("created_at", { ascending: false });
  const ticketIds = (tickets ?? []).map((t) => t.id);
  const { data: messages } =
    ticketIds.length === 0
      ? { data: [] }
      : await supabase.from("ticket_messages").select("*").in("ticket_id", ticketIds).order("created_at", { ascending: true });

  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client tickets</CardTitle>
        <CardDescription>Issues raised by clients you actively support.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(tickets ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  No tickets for your roster yet.
                </TableCell>
              </TableRow>
            ) : (
              (tickets ?? []).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{profileMap.get(ticket.user_id) ?? ticket.user_id}</TableCell>
                  <TableCell className="max-w-md text-sm">{ticket.message}</TableCell>
                  <TableCell>
                    <StatusBadge value={ticket.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-y-2">
                    <form action={replyToTicketAction} className="flex items-center justify-end gap-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input
                        name="message"
                        required
                        minLength={2}
                        placeholder="Reply..."
                        className="border-input h-8 w-48 rounded-md border px-2 text-xs"
                      />
                      <Button size="sm" type="submit">
                        Reply
                      </Button>
                    </form>
                    {ticket.status === "open" ? (
                      <form action={updateTicketStatusFormAction} className="inline">
                        <input type="hidden" name="id" value={ticket.id} />
                        <input type="hidden" name="status" value="resolved" />
                        <Button size="sm" variant="outline" type="submit">
                          Resolve
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">Closed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardContent className="space-y-3">
        {ticketIds.map((id) => {
          const thread = (messages ?? []).filter((m) => m.ticket_id === id);
          if (thread.length === 0) return null;
          return (
            <div key={id} className="rounded-lg border p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Conversation</p>
              <div className="space-y-2">
                {thread.map((m) => (
                  <div key={m.id} className="rounded bg-muted px-3 py-2 text-sm">
                    {m.message}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
