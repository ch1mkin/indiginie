"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { ticketTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { notifyUser } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  message: z.string().min(4),
});

export async function createTicketAction(formData: FormData): Promise<void> {
  const parsed = createSchema.safeParse({
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("tickets").insert({
    user_id: user.id,
    message: parsed.data.message,
    status: "open",
  });

  if (error) return;

  const { data: created } = await supabase
    .from("tickets")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (created?.id) {
    await supabase.from("ticket_messages").insert({
      ticket_id: created.id,
      user_id: user.id,
      message: parsed.data.message,
    });
  }

  await notifyUser(user.id, "Ticket created", "Your support ticket is now open.", "ticket");
  await sendEmail({
    to: user.email,
    subject: "Support ticket created",
    html: ticketTemplate(),
  });

  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/employee");
  await redirectWithToast("Support ticket submitted.");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "resolved"]),
});

export async function updateTicketStatusAction(input: z.infer<typeof updateSchema>): Promise<void> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tickets")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) return;

  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/employee");
}

export async function updateTicketStatusFormAction(formData: FormData): Promise<void> {
  await updateTicketStatusAction({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? "") as "open" | "resolved",
  });
  await redirectWithToast("Ticket status updated.");
}

const replySchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(2),
});

export async function replyToTicketAction(formData: FormData): Promise<void> {
  const parsed = replySchema.safeParse({
    ticketId: String(formData.get("ticketId") ?? ""),
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: ticket } = await supabase
    .from("tickets")
    .select("id, user_id")
    .eq("id", parsed.data.ticketId)
    .maybeSingle();
  if (!ticket) return;

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    user_id: user.id,
    message: parsed.data.message,
  });
  if (error) return;

  if (ticket.user_id !== user.id) {
    await notifyUser(ticket.user_id, "New ticket reply", "There is a new update on your support issue.", "ticket");
  }

  revalidatePath("/dashboard/user/support");
  revalidatePath("/dashboard/admin/tickets");
  revalidatePath("/dashboard/employee/tickets");
  await redirectWithToast("Reply sent.");
}
