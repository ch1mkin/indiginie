"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { redirectWithToast } from "@/lib/actions/redirect-toast";
import { callbackTemplate } from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/send";
import { notifyUser } from "@/lib/notifications";
import { createClient } from "@/lib/supabase/server";

const createSchema = z.object({
  message: z.string().min(4),
});

export async function createCallbackRequestAction(formData: FormData): Promise<void> {
  const parsed = createSchema.safeParse({
    message: String(formData.get("message") ?? ""),
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("callback_requests").insert({
    user_id: user.id,
    message: parsed.data.message,
    status: "pending",
  });

  if (error) return;
  await notifyUser(user.id, "Callback requested", "We will contact you shortly.", "callback");
  await sendEmail({
    to: user.email,
    subject: "Callback request received",
    html: callbackTemplate(),
  });

  revalidatePath("/dashboard/user");
  revalidatePath("/dashboard/admin");
  await redirectWithToast("Callback request submitted.");
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "contacted"]),
});

export async function updateCallbackStatusAction(input: z.infer<typeof updateSchema>): Promise<void> {
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("callback_requests")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id);

  if (error) return;

  const { data: row } = await supabase
    .from("callback_requests")
    .select("user_id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (row?.user_id) {
    await notifyUser(
      row.user_id,
      "Callback status updated",
      `Your callback request is now ${parsed.data.status}.`,
      "callback"
    );
  }

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/user");
}

export async function updateCallbackStatusFormAction(formData: FormData): Promise<void> {
  await updateCallbackStatusAction({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? "") as "pending" | "contacted",
  });
  await redirectWithToast("Callback status updated.");
}
