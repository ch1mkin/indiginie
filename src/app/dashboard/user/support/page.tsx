import { createCallbackRequestAction } from "@/app/actions/callbacks";
import { createTicketAction, replyToTicketAction, updateTicketStatusFormAction } from "@/app/actions/tickets";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";

export default async function UserSupportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: tickets } = await supabase.from("tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const ticketIds = (tickets ?? []).map((t) => t.id);
  const { data: messages } =
    ticketIds.length === 0
      ? { data: [] }
      : await supabase.from("ticket_messages").select("*").in("ticket_id", ticketIds).order("created_at", { ascending: true });

  const { data: callbacks } = await supabase
    .from("callback_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Raise an issue</CardTitle>
            <CardDescription>Escalations are routed to our compliance desk with full context.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createTicketAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">What should we know?</Label>
                <Textarea id="message" name="message" required minLength={4} rows={5} placeholder="Describe the issue" />
              </div>
              <Button type="submit">Submit ticket</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request a callback</CardTitle>
            <CardDescription>Share the best window to reach you — we confirm within one business day.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCallbackRequestAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cb">Message</Label>
                <Textarea id="cb" name="message" required minLength={4} rows={5} placeholder="Phone number, timezone, topic" />
              </div>
              <Button type="submit">Request callback</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Support conversations</CardTitle>
          <CardDescription>Chat-like updates for every ticket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(tickets ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            (tickets ?? []).map((ticket) => {
              const thread = (messages ?? []).filter((m) => m.ticket_id === ticket.id);
              return (
                <div key={ticket.id} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">{ticket.message}</p>
                    <StatusBadge value={ticket.status} />
                  </div>
                  <div className="space-y-2">
                    {thread.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                          msg.user_id === user.id ? "ml-auto bg-primary text-white" : "bg-muted"
                        }`}
                      >
                        {msg.message}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={replyToTicketAction} className="flex flex-1 gap-2">
                      <input type="hidden" name="ticketId" value={ticket.id} />
                      <input
                        name="message"
                        required
                        minLength={2}
                        className="border-input h-9 flex-1 rounded-md border px-3 text-sm"
                        placeholder="Write a message..."
                      />
                      <Button size="sm" type="submit">
                        Send
                      </Button>
                    </form>
                    {ticket.status === "open" ? (
                      <form action={updateTicketStatusFormAction}>
                        <input type="hidden" name="id" value={ticket.id} />
                        <input type="hidden" name="status" value="resolved" />
                        <Button size="sm" variant="outline" type="submit">
                          Resolve
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Callback history</CardTitle>
          <CardDescription>We log every outreach for auditability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(callbacks ?? []).map((cb) => (
            <div key={cb.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm">{cb.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(cb.created_at).toLocaleString()}</p>
              </div>
              <StatusBadge value={cb.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
