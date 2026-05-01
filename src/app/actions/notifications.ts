"use server";

import { revalidatePath } from "next/cache";

import { markNotificationRead } from "@/lib/notifications";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await markNotificationRead(id);
  revalidatePath("/dashboard", "layout");
}
