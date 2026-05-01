import { createClient } from "@/lib/supabase/server";

export async function notifyUser(userId: string, title: string, body: string, category = "general") {
  const supabase = await createClient();
  await supabase.from("notifications").insert({ user_id: userId, title, body, category });
}

export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
}
